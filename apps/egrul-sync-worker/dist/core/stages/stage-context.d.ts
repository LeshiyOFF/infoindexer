/**
 * Stage Context Types
 *
 * Общий контекст для выполнения sync stages.
 */
import type { ProgressReporter } from '../infrastructure/progress-reporter';
import type { ICircuitBreakerPort } from '../ports/i-circuit-breaker.port';
import type { RetryPolicy } from '../infrastructure/retry';
import type { SyncStage } from 'shared';
/**
 * Контекст выполнения стадии
 *
 * @remarks
 * Использует Port interface вместо concrete class
 * для соответствия Dependency Inversion Principle.
 */
export interface StageContext {
    readonly reporter: ProgressReporter;
    readonly circuitBreaker: ICircuitBreakerPort;
    readonly retryPolicy: RetryPolicy;
    readonly startTime: Date;
}
/**
 * Результат выполнения стадии
 */
export type StageResult = {
    success: true;
    processed: number;
    message: string;
} | {
    success: false;
    error: string;
    code: string;
};
/**
 * Опции выполнения стадии
 */
export interface StageOptions {
    readonly onProgress?: (progress: number, message: string) => void;
    readonly skipErrors?: boolean;
    readonly maxErrors?: number;
    readonly abortSignal?: AbortSignal;
}
/**
 * Метаданные стадии
 */
export interface StageMetadata {
    readonly name: string;
    readonly stage: SyncStage;
    readonly startPercentage: number;
    readonly endPercentage: number;
}
/**
 * Создаёт StageResult для успешного выполнения
 */
export declare function stageSuccess(processed: number, message: string): StageResult;
/**
 * Создаёт StageResult для ошибки
 */
export declare function stageFailure(error: string, code: string): StageResult;
/**
 * Проверяет, является результат успешным
 */
export declare function isStageSuccess(result: StageResult): result is {
    success: true;
    processed: number;
    message: string;
};
/**
 * Проверяет, является результат ошибкой
 */
export declare function isStageFailure(result: StageResult): result is {
    success: false;
    error: string;
    code: string;
};
