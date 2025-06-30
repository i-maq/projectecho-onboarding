// app/api/profile/route.ts

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/database';

export async function POST(req: Request) {
  try {
    // Extract bearer token from Authorization header
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Missing authentication token.' },
        { status: 401 }
      );
    }

    // Verify the token and retrieve the user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: userError?.message || 'Invalid token.' },
        { status: userError?.status || 401 }
      );
    }

    // Parse the request body
    const { firstName, lastName, dateOfBirth, age } = await req.json();

    // Upsert into user_profiles table (using service role or anon key appropriately)
    const { data: inserted, error: insertError } = await supabase
      .from('user_profiles')
      .upsert(
        {
          user_id: user.id,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dateOfBirth,
          age,
        },
        { returning: 'representation', onConflict: ['user_id'] }
      );

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: insertError.status || 500 }
      );
    }

    // Return the upserted record
    return NextResponse.json(inserted![0]);
  } catch (err: any) {
    console.error('Profile route error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}