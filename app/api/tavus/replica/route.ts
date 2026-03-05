import { NextResponse } from 'next/server';

// Stub route for Tavus replica API — returns mock data until Tavus integration is live
export async function POST(req: Request) {
  try {
    const body = await req.json();

    return NextResponse.json({
      replica_id: `mock-replica-${Date.now()}`,
      status: 'processing',
      message: 'Replica creation queued (mock mode)',
      data: body,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'mock',
    message: 'Tavus replica API is in mock mode',
  });
}
