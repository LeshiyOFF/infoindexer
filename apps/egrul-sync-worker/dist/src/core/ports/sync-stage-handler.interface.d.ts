/**
 * Port: Handler для этапа синхронизации
 *
 * @remarks
 * Следует SRP: один handler = один этап.
 * Используется в SyncOrchestrator для композиции этапов.
 */
export interface ISyncStageHandler {
    /**
     * Выполняет этап синхронизации
     *
     * @param context - Контекст выполнения (опции, метаданные)
     * @returns Promise<void>
     */
    execute(context: SyncStageContext): Promise<void>;
    /**
     * Название этапа для логирования
     */
    readonly stageName: string;
}
/**
 * Контекст выполнения этапа синхронизации
 */
export interface SyncStageContext {
    /** Принудительный полный rebuild */
    forceFullSync?: boolean;
    /** Включить обогащение данными */
    enableEnrichment?: boolean;
    /** Обработанное количество записей */
    processedRecords?: number;
}
