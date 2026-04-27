"use strict";
/**
 * Оркестратор синхронизации данных
 *
 * @remarks
 * Основная бизнес-логика синхронизации.
 * Координирует чтение Parquet, запись в ClickHouse и чекпоинты.
 * Следует SRP: отвечает за координацию, делегирует чекпоинты CheckpointManager.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncOrchestrator = void 0;
const types_1 = require("../types");
/**
 * Оркестратор синхронизации
 */
class SyncOrchestrator {
    reader;
    storage;
    reporter;
    mapper;
    config;
    checkpoint;
    REPORT_THROTTLE_MS = 200;
    REPORT_PERCENT_THRESHOLD = 0.1;
    currentYear = null;
    currentProcessed = 0;
    currentTotalRows = 0;
    lastReportTime = 0;
    lastReportedPercentage = 0;
    constructor(reader, storage, reporter, mapper, config, checkpoint) {
        this.reader = reader;
        this.storage = storage;
        this.reporter = reporter;
        this.mapper = mapper;
        this.config = config;
        this.checkpoint = checkpoint;
    }
    /**
     * Выполняет синхронизацию за указанный год
     *
     * @remarks
     * Загружает чекпоинт для resume, проверяет целостность,
     * восстанавливает прогресс с места останова.
     */
    async syncYear(year, abortSignal) {
        const url = this.getParquetUrl(year);
        this.initializeContext(year);
        console.log(`--- STARTING RFSD SYNC FOR ${year} ---`);
        try {
            const resumeState = await this.checkpoint.loadOrReset(year);
            await this.reportInitialProgress(year, resumeState.initialPercentage, resumeState.startFrom);
            await this.ensureTableExists();
            const totalRows = await this.reader.countRows(url);
            this.currentTotalRows = totalRows;
            console.log(`Total rows to process: ${totalRows}`);
            if (resumeState.isResuming) {
                console.log(`Resuming from row ${resumeState.startFrom}`);
            }
            await this.processStream(year, url, totalRows, resumeState, abortSignal);
            console.log(`Sync for ${year} completed.`);
            await this.reportFinalProgress(year, totalRows);
            await this.checkpoint.clear(year);
        }
        catch (error) {
            await this.handleError(year, error);
            throw error;
        }
        finally {
            this.clearContext();
        }
    }
    /**
     * Явно сохраняет текущий чекпоинт
     *
     * @remarks
     * Вызывается при graceful shutdown.
     */
    async saveCheckpoint() {
        if (this.currentYear === null || this.currentProcessed === 0) {
            return;
        }
        await this.checkpoint.save(this.currentYear, this.currentProcessed, this.currentTotalRows);
    }
    /**
     * Инициализирует контекст синхронизации
     */
    initializeContext(year) {
        this.currentYear = year;
        this.currentProcessed = 0;
        this.currentTotalRows = 0;
    }
    /**
     * Очищает контекст синхронизации
     */
    clearContext() {
        this.currentYear = null;
        this.currentProcessed = 0;
        this.currentTotalRows = 0;
    }
    /**
     * Убеждается что таблица существует
     */
    async ensureTableExists() {
        const columns = await this.reader.describe(this.getParquetUrl(this.currentYear));
        const columnDefs = this.mapper.mapDescribeResults(columns);
        console.log('Ensuring table exists in ClickHouse...');
        await this.storage.ensureTable(columnDefs);
    }
    /**
     * Обрабатывает поток данных из Parquet
     *
     * @remarks
     * Пропускает уже обработанные строки при resume.
     * Сохраняет чекпоинт по интервалу.
     */
    async processStream(year, url, totalRows, resumeState, abortSignal) {
        let batch = [];
        let processed = resumeState.startFrom;
        let skipped = 0;
        this.lastReportTime = Date.now();
        this.lastReportedPercentage = resumeState.initialPercentage;
        for await (const row of this.reader.streamRows(url)) {
            if (abortSignal.aborted) {
                throw new types_1.SyncAbortedError();
            }
            if (skipped < resumeState.startFrom) {
                skipped++;
                continue;
            }
            batch.push(this.mapper.mapRow(row));
            processed++;
            this.currentProcessed = processed;
            if (batch.length >= this.config.batchSize) {
                await this.storage.insertBatch(batch);
                batch = [];
                const percentage = (processed / totalRows) * 100;
                await this.reportProgressIfNeeded(year, percentage, processed);
                await this.saveCheckpointIfNeeded(year, processed, totalRows);
            }
        }
        if (batch.length > 0) {
            await this.storage.insertBatch(batch);
        }
    }
    /**
     * Отчитывает о прогрессе с throttling
     *
     * @remarks
     * Отчёт отправляется если:
     * - Прошло > 200мс с последнего отчёта ИЛИ
     * - Процент изменился > 0.1%
     */
    async reportProgressIfNeeded(year, percentage, processed) {
        const now = Date.now();
        const timeSinceLastReport = now - this.lastReportTime;
        const percentSinceLastReport = Math.abs(percentage - this.lastReportedPercentage);
        if (timeSinceLastReport > this.REPORT_THROTTLE_MS || percentSinceLastReport > this.REPORT_PERCENT_THRESHOLD) {
            await this.reportProgress(year, percentage, processed);
            this.lastReportTime = now;
            this.lastReportedPercentage = percentage;
        }
    }
    /**
     * Сохраняет чекпоинт если нужно
     */
    async saveCheckpointIfNeeded(year, processed, totalRows) {
        if (this.checkpoint.shouldSave(processed)) {
            await this.checkpoint.save(year, processed, totalRows);
        }
    }
    /**
     * Отчитывает о начальном прогрессе
     */
    async reportInitialProgress(year, initialPercentage, resumeProcessed) {
        await this.reporter.clearError(year);
        await this.reportProgress(year, initialPercentage, resumeProcessed);
    }
    /**
     * Отчитывает о прогрессе
     */
    async reportProgress(year, percentage, processed) {
        const progress = {
            status: 'running',
            percentage,
            rows_processed: processed,
            timestamp: new Date().toISOString()
        };
        await this.reporter.report(year, progress);
    }
    /**
     * Отчитывается о финальном прогрессе
     *
     * @remarks
     * Вызывается после успешного завершения синхронизации.
     */
    async reportFinalProgress(year, totalRows) {
        const progress = {
            status: 'completed',
            percentage: 100,
            rows_processed: totalRows,
            completed_at: new Date().toISOString()
        };
        await this.reporter.report(year, progress);
    }
    /**
     * Обрабатывает ошибку синхронизации
     *
     * @remarks
     * При abort:
     * 1. Устанавливает статус 'aborting' (UI показывает indeterminate)
     * 2. Удаляет частично загруженные данные
     * 3. Устанавливает статус 'idle'
     */
    async handleError(year, error) {
        if (error instanceof types_1.SyncAbortedError) {
            console.log(`Sync aborted, initiating abort sequence...`);
            const lastPercentage = (this.currentTotalRows > 0)
                ? (this.currentProcessed / this.currentTotalRows) * 100
                : 0;
            // 1. Сообщаем о начале остановки
            await this.reporter.report(year, {
                status: 'aborting',
                percentage: lastPercentage,
                rows_processed: this.currentProcessed,
                timestamp: new Date().toISOString()
            });
            // 2. Удаляем частично загруженные данные
            console.log(`Deleting partial data for year ${year}...`);
            await this.storage.deleteByYear(year);
            await this.checkpoint.clear(year);
            // 3. Возвращаем в idle
            await this.reporter.report(year, {
                status: 'idle',
                percentage: 0,
                rows_processed: 0,
                timestamp: new Date().toISOString()
            });
            console.log(`Abort sequence completed for year ${year}`);
        }
        else {
            console.error(`Sync error:`, error);
            await this.reporter.report(year, {
                status: 'error',
                percentage: 0,
                rows_processed: 0,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    /**
     * Получает URL Parquet файла для года
     */
    getParquetUrl(year) {
        return `https://huggingface.co/datasets/irlspbru/RFSD/resolve/main/RFSD/year=${year}/part-0.parquet`;
    }
}
exports.SyncOrchestrator = SyncOrchestrator;
