import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin, setUserContext } from '@/lib/supabase-admin';
import axios from 'axios';

const TAVUS_API_URL = 'https://api.tavus.io';
const TAVUS_API_KEY = process.env.TAVUS_API_KEY || 'b08e4c16d61747f995b612d7673dab64';

// Generate a new video with a replica
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

    // Get the request body
    const { script, replicaId } = await request.json();
    
    if (!script) {
      return NextResponse.json({ error: 'Script is required' }, { status: 400 });
    }
    
    // If no replicaId provided, get from user profile
    let finalReplicaId = replicaId;
    if (!finalReplicaId) {
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('echo_avatar_data')
        .eq('user_id', user.id)
        .single();
        
      if (!userProfile || !userProfile.echo_avatar_data) {
        return NextResponse.json({ error: 'No replica found for user' }, { status: 404 });
      }
      
      const replicaData = JSON.parse(userProfile.echo_avatar_data);
      finalReplicaId = replicaData.id;
      
      if (!finalReplicaId) {
        return NextResponse.json({ error: 'Invalid replica data' }, { status: 400 });
      }
    }

    // Generate video with Tavus API
    const tavusResponse = await axios.post(`${TAVUS_API_URL}/v1/videos`, {
      replica_id: finalReplicaId,
      script: script,
    }, {
      headers: {
        'Authorization': `Bearer ${TAVUS_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (tavusResponse.status !== 200 && tavusResponse.status !== 201) {
      console.error('Error from Tavus API:', tavusResponse.data);
      return NextResponse.json(
        { error: 'Failed to generate video with Tavus API' },
        { status: 500 }
      );
    }

    const videoData = tavusResponse.data;

    // Store video in echoes table
    const { data: echo, error: echoError } = await supabaseAdmin
      .from('echoes')
      .insert([
        {
          content: script,
          user_id: user.id,
          tavus_video_id: videoData.id,
          video_data: JSON.stringify(videoData),
        },
      ])
      .select()
      .single();

    if (echoError) {
      console.error('Error creating echo with video data:', echoError);
      return NextResponse.json(
        { error: 'Failed to save echo', details: echoError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(videoData);
  } catch (error) {
    console.error('Error generating Tavus video:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Get video status
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

    // Get the video ID from query params
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');
    
    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    // Get the video status from Tavus API
    const tavusResponse = await axios.get(`${TAVUS_API_URL}/v1/videos/${videoId}`, {
      headers: {
        'Authorization': `Bearer ${TAVUS_API_KEY}`,
      },
    });

    if (tavusResponse.status !== 200) {
      console.error('Error from Tavus API:', tavusResponse.data);
      return NextResponse.json(
        { error: 'Failed to get video status from Tavus API' },
        { status: 500 }
      );
    }

    const videoData = tavusResponse.data;

    // If the video is ready, update the echo with the video URL
    if (videoData.status === 'ready' && videoData.url) {
      const { data: echo } = await supabaseAdmin
        .from('echoes')
        .select('id')
        .eq('tavus_video_id', videoId)
        .eq('user_id', user.id)
        .single();
        
      if (echo) {
        await supabaseAdmin
          .from('echoes')
          .update({
            video_data: JSON.stringify(videoData),
            video_url: videoData.url,
          })
          .eq('id', echo.id);
      }
    }

    return NextResponse.json(videoData);
  } catch (error) {
    console.error('Error getting Tavus video status:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}