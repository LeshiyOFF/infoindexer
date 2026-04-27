import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { redisClient } from 'shared';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

interface BatchInnItem {
  inn: string;
  name: string;
}

interface ContactData {
  emails: { val: string; source: string; type?: string }[];
  phones: { val: string; source: string; type?: string }[];
  director?: string;
  name?: string;
}

/** GET /api/batches/:batchId/export?format=xlsx — экспорт результатов в XLSX */
export async function GET(
  request: Request,
  { params }: { params: { batchId: string } }
) {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, {
      status: UNAUTHORIZED_RESPONSE.status
    });
  }

  try {
    const { batchId } = params;
    if (!batchId) {
      return NextResponse.json({ error: 'batchId required' }, { status: 400 });
    }

    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'xlsx';
    if (format !== 'xlsx' && format !== 'csv') {
      return NextResponse.json(
        { error: 'Only format=xlsx or format=csv is supported' },
        { status: 400 }
      );
    }

    const meta = await redisClient.hgetall(`batch:${batchId}`);
    if (!meta || !meta.status) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const inns = meta.inns ? (JSON.parse(meta.inns) as BatchInnItem[]) : [];
    const nameMap = Object.fromEntries(inns.map(x => [x.inn, x.name]));

    const rows: string[][] = [];
    rows.push(['Компания', 'ФИО директора', 'Тип контакта', 'Контакт', 'Источник']);

    if (inns.length > 0) {
      const pipeline = redisClient.pipeline();
      for (const { inn } of inns) {
        pipeline.hgetall(`contacts:status:${inn}`);
      }
      const stateResults = await pipeline.exec();
      if (stateResults) {
        inns.forEach(({ inn }, idx) => {
          const res = stateResults[idx];
          const state = res && res[0] === null ? (res[1] as Record<string, string>) : null;
          let parsedData: ContactData | null = null;
          if (state?.data) {
            try {
              parsedData = JSON.parse(state.data) as ContactData;
            } catch {
              // ignore
            }
          }

          const name = parsedData?.name || nameMap[inn] || inn;
          const director = parsedData?.director || '';

          const addRow = (val: string, kind: string, source: string) => {
            rows.push([
              name,
              director,
              kind === 'phone' ? 'Телефон' : 'Email',
              val,
              source
            ]);
          };

          (parsedData?.phones ?? []).forEach(ph => addRow(ph.val, 'phone', ph.source));
          (parsedData?.emails ?? []).forEach(em => addRow(em.val, 'email', em.source));
        });
      }
    }

    if (format === 'csv') {
      const escapeCsvField = (value: string) => {
        if (value.includes(';') || value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      };
      const csv = rows.map(r => r.map(escapeCsvField).join(';')).join('\n');
      const bom = '\uFEFF';
      return new NextResponse(bom + csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="batch-${batchId}.csv"`
        }
      });
    }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Контакты');
    ws.columns = [
      { header: 'Компания', key: 'company', width: 30 },
      { header: 'ФИО директора', key: 'director', width: 25 },
      { header: 'Тип контакта', key: 'kind', width: 12 },
      { header: 'Контакт', key: 'contact', width: 25 },
      { header: 'Источник', key: 'source', width: 20 }
    ];
    ws.getRow(1).font = { bold: true };
    rows.slice(1).forEach(r =>
      ws.addRow({ company: r[0], director: r[1], kind: r[2], contact: r[3], source: r[4] })
    );

    const buf = await wb.xlsx.writeBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="batch-${batchId}.xlsx"`
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
