import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin, setUserContext } from '@/lib/supabase-admin';
import FormData from 'form-data';
import axios from 'axios';

const TAVUS_API_URL = 'https://api.tavus.io';
const TAVUS_API_KEY = process.env.TAVUS_API_KEY || 'b08e4c16d61747f995b612d7673dab64';

// Create a replica from a video recording
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
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

    // Get the form data with the video
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    
    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }
    
    // Convert File to buffer
    const arrayBuffer = await videoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create FormData for Tavus API
    const tavusFormData = new FormData();
    tavusFormData.append('video', buffer, {
      filename: 'user_recording.webm',
      contentType: videoFile.type,
    });
    
    // Append user name to the replica if available
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single();
      
    if (userProfile) {
      const replicaName = `${userProfile.first_name} ${userProfile.last_name} Echo`;
      tavusFormData.append('name', replicaName);
    } else {
      tavusFormData.append('name', `User ${user.id} Echo`);
    }

    // Make request to Tavus API
    const tavusResponse = await axios.post(`${TAVUS_API_URL}/v1/replicas`, tavusFormData, {
      headers: {
        ...tavusFormData.getHeaders(),
        'Authorization': `Bearer ${TAVUS_API_KEY}`,
      },
    });

    if (tavusResponse.status !== 200 && tavusResponse.status !== 201) {
      console.error('Error from Tavus API:', tavusResponse.data);
      return NextResponse.json(
        { error: 'Failed to create replica with Tavus API' },
        { status: 500 }
      );
    }

    const replicaData = tavusResponse.data;

    // Save the replica data to the user profile
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        echo_avatar_data: JSON.stringify(replicaData),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating user profile with replica data:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user profile', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(replicaData);
  } catch (error) {
    console.error('Error creating Tavus replica:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Get status of a replica
export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
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

    // Get the replica ID from query params
    const { searchParams } = new URL(request.url);
    const replicaId = searchParams.get('id');

    // If no ID is provided, get the user's replica from their profile
    if (!replicaId) {
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('echo_avatar_data')
        .eq('user_id', user.id)
        .single();
        
      if (!userProfile || !userProfile.echo_avatar_data) {
        return NextResponse.json({ error: 'No replica found for user' }, { status: 404 });
      }
      
      const replicaData = JSON.parse(userProfile.echo_avatar_data);
      
      if (!replicaData.id) {
        return NextResponse.json({ error: 'Invalid replica data' }, { status: 400 });
      }
      
      // Get the current status from Tavus
      const tavusResponse = await axios.get(`${TAVUS_API_URL}/v1/replicas/${replicaData.id}`, {
        headers: {
          'Authorization': `Bearer ${TAVUS_API_KEY}`,
        },
      });
      
      // Update the replica status in the user profile
      const updatedReplicaData = { ...replicaData, ...tavusResponse.data };
      
      await supabaseAdmin
        .from('user_profiles')
        .update({
          echo_avatar_data: JSON.stringify(updatedReplicaData),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
        
      return NextResponse.json(updatedReplicaData);
    } else {
      // Get the status of a specific replica
      const tavusResponse = await axios.get(`${TAVUS_API_URL}/v1/replicas/${replicaId}`, {
        headers: {
          'Authorization': `Bearer ${TAVUS_API_KEY}`,
        },
      });
      
      return NextResponse.json(tavusResponse.data);
    }
  } catch (error) {
    console.error('Error getting Tavus replica status:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}