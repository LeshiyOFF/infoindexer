"use strict";
/**
 * Типы для Resume Coordinator
 *
 * @remarks
 * Константы и DTO для HTTP Range resume.
 * Вынесены в отдельный файл для соблюдения лимита 200 строк.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAVE_INTERVAL_BYTES = exports.MAX_STATE_AGE_MS = void 0;
/** Максимальный возраст состояния (24 часа) */
exports.MAX_STATE_AGE_MS = 24 * 60 * 60 * 1000;
/** Интервал сохранения состояния (10 MB) */
exports.SAVE_INTERVAL_BYTES = 10 * 1024 * 1024;
