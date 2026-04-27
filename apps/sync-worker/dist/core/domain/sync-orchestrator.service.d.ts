/**
 * Оркестратор синхронизации данных
 *
 * @remarks
 * Основная бизнес-логика синхронизации.
 * Координирует чтение Parquet, запись в ClickHouse и чекпоинты.
 * Следует SRP: отвечает за координацию, делегирует чекпоинты CheckpointManager.
 */
import type { IParquetReader, IClickHouseStorage, IProgressReporter } from '../ports';
import type { SyncConfig } from '../types';
import { ColumnMapper } from './column-mapper.service';
import { CheckpointManager } from './checkpoint-manager.service';
/**
 * Оркестратор синхронизации
 */
export declare class SyncOrchestrator {
    private readonly reader;
    private readonly storage;
    private readonly reporter;
    private readonly mapper;
    private readonly config;
    private readonly checkpoint;
    private readonly REPORT_THROTTLE_MS;
    private readonly REPORT_PERCENT_THRESHOLD;
    private currentYear;
    private currentProcessed;
    private currentTotalRows;
    private lastReportTime;
    private lastReportedPercentage;
    constructor(reader: IParquetReader, storage: IClickHouseStorage, reporter: IProgressReporter, mapper: ColumnMapper, config: SyncConfig, checkpoint: CheckpointManager);
    /**
     * Выполняет синхронизацию за указанный год
     *
     * @remarks
     * Загружает чекпоинт для resume, проверяет целостность,
     * восстанавливает прогресс с места останова.
     */
    syncYear(year: number, abortSignal: AbortSignal): Promise<void>;
    /**
     * Явно сохраняет текущий чекпоинт
     *
     * @remarks
     * Вызывается при graceful shutdown.
     */
    saveCheckpoint(): Promise<void>;
    /**
     * Инициализирует контекст синхронизации
     */
    private initializeContext;
    /**
     * Очищает контекст синхронизации
     */
    private clearContext;
    /**
     * Убеждается что таблица существует
     */
    private ensureTableExists;
    /**
     * Обрабатывает поток данных из Parquet
     *
     * @remarks
     * Пропускает уже обработанные строки при resume.
     * Сохраняет чекпоинт по интервалу.
     */
    private processStream;
    /**
     * Отчитывает о прогрессе с throttling
     *
     * @remarks
     * Отчёт отправляется если:
     * - Прошло > 200мс с последнего отчёта ИЛИ
     * - Процент изменился > 0.1%
     */
    private reportProgressIfNeeded;
    /**
     * Сохраняет чекпоинт если нужно
     */
    private saveCheckpointIfNeeded;
    /**
     * Отчитывает о начальном прогрессе
     */
    private reportInitialProgress;
    /**
     * Отчитывает о прогрессе
     */
    private reportProgress;
    /**
     * Отчитывается о финальном прогрессе
     *
     * @remarks
     * Вызывается после успешного завершения синхронизации.
     */
    private reportFinalProgress;
    /**
     * Обрабатывает ошибку синхронизации
     *
     * @remarks
     * При abort:
     * 1. Устанавливает статус 'aborting' (UI показывает indeterminate)
     * 2. Удаляет частично загруженные данные
     * 3. Устанавливает статус 'idle'
     */
    private handleError;
    /**
     * Получает URL Parquet файла для года
     */
    private getParquetUrl;
}
