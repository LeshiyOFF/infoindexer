/**
 * Adapter для очереди задач
 *
 * @remarks
 * Реализует Port IQueueService для управления очередью обработки.
 * Поддерживает ограничение concurrency для параллельной обработки.
 */
import type { IQueueService } from '../ports/i-queue.port';
import type { IEnrichmentService } from '../ports/i-enrichment.port';
/**
 * Сервис для управления очередью задач
 *
 * @remarks
 * Реализует очередь с ограничением количества параллельных задач.
 */
export declare class QueueService implements IQueueService {
    private readonly enrichment;
    private readonly queue;
    private inFlight;
    constructor(enrichment: IEnrichmentService);
    /**
     * Добавляет задачу в очередь
     *
     * @param inn - ИНН организации
     * @param batchId - Опциональный ID батча
     */
    enqueue(inn: string, batchId?: string): void;
    /**
     * Обрабатывает следующую задачу из очереди
     */
    processNext(): void;
    /**
     * Возвращает текущий размер очереди
     *
     * @returns Количество задач в очереди
     */
    getQueueSize(): number;
    /**
     * Возвращает количество выполняющихся задач
     *
     * @returns Количество задач в обработке
     */
    getInFlightCount(): number;
    /**
     * Обрабатывает ошибку выполнения задачи
     *
     * @param task - Задача с ошибкой
     * @param error - Ошибка
     */
    private handleTaskError;
}
