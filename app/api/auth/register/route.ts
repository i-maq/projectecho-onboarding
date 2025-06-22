import { NextRequest, NextResponse } from 'next/server';
import { createUser, generateToken } from '@/lib/auth';
import { initializeDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const user = await createUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'User already exists or could not be created' },
        { status: 400 }
      );
    }

    const token = generateToken(user);

    return NextResponse.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}