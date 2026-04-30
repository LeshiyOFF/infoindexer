/**
 * Transform Polling Worker
 *
 * @remarks
 * Background worker for periodic staging → production transformation.
 * Follows SRP: only responsible for polling and triggering.
 * Follows DIP: depends on ports (ITransformService, ILogger, IMetricsCollectorPort).
 *
 * @pattern Single Responsibility Principle
 * @pattern Worker Pattern
 * @pattern Hexagonal / Ports & Adapters
 */
import type {
  ITransformService,
  TransformTableStatus
} from '../domain/ports/i-transform-service.port';
import type { IWorker, WorkerState, WorkerStatus } from '../domain/ports/i-worker.port';
import type { WorkerConfig } from '../domain/value-objects/worker-config.vo';
import type { IMetricsCollectorPort } from '../ports/i-metrics-collector.port';
import type { ILogger } from '../domain/ports/i-logger.port';

/**
 * Internal worker state (mutable)
 */
interface WorkerStateInternal {
  status: WorkerStatus;
  startedAt?: Date;
  lastCycleAt?: Date;
  cyclesCompleted: number;
}

/**
 * Transform Polling Worker
 *
 * @remarks
 * Periodically checks staging tables and triggers transform when needed.
 * Implements graceful shutdown and parallel execution protection.
 */
export class TransformPollingWorker implements IWorker {
  readonly name = 'TransformPollingWorker';

  private state: WorkerStateInternal;
  private timer: NodeJS.Timeout | null = null;
  private currentTransform: Promise<void> | null = null;
  private readonly logger: ILogger;

  constructor(
    private readonly transformService: ITransformService,
    private readonly config: WorkerConfig,
    private readonly metrics: IMetricsCollectorPort | undefined,
    baseLogger: ILogger
  ) {
    this.logger = baseLogger.withContext({ worker: this.name });
    this.state = this.initialState();
  }

  async start(): Promise<void> {
    if (this.state.status !== 'idle') {
      this.logger.warn('Worker already running or stopping', { status: this.state.status });
      return;
    }

    this.state = { ...this.state, status: 'running', startedAt: new Date() };
    this.logger.info('Worker started', { pollIntervalMs: this.config.pollIntervalMs });

    this.metrics?.recordCounter('worker.started', 1, { worker: this.name });

    // Initial check
    await this.executeCycle().catch(err =>
      this.logger.error('Initial cycle failed', err)
    );

    // Schedule periodic checks
    this.timer = setInterval(() => {
      this.executeCycle().catch(err =>
        this.logger.error('Cycle failed', err)
      );
    }, this.config.pollIntervalMs);
  }

  async stop(timeoutMs?: number): Promise<void> {
    const actualTimeout = timeoutMs ?? this.config.shutdownTimeoutMs;

    if (this.state.status !== 'running') {
      return;
    }

    this.state = { ...this.state, status: 'stopping' };
    this.logger.info('Worker stopping...', { timeoutMs: actualTimeout });

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    try {
      await Promise.race([
        this.currentTransform ?? Promise.resolve(),
        this.timeout(actualTimeout)
      ]);
    } catch (error) {
      this.logger.error('Shutdown timeout or error', error);
    }

    this.state = this.initialState();
    this.logger.info('Worker stopped');

    this.metrics?.recordCounter('worker.stopped', 1, { worker: this.name });
  }

  getState(): WorkerState {
    return { ...this.state };
  }

  isRunning(): boolean {
    return this.state.status === 'running';
  }

  private initialState(): WorkerStateInternal {
    return {
      status: 'idle',
      cyclesCompleted: 0
    };
  }

  private async executeCycle(): Promise<void> {
    if (this.state.status !== 'running') {
      return;
    }

    if (this.currentTransform) {
      this.logger.debug('Previous cycle still running, skipping');
      return;
    }

    const startTime = Date.now();
    this.currentTransform = this.runTransform();

    try {
      await this.currentTransform;

      this.state = {
        ...this.state,
        lastCycleAt: new Date(),
        cyclesCompleted: this.state.cyclesCompleted + 1
      };

      const duration = Date.now() - startTime;
      this.logger.debug('Cycle completed', {
        durationMs: duration,
        cyclesCompleted: this.state.cyclesCompleted
      });

      this.metrics?.recordTiming('worker.cycle_duration', duration, {
        worker: this.name
      });

    } finally {
      this.currentTransform = null;
    }
  }

  private async runTransform(): Promise<void> {
    const status = await this.transformService.getTransformStatus();

    const tablesNeedingTransform = status.filter(s =>
      s.rowCount >= this.config.transformThresholdRows && s.status !== 'running'
    );

    if (tablesNeedingTransform.length === 0) {
      return;
    }

    this.logger.info('Transform needed', {
      tables: tablesNeedingTransform.map(t => t.tableName)
    });

    for (const tableStatus of tablesNeedingTransform) {
      await this.transformTable(tableStatus);
    }
  }

  private async transformTable(tableStatus: TransformTableStatus): Promise<void> {
    try {
      const result = await this.transformService.transformTable(tableStatus.tableName);

      if (result.isSuccessful) {
        this.logger.info('Transform completed', {
          table: result.tableName,
          rows: result.rowsProcessed,
          durationMs: result.durationMs
        });

        this.metrics?.recordCounter('transform.completed', 1, {
          table: result.tableName
        });
      } else {
        this.logger.error('Transform failed', result.error, {
          table: result.tableName
        });

        this.metrics?.recordCounter('transform.failed', 1, {
          table: result.tableName
        });
      }
    } catch (error) {
      this.logger.error('Transform error', error, {
        table: tableStatus.tableName
      });

      this.metrics?.recordCounter('transform.error', 1, {
        table: tableStatus.tableName
      });
    }
  }

  private timeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    });
  }
}
