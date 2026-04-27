import { NextResponse } from 'next/server';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

export async function POST(request: Request) {
  // const { allowed } = await checkAuthRateLimit(request);
  // if (!allowed) {
  //   return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  // }
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }
  return NextResponse.json({ success: true });
}
