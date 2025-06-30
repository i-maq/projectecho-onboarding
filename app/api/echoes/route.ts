import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabase, setUserContext } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Set user context for RLS policies
    await setUserContext(user.id);

    const { data: echoes, error } = await supabase
      .from('echoes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching echoes:', error);
      return NextResponse.json({ error: 'Failed to fetch echoes' }, { status: 500 });
    }

    return NextResponse.json(echoes || []);
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

    const user = await verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Set user context for RLS policies
    await setUserContext(user.id);

    const { data: echo, error } = await supabase
      .from('echoes')
      .insert([
        {
          content: content.trim(),
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating echo:', error);
      return NextResponse.json({ error: 'Failed to create echo' }, { status: 500 });
    }

    return NextResponse.json(echo);
  } catch (error) {
    console.error('Error creating echo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}