import { NextResponse } from 'next/server';
import { comparePassword, generateToken } from '@/lib/auth';
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

    const user = await db.getUserByEmail(email);

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = generateToken({ id: user.id, email: user.email });

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (err: any) {
    console.error('Login route error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
