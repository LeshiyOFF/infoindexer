/**
 * DTO для команды отмены операции
 *
 * @remarks
 * Value Object для передачи команды отмены через Redis Pub/Sub.
 */
import type { AbortOperationType } from '../../infrastructure/ports/abort.port';
/**
 * Команда отмены операции
 */
export interface AbortCommand {
    readonly operationId: string;
    readonly operationType: AbortOperationType;
    readonly timestamp: number;
    readonly userId?: string;
}
/**
 * Создаёт команду отмены
 */
export declare function createAbortCommand(operationId: string, operationType: AbortOperationType, userId?: string): AbortCommand;
/**
 * Сериализует команду в JSON
 */
export declare function serializeAbortCommand(command: AbortCommand): string;
/**
 * Десериализует команду из JSON
 */
export declare function deserializeAbortCommand(data: string): AbortCommand;
