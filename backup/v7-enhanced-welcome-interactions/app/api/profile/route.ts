import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin, setUserContext } from '@/lib/supabase-admin';

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

    // Set user context for RLS policies
    await setUserContext(user.id);

    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json(profile || null);
  } catch (error) {
    console.error('Error fetching profile:', error);
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

    const { firstName, lastName, dateOfBirth, age, photoData } = await request.json();

    if (!firstName || !lastName || !dateOfBirth || !age) {
      return NextResponse.json({ error: 'All profile fields are required' }, { status: 400 });
    }

    console.log('Attempting to save profile for user:', user.id);

    // Set user context for RLS policies
    await setUserContext(user.id);

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;

    if (existingProfile) {
      console.log('Updating existing profile:', existingProfile.id);
      // Update existing profile
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dateOfBirth,
          age: age,
          photo_data: photoData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      result = { data, error };
    } else {
      console.log('Creating new profile for user:', user.id);
      // Create new profile
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .insert([
          {
            user_id: user.id,
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dateOfBirth,
            age: age,
            photo_data: photoData
          }
        ])
        .select()
        .single();

      result = { data, error };
    }

    if (result.error) {
      console.error('Database error saving profile:', result.error);
      return NextResponse.json({ 
        error: 'Failed to save profile', 
        details: result.error.message 
      }, { status: 500 });
    }

    console.log('Profile saved successfully:', result.data.id);
    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}