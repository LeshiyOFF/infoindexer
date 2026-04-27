"use strict";
/**
 * Adapter для очереди задач
 *
 * @remarks
 * Реализует Port IQueueService для управления очередью обработки.
 * Поддерживает ограничение concurrency для параллельной обработки.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const shared_1 = require("shared");
const constants_1 = require("../constants");
/**
 * Сервис для управления очередью задач
 *
 * @remarks
 * Реализует очередь с ограничением количества параллельных задач.
 */
class QueueService {
    enrichment;
    queue = [];
    inFlight = 0;
    constructor(enrichment) {
        this.enrichment = enrichment;
    }
    /**
     * Добавляет задачу в очередь
     *
     * @param inn - ИНН организации
     * @param batchId - Опциональный ID батча
     */
    enqueue(inn, batchId) {
        this.queue.push({ inn, batchId });
        this.processNext();
    }
    /**
     * Обрабатывает следующую задачу из очереди
     */
    processNext() {
        if (this.inFlight >= constants_1.PARSE_CONCURRENCY || this.queue.length === 0) {
            return;
        }
        const task = this.queue.shift();
        if (!task) {
            return;
        }
        this.inFlight++;
        this.enrichment.getEnrichedData(task.inn, task.batchId)
            .catch((e) => {
            console.error(`[Waterfall] Queue error ${task.inn}:`, e);
            this.handleTaskError(task, e);
        })
            .finally(() => {
            this.inFlight--;
            this.processNext();
        });
    }
    /**
     * Возвращает текущий размер очереди
     *
     * @returns Количество задач в очереди
     */
    getQueueSize() {
        return this.queue.length;
    }
    /**
     * Возвращает количество выполняющихся задач
     *
     * @returns Количество задач в обработке
     */
    getInFlightCount() {
        return this.inFlight;
    }
    /**
     * Обрабатывает ошибку выполнения задачи
     *
     * @param task - Задача с ошибкой
     * @param error - Ошибка
     */
    handleTaskError(task, error) {
        shared_1.redisClient.hset(`contacts:status:${task.inn}`, {
            status: 'error',
            error: String(error)
        }).catch(() => {
            // Игнорируем ошибки при записи статуса
        });
        if (task.batchId) {
            shared_1.redisClient.hset(`batch:${task.batchId}:inn_status`, task.inn, 'error').catch(() => {
                // Игнорируем ошибки при записи статуса
            });
            shared_1.redisClient.expire(`batch:${task.batchId}:inn_status`, constants_1.BATCH_TTL_SEC).catch(() => {
                // Игнорируем ошибки при установке TTL
            });
        }
    }
}
exports.QueueService = QueueService;
