import { NextResponse } from 'next/server';

// Stub route for Tavus video API — returns mock data until Tavus integration is live
export async function POST(req: Request) {
  try {
    const body = await req.json();

    return NextResponse.json({
      video_id: `mock-video-${Date.now()}`,
      status: 'processing',
      message: 'Video creation queued (mock mode)',
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
    message: 'Tavus video API is in mock mode',
  });
}
