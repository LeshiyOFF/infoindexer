/**
 * Transform Polling Worker
 *
 * @remarks
 * Background worker for periodic staging → production transformation.
 * Follows SRP: only responsible for polling and triggering.
 *
 * Polling interval: 30 seconds (configurable via constructor).
 *
 * @pattern Single Responsibility Principle
 * @pattern Worker Pattern
 */
import type {
  ITransformService,
  TransformTableStatus
} from '../domain/ports/i-transform-service.port';
import type { StagingConfig } from '../domain/value-objects/staging-config.vo';
import type { TransformResult } from '../domain/dto/transform-result.dto';

/**
 * Transform Polling Worker
 *
 * @remarks
 * Periodically checks staging tables and triggers transform when needed.
 * Designed for long-running background operation.
 */
export class TransformPollingWorker {
  private running = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly pollIntervalMs: number;

  constructor(
    private readonly transformService: ITransformService,
    config: StagingConfig
  ) {
    // Use 30 seconds as default polling interval
    this.pollIntervalMs = 30000;
  }

  /**
   * Start polling
   *
   * @remarks
   * Begins periodic transform checks. Safe to call multiple times.
   */
  async start(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    // Initial check
    await this.checkAndTransform();

    // Schedule periodic checks
    this.timer = setInterval(() => {
      this.checkAndTransform().catch(error => {
        console.error('[TransformPollingWorker] Polling error:', error);
      });
    }, this.pollIntervalMs);
  }

  /**
   * Stop polling
   *
   * @remarks
   * Gracefully stops polling after current cycle completes.
   */
  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    this.running = false;

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Check if worker is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Check and transform if needed
   *
   * @remarks
   * Queries transform status and triggers transform for tables
   * that exceed the configured threshold.
   *
   * Errors are logged but don't stop polling.
   */
  private async checkAndTransform(): Promise<void> {
    try {
      const results = await this.transformService.transformIfNeeded();

      for (const result of results) {
        if (result.isSuccessful) {
          console.log(
            `[TransformPollingWorker] Transformed ${result.tableName}: ` +
            `${result.rowsProcessed} rows in ${result.formattedDuration}`
          );
        } else {
          console.error(
            `[TransformPollingWorker] Transform failed for ${result.tableName}: ` +
            `${result.error}`
          );
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[TransformPollingWorker] checkAndTransform error: ${message}`);
    }
  }
}
