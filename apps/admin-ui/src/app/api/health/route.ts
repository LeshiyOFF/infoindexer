/**
 * Health Check Endpoint - Simple Probe
 *
 * @remarks
 * Simple health check for container orchestration and monitoring.
 * Returns 200 OK if service is running.
 *
 * Usage:
 *   GET /api/health
 *
 * Response (200):
 *   { "status": "ok", "timestamp": "2024-01-01T00:00:00.000Z" }
 */

export async function GET(): Promise<Response> {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}
