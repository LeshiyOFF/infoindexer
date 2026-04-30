/**
 * Adapter для проверки готовности таблицы через ClickHouse
 */
export class ClickHouseSummaryChecker {
    client;
    constructor(client) {
        this.client = client;
    }
    async check() {
        const tablesResult = await this.client.query({
            query: `
        SELECT name, engine
        FROM system.tables
        WHERE database = currentDatabase()
          AND name IN ('financial_reports_summary_mv', 'financial_reports_summary')
      `,
            format: 'JSONEachRow'
        });
        const tables = (await tablesResult.json());
        const tableNames = tables.map(t => t.name);
        const mvExists = tableNames.includes('financial_reports_summary_mv');
        const viewExists = tableNames.includes('financial_reports_summary');
        let rowCount = 0;
        let hasOkvedColumn = false;
        if (viewExists) {
            try {
                const countResult = await this.client.query({
                    query: 'SELECT count() as c FROM financial_reports_summary',
                    format: 'JSONEachRow'
                });
                const countData = await countResult.json();
                rowCount = Number(countData[0]?.c || 0);
                const columnResult = await this.client.query({
                    query: "SELECT count() as c FROM system.columns WHERE database = currentDatabase() AND table = 'financial_reports_summary' AND name = 'okved'",
                    format: 'JSONEachRow'
                });
                const columnData = await columnResult.json();
                hasOkvedColumn = Number(columnData[0]?.c || 0) > 0;
            }
            catch {
                rowCount = 0;
            }
        }
        return {
            ready: mvExists && viewExists && rowCount > 0,
            hasData: rowCount > 0,
            rowCount,
            mvExists,
            viewExists,
            hasOkvedColumn
        };
    }
}
