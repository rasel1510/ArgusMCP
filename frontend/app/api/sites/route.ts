import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:4000';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') || '50';
    const res = await fetch(`${BACKEND_URL}/api/sites?limit=${limit}`, {
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.warn(`[frontend-api] Backend at ${BACKEND_URL} not reachable yet: ${err.message}`);
    return NextResponse.json({ sites: [], total: 0, backendOnline: false }, { status: 200 });
  }
}
