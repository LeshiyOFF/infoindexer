"use strict";
/**
 * Batch Size Adjuster
 *
 * Адаптирует размер батча на основе производительности.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchSizeAdjuster = void 0;
/**
 * Регулятор размера батча
 */
class BatchSizeAdjuster {
    config;
    currentSize;
    constructor(config) {
        this.config = config;
        this.currentSize = this.clampSize(config.initialBatchSize);
    }
    /** Адаптирует размер на основе производительности */
    adapt(duration, success, avgDuration) {
        if (!success) {
            this.currentSize = this.clampSize(Math.floor(this.currentSize * this.config.decayFactor));
            return;
        }
        // Анализируем производительность
        if (this.isTooFast(duration, avgDuration)) {
            this.currentSize = this.clampSize(Math.ceil(this.currentSize * this.config.growthFactor));
        }
        else if (this.isTooSlow(duration)) {
            this.currentSize = this.clampSize(Math.floor(this.currentSize * this.config.decayFactor));
        }
    }
    /** Проверяет что выполнение слишком быстрое */
    isTooFast(duration, avgDuration) {
        return duration < this.config.targetDuration && avgDuration < this.config.targetDuration;
    }
    /** Проверяет что выполнение слишком медленное */
    isTooSlow(duration) {
        return duration > this.config.targetDuration * 1.5;
    }
    /** Ограничивает размер в пределах min/max */
    clampSize(size) {
        return Math.max(this.config.minBatchSize, Math.min(this.config.maxBatchSize, size));
    }
    /** Сброс к начальному размеру */
    reset() {
        this.currentSize = this.clampSize(this.config.initialBatchSize);
    }
}
exports.BatchSizeAdjuster = BatchSizeAdjuster;
