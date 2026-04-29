/**
 * Organization Sanctions API
 *
 * Получение санкций организации по ИНН.
 */

import { NextResponse } from 'next/server';
import { clickhouseClient } from 'shared';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';
import type { SanctionDTO } from 'shared/client';

export const dynamic = 'force-dynamic';

/**
 * Response для санкций организации
 */
type OrganizationSanctionsResponse =
  | { success: true; data: readonly SanctionDTO[] }
  | { success: false; error: { code: string; message: string } };

/**
 * GET /api/organizations/[id]/sanctions — получение санкций организации
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }

  try {
    const { id } = params;

    // Проверяем, что id — это ИНН (10 или 12 цифр)
    const innPattern = /^\d{10}$|^\d{12}$/;
    if (!innPattern.test(id)) {
      const response: OrganizationSanctionsResponse = {
        success: false,
        error: {
          code: 'INVALID_INN',
          message: 'ID должен быть ИНН (10 или 12 цифр)'
        }
      };
      return NextResponse.json(response, { status: 400 });
    }

    const query = `
      SELECT
        id,
        inn,
        program,
        program_id as programId,
        authority,
        country,
        toString(start_date) as startDate,
        toString(end_date) as endDate,
        source_url as sourceUrl,
        end_date IS NULL OR end_date > today() as isActive
      FROM company_sanctions
      WHERE inn = {inn: String}
      ORDER BY start_date DESC
    `;

    const resultSet = await clickhouseClient.query({
      query,
      query_params: { inn: id },
      format: 'JSONEachRow'
    });

    const rows = await resultSet.json<SanctionDTO>();

    const response: OrganizationSanctionsResponse = {
      success: true,
      data: rows
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Organization sanctions API error:', error);

    const message = error instanceof Error ? error.message : 'Не удалось получить санкции';
    const response: OrganizationSanctionsResponse = {
      success: false,
      error: {
        code: 'SANCTIONS_FETCH_FAILED',
        message
      }
    };

    return NextResponse.json(response, { status: 500 });
  }
}
