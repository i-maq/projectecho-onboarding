// app/api/auth/login/route.ts

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/database';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 400 }
      );
    }
    return NextResponse.json({
      token: data.session?.access_token,
      user: data.user
    });
  } catch (err: any) {
    console.error('Login route error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}