"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EgrulSyncService = void 0;
/**
 * Service: EGRUL Sync
 *
 * @remarks
 * Основной сервис синхронизации. Делегирует выполнение этапов SyncOrchestrator.
 * Поддерживает HTTP Range resume для прерванных загрузок.
 *
 * Staging + Transform Pattern:
 * - Raw FTM entities → Staging tables
 * - Transform service → Production tables
 * - MV auto-aggregation → Read views
 *
 * Memory reduced 28x: 5.6GB → ~200MB.
 */
const readline_1 = __importDefault(require("readline"));
const constants_1 = require("../config/constants");
const batch_flusher_service_1 = require("./services/batch-flusher.service");
const stream_tracker_service_1 = require("./services/stream-tracker.service");
const sync_error_handler_service_1 = require("./services/sync-error-handler.service");
const sync_orchestrator_factory_1 = require("./services/sync-orchestrator.factory");
/**
 * Основной сервис синхронизации EGRUL данных
 *
 * @remarks
 * Staging + Transform Pattern:
 * - Parse → Staging tables (raw FTM data)
 * - Transform → Production tables (resolved IDs)
 * - MV auto-aggregation → Read views
 */
class EgrulSyncService {
    httpClient;
    repository;
    parser;
    identityMapping;
    denormalization;
    merger;
    resumeStorage;
    flusher;
    tracker;
    errorHandler;
    orchestrator;
    stagingSync;
    currentDumpUrl = null;
    constructor(httpClient, repository, parser, stagingStorage, stagingSync, syncStateStorage, progressReporter, identityMapping, denormalization, merger, enrichment, resumeStorage) {
        this.httpClient = httpClient;
        this.repository = repository;
        this.parser = parser;
        this.identityMapping = identityMapping;
        this.denormalization = denormalization;
        this.merger = merger;
        this.resumeStorage = resumeStorage;
        this.flusher = new batch_flusher_service_1.BatchFlusher(repository, stagingStorage);
        this.stagingSync = stagingSync;
        this.tracker = new stream_tracker_service_1.StreamTracker(progressReporter);
        this.errorHandler = new sync_error_handler_service_1.SyncErrorHandler(progressReporter);
        this.orchestrator = (0, sync_orchestrator_factory_1.createSyncOrchestrator)({
            identityMapping,
            denormalization,
            merger,
            repository,
            syncStateStorage,
            progressReporter,
            enrichment
        });
    }
    /**
     * Выполняет полную синхронизацию EGRUL данных
     *
     * @remarks
     * Staging Flow: Parse → Staging → Transform → Production → MV
     */
    async run(options = {}) {
        const { enableEnrichment = false, useResume = true, abortSignal, forceFullSync = false } = options;
        const state = (0, batch_flusher_service_1.createEmptyBatchState)();
        let processedRecords = 0;
        let totalLinesScanned = 0;
        try {
            this.reportProgress('running', 0, 'Инициализация синхронизации...');
            const dumpUrl = await this.httpClient.fetchDownloadUrl();
            this.currentDumpUrl = dumpUrl;
            console.log(`Found FTM download URL: ${dumpUrl}`);
            this.reportProgress('running', 1, 'Загрузка данных OpenSanctions началась...');
            const response = (useResume && this.resumeStorage)
                ? await this.httpClient.fetchStreamWithResume(dumpUrl)
                : await this.httpClient.fetchStream(dumpUrl);
            const rl = readline_1.default.createInterface({
                input: response.data,
                crlfDelay: Infinity
            });
            for await (const line of rl) {
                if (abortSignal?.aborted) {
                    await this.handleAbort(state);
                    throw new Error('EGRUL sync aborted');
                }
                if (!line.trim())
                    continue;
                totalLinesScanned++;
                await this.tracker.handleLine(totalLinesScanned);
                if (totalLinesScanned === 1 || totalLinesScanned % 100000 === 0) {
                    console.log(`[PROGRESS] Line ${totalLinesScanned}: length=${line.length}`);
                }
                try {
                    const entity = JSON.parse(line);
                    const parsed = this.parser.parseEntity(entity);
                    if (!parsed)
                        continue;
                    this.addToBatch(state, parsed);
                    if (this.parser.isCompanyRow(parsed)) {
                        processedRecords++;
                        if (processedRecords === 1) {
                            console.log('[DIAG] First company row:', JSON.stringify(parsed, null, 2));
                        }
                    }
                    await this.flusher.flushBatchesIfNeeded(state, constants_1.DEFAULT_BATCH_SIZE);
                }
                catch (e) {
                    console.error(`[ERROR] Parse error at line ${totalLinesScanned}:`, e);
                }
            }
            await this.flusher.flushAllBatches(state);
            await this.orchestrator.executeAll({
                forceFullSync,
                enableEnrichment,
                processedRecords
            });
            if (this.currentDumpUrl && this.resumeStorage) {
                await this.resumeStorage.clear(this.currentDumpUrl);
            }
            this.reportProgress('completed', 100, `Успешно: загружено ${processedRecords.toLocaleString()} компаний`);
            console.log('EGRUL (OpenSanctions) sync completed!');
        }
        catch (error) {
            await this.errorHandler.handleError(error);
            throw error;
        }
        finally {
            this.currentDumpUrl = null;
        }
    }
    /**
     * Добавляет распаршенную сущность в соответствующий батч
     *
     * @remarks
     * Staging Pattern: Direct insert to production, relationships to staging.
     */
    addToBatch(state, parsed) {
        if (this.parser.isCompanyRow(parsed)) {
            state.companies.push(parsed);
        }
        else if (this.parser.isStagingCompanyRow(parsed)) {
            state.stagingCompanies.push(parsed);
        }
        else if (this.parser.isStagingDirectorshipRow(parsed)) {
            state.directorships.push(parsed);
        }
        else if (this.parser.isStagingOwnershipRow(parsed)) {
            state.ownerships.push(parsed);
        }
    }
    reportProgress(status, percentage, message) {
        console.log(`[${status.toUpperCase()}] ${percentage}% - ${message}`);
    }
    /**
     * Обрабатывает abort синхронизации
     */
    async handleAbort(state) {
        console.log('Handling EGRUL sync abort...');
        this.reportProgress('deleting', 0, 'Удаление частично загруженных данных...');
        await this.repository.clearPartialData();
        await this.stagingSync.clearStaging();
        if (this.currentDumpUrl && this.resumeStorage) {
            await this.resumeStorage.clear(this.currentDumpUrl);
        }
        this.reportProgress('idle', 0, 'Операция отменена');
        console.log('EGRUL sync abort handled');
    }
}
exports.EgrulSyncService = EgrulSyncService;
