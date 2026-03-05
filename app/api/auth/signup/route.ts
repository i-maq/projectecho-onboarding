import { NextResponse } from 'next/server';
import { hashPassword, generateToken } from '@/lib/auth';
import { db } from '@/lib/data';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

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

    const existing = await db.getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await db.createUser(email, hashedPassword);

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    const token = generateToken({ id: user.id, email: user.email });

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (err: any) {
    console.error('Sign-up route error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
