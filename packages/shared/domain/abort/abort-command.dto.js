"use strict";
/**
 * DTO для команды отмены операции
 *
 * @remarks
 * Value Object для передачи команды отмены через Redis Pub/Sub.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAbortCommand = createAbortCommand;
exports.serializeAbortCommand = serializeAbortCommand;
exports.deserializeAbortCommand = deserializeAbortCommand;
/**
 * Создаёт команду отмены
 */
function createAbortCommand(operationId, operationType, userId) {
    return {
        operationId,
        operationType,
        timestamp: Date.now(),
        userId
    };
}
/**
 * Сериализует команду в JSON
 */
function serializeAbortCommand(command) {
    return JSON.stringify(command);
}
/**
 * Десериализует команду из JSON
 */
function deserializeAbortCommand(data) {
    try {
        const parsed = JSON.parse(data);
        return validateAbortCommand(parsed);
    }
    catch {
        throw new Error('Invalid AbortCommand format');
    }
}
/**
 * Валидирует структуру команды отмены
 */
function validateAbortCommand(data) {
    if (typeof data !== 'object' || data === null) {
        throw new Error('AbortCommand must be an object');
    }
    const cmd = data;
    if (typeof cmd.operationId !== 'string') {
        throw new Error('AbortCommand.operationId must be a string');
    }
    if (typeof cmd.operationType !== 'string') {
        throw new Error('AbortCommand.operationType must be a string');
    }
    if (typeof cmd.timestamp !== 'number') {
        throw new Error('AbortCommand.timestamp must be a number');
    }
    return {
        operationId: cmd.operationId,
        operationType: cmd.operationType,
        timestamp: cmd.timestamp,
        userId: typeof cmd.userId === 'string' ? cmd.userId : undefined
    };
}
