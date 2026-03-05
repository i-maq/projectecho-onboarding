import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const echoes = await db.getEchoes(user.id);
    return NextResponse.json(echoes);
  } catch (error) {
    console.error('Error fetching echoes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const echo = await db.createEcho(user.id, content.trim());

    if (!echo) {
      return NextResponse.json({ error: 'Failed to create echo' }, { status: 500 });
    }

    return NextResponse.json(echo);
  } catch (error) {
    console.error('Error creating echo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
