/**
 * Port: IWorker
 *
 * @remarks
 * Interface for background worker operations.
 * Defines lifecycle management contract.
 *
 * @pattern Hexagonal / Ports & Adapters
 * @pattern Dependency Inversion Principle
 * @pattern Interface Segregation Principle
 */
/**
 * Worker status
 */
export type WorkerStatus = 'idle' | 'running' | 'stopping' | 'stopped';
/**
 * Worker state snapshot
 *
 * @remarks
 * Immutable data transfer object for worker state.
 */
export interface WorkerState {
    /** Current status */
    readonly status: WorkerStatus;
    /** When worker was started */
    readonly startedAt?: Date;
    /** When last cycle completed */
    readonly lastCycleAt?: Date;
    /** Total cycles completed */
    readonly cyclesCompleted: number;
}
/**
 * Worker Port
 *
 * @remarks
 * Defines contract for background worker lifecycle.
 * Used for long-running periodic operations.
 */
export interface IWorker {
    /** Worker name for identification */
    readonly name: string;
    /**
     * Start worker
     *
     * @remarks
     * Begins periodic execution. Safe to call multiple times.
     */
    start(): Promise<void>;
    /**
     * Stop worker
     *
     * @remarks
     * Gracefully stops worker after current cycle completes.
     *
     * @param timeoutMs - Maximum time to wait for graceful shutdown
     */
    stop(timeoutMs?: number): Promise<void>;
    /**
     * Get current worker state
     *
     * @returns Immutable state snapshot
     */
    getState(): WorkerState;
    /**
     * Check if worker is currently running
     *
     * @returns true if worker is in running state
     */
    isRunning(): boolean;
}
