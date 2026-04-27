"use strict";
/**
 * Stage Context Types
 *
 * Общий контекст для выполнения sync stages.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stageSuccess = stageSuccess;
exports.stageFailure = stageFailure;
exports.isStageSuccess = isStageSuccess;
exports.isStageFailure = isStageFailure;
/**
 * Создаёт StageResult для успешного выполнения
 */
function stageSuccess(processed, message) {
    return {
        success: true,
        processed,
        message
    };
}
/**
 * Создаёт StageResult для ошибки
 */
function stageFailure(error, code) {
    return {
        success: false,
        error: code,
        code
    };
}
/**
 * Проверяет, является результат успешным
 */
function isStageSuccess(result) {
    return result.success === true;
}
/**
 * Проверяет, является результат ошибкой
 */
function isStageFailure(result) {
    return result.success === false;
}
