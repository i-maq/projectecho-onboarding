// app/api/profile/route.ts

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/database';
import { supabaseAdmin } from '@/lib/supabase-admin';

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
    const { firstName, lastName, dateOfBirth, age, photoData } = await req.json();

    // Build the row to upsert — only include photoData if provided
    const row: Record<string, unknown> = {
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dateOfBirth,
      age,
    };
    if (photoData) {
      row.photo_data = photoData;
    }

    // Use the admin (service-role) client to bypass RLS — the user was already
    // authenticated above via supabase.auth.getUser(token).
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('user_profiles')
      .upsert(row, { onConflict: 'user_id' })
      .select('*');

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
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