import { NextResponse } from 'next/server';
import { redisPub, redisClient } from 'shared';
import { checkAuth, UNAUTHORIZED_RESPONSE } from '@/lib/auth';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }

  try {
    const { id } = params;
    
    // Publish to parsing queue
    await redisPub.publish('contacts:parse', JSON.stringify({ inn: id }));
    
    // Clear any previous status
    await redisClient.hset(`contacts:status:${id}`, { status: 'running', data: '' });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  if (!checkAuth(request)) {
    return NextResponse.json(UNAUTHORIZED_RESPONSE.json, { status: UNAUTHORIZED_RESPONSE.status });
  }
  try {
    const { id } = params;
    const state = await redisClient.hgetall(`contacts:status:${id}`);
    
    if (!state || !state.status) {
      return NextResponse.json({ status: 'idle' });
    }

    let parsedData = null;
    if (state.data) {
      try {
        parsedData = JSON.parse(state.data);
      } catch {
        // invalid JSON in state
      }
    }

    return NextResponse.json({
      status: state.status,
      stage: state.stage,
      data: parsedData,
      error: state.error
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
