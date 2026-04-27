/**
 * Сервис для проверки готовности таблицы financial_reports_summary
 */
export class SummaryCheckerService {
    client;
    constructor(client) {
        this.client = client;
    }
    /**
     * Проверяет готовность таблицы financial_reports_summary
     */
    async check() {
        try {
            const [probeResult, columnResult] = await Promise.all([
                this.client.query({
                    query: 'SELECT 1 FROM financial_reports_summary LIMIT 1',
                    format: 'JSONEachRow'
                }),
                this.client.query({
                    query: "SELECT 1 FROM system.columns WHERE database = currentDatabase() AND table = 'financial_reports_summary' AND name = 'okved' LIMIT 1",
                    format: 'JSONEachRow'
                })
            ]);
            const probeJson = await probeResult.json();
            const columnJson = await columnResult.json();
            const probeData = this.ensureArray(probeJson);
            const columnData = this.ensureArray(columnJson);
            return {
                ready: probeData.length > 0,
                hasOkvedColumn: columnData.length > 0
            };
        }
        catch {
            return { ready: false, hasOkvedColumn: false };
        }
    }
    /**
     * Гарантирует, что результат является массивом
     */
    ensureArray(value) {
        return Array.isArray(value) ? value : [];
    }
}
