/**
 * GDPR Delete API Route
 *
 * @remarks
 * API Layer: Next.js route handlers for GDPR deletion.
 * Part of GDPR/FЗ-152 right-to-delete implementation.
 *
 * Architecture:
 * - API Layer: HTTP handling only, no business logic
 * - Uses Port (IGdprDeletion) through factory
 * - Auth check via checkAuth()
 *
 * Endpoints:
 * - POST /api/organizations/{id}/gdpr-delete - Confirm deletion
 * - DELETE /api/organizations/{id}/gdpr-delete - Execute deletion
 *
 * Iteration 13: GDPR Right-to-Delete
 */

import { NextResponse } from 'next/server';
import { clickhouseClient } from 'shared/clickhouse';
import { createGdprDeletionService } from 'shared';
import { GdprDeleteRequest, innValidator, type IGdprDeletion } from 'shared/client';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * Extract user ID from Authorization header
 */
function extractUserIdFromAuth(header: string): string {
  const token = header.replace('Bearer ', '');
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || 'admin';
  } catch {
    return 'admin';
  }
}

/**
 * POST /api/organizations/{id}/gdpr-delete
 *
 * Confirm deletion by returning record counts.
 * Does not delete any data.
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  // Auth check
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }

  try {
    const inn = params.id;

    // Validate INN format
    const validation = innValidator.validate(inn);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error?.message || 'Invalid INN format' },
        { status: 400 }
      );
    }

    // Create service
    const service: IGdprDeletion = createGdprDeletionService(clickhouseClient);

    // Confirm deletion (get counts)
    const result = await service.confirm(inn);

    return NextResponse.json({
      success: true,
      inn,
      records_to_delete: result.counts,
      confirmation_required: true
    });
  } catch (error) {
    console.error('[GDPR POST Error]', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/organizations/{id}/gdpr-delete
 *
 * Execute deletion of all organization data.
 * This action is irreversible.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  // Auth check
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }

  try {
    const inn = params.id;

    // Validate INN format
    const validation = innValidator.validate(inn);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error?.message || 'Invalid INN format' },
        { status: 400 }
      );
    }

    // Get user ID from auth header for audit
    const authHeader = request.headers.get('authorization');
    const userId = authHeader ? extractUserIdFromAuth(authHeader) : 'anonymous';

    // Create request DTO
    const deleteRequest = GdprDeleteRequest.create(inn, userId);

    // Create service with audit logging
    const service: IGdprDeletion = createGdprDeletionService(clickhouseClient);

    // Execute deletion
    const result = await service.execute(deleteRequest);

    if (result.success) {
      return NextResponse.json({
        success: true,
        inn,
        deleted_records: result.counts,
        message: `Successfully deleted ${result.counts.total} records`
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          inn,
          errors: result.errors,
          message: 'Partial deletion failed'
        },
        { status: 207 } // Multi-status for partial success
      );
    }
  } catch (error) {
    console.error('[GDPR DELETE Error]', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
