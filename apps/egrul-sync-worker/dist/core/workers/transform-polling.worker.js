"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformPollingWorker = void 0;
/**
 * Transform Polling Worker
 *
 * @remarks
 * Periodically checks staging tables and triggers transform when needed.
 * Implements graceful shutdown and parallel execution protection.
 */
class TransformPollingWorker {
    transformService;
    config;
    metrics;
    name = 'TransformPollingWorker';
    state;
    timer = null;
    currentTransform = null;
    logger;
    constructor(transformService, config, metrics, baseLogger) {
        this.transformService = transformService;
        this.config = config;
        this.metrics = metrics;
        this.logger = baseLogger.withContext({ worker: this.name });
        this.state = this.initialState();
    }
    async start() {
        if (this.state.status !== 'idle') {
            this.logger.warn('Worker already running or stopping', { status: this.state.status });
            return;
        }
        this.state = { ...this.state, status: 'running', startedAt: new Date() };
        this.logger.info('Worker started', { pollIntervalMs: this.config.pollIntervalMs });
        this.metrics?.recordCounter('worker.started', 1, { worker: this.name });
        // Initial check
        await this.executeCycle().catch(err => this.logger.error('Initial cycle failed', err));
        // Schedule periodic checks
        this.timer = setInterval(() => {
            this.executeCycle().catch(err => this.logger.error('Cycle failed', err));
        }, this.config.pollIntervalMs);
    }
    async stop(timeoutMs) {
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
        }
        catch (error) {
            this.logger.error('Shutdown timeout or error', error);
        }
        this.state = this.initialState();
        this.logger.info('Worker stopped');
        this.metrics?.recordCounter('worker.stopped', 1, { worker: this.name });
    }
    getState() {
        return { ...this.state };
    }
    isRunning() {
        return this.state.status === 'running';
    }
    initialState() {
        return {
            status: 'idle',
            cyclesCompleted: 0
        };
    }
    async executeCycle() {
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
        }
        finally {
            this.currentTransform = null;
        }
    }
    async runTransform() {
        const status = await this.transformService.getTransformStatus();
        const tablesNeedingTransform = status.filter(s => s.rowCount >= this.config.transformThresholdRows && s.status !== 'running');
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
    async transformTable(tableStatus) {
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
            }
            else {
                this.logger.error('Transform failed', result.error, {
                    table: result.tableName
                });
                this.metrics?.recordCounter('transform.failed', 1, {
                    table: result.tableName
                });
            }
        }
        catch (error) {
            this.logger.error('Transform error', error, {
                table: tableStatus.tableName
            });
            this.metrics?.recordCounter('transform.error', 1, {
                table: tableStatus.tableName
            });
        }
    }
    timeout(ms) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
        });
    }
}
exports.TransformPollingWorker = TransformPollingWorker;
