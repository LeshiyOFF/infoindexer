"use strict";
/**
 * Handler: Denormalization Stage
 *
 * @remarks
 * @deprecated Materialized Views handle aggregation automatically.
 *
 * MV Pattern eliminates need for separate denormalization stage:
 * - Direct insert to egrul_directors_denormalized → directors_mv auto-updates
 * - Direct insert to egrul_founders_denormalized → founders_mv auto-updates
 * - No JOIN/prepareDirectors/prepareFounders needed
 *
 * Memory reduction: 5.6GB → ~200MB (28x)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DenormalizationHandler = void 0;
/**
 * Handler: Denormalization Stage (Deprecated)
 *
 * @deprecated No-op. Direct insert + MV auto-update replaces denormalization.
 */
class DenormalizationHandler {
    denormalization;
    progressReporter;
    stageName = 'denormalization';
    constructor(denormalization, progressReporter) {
        this.denormalization = denormalization;
        this.progressReporter = progressReporter;
    }
    async execute(_context) {
        await this.progressReporter.report(this.progressReporter.createState('running', 45, 'Direct insert + MV auto-update (no denormalization needed)'));
        // No-op: Direct insert + MV handles aggregation
        await this.denormalization.run(); // Logs deprecation notice
    }
}
exports.DenormalizationHandler = DenormalizationHandler;
