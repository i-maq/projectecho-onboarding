import axios from 'axios';
import FormData from 'form-data';

const TAVUS_API_URL = process.env.TAVUS_API_URL || 'https://api.tavus.io';
const TAVUS_API_KEY = process.env.TAVUS_API_KEY || 'b08e4c16d61747f995b612d7673dab64';

// Initialize axios instance with Tavus API base URL and auth
const tavusClient = axios.create({
  baseURL: TAVUS_API_URL,
  headers: {
    'Authorization': `Bearer ${TAVUS_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Interface for replica creation response
 */
export interface TavusReplica {
  id: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  created_at: string;
  updated_at: string;
  name?: string;
}

/**
 * Interface for video generation response
 */
export interface TavusVideo {
  id: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  created_at: string;
  updated_at: string;
  url?: string;
  replica_id: string;
}

/**
 * Create a new Tavus replica from video recording
 * @param videoBlob The recorded video blob
 * @param name Optional name for the replica
 */
export const createReplica = async (videoBlob: Blob, name: string): Promise<TavusReplica> => {
  try {
    const formData = new FormData();
    formData.append('video', videoBlob, 'user_recording.webm');
    formData.append('name', name);
    
    // Set correct headers for form data upload
    const headers = {
      ...tavusClient.defaults.headers,
      'Content-Type': 'multipart/form-data',
    };
    
    const response = await tavusClient.post('/v1/replicas', formData, { headers });
    return response.data;
  } catch (error) {
    console.error('Error creating Tavus replica:', error);
    throw error;
  }
};

/**
 * Get the status of a replica
 * @param replicaId The ID of the replica
 */
export const getReplicaStatus = async (replicaId: string): Promise<TavusReplica> => {
  try {
    const response = await tavusClient.get(`/v1/replicas/${replicaId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting replica status:', error);
    throw error;
  }
};

/**
 * Generate a video with the replica
 * @param replicaId The ID of the replica
 * @param script The script for the replica to say
 */
export const generateVideo = async (replicaId: string, script: string): Promise<TavusVideo> => {
  try {
    const response = await tavusClient.post('/v1/videos', {
      replica_id: replicaId,
      script,
    });
    return response.data;
  } catch (error) {
    console.error('Error generating video with Tavus:', error);
    throw error;
  }
};

/**
 * Get the status of a video
 * @param videoId The ID of the video
 */
export const getVideoStatus = async (videoId: string): Promise<TavusVideo> => {
  try {
    const response = await tavusClient.get(`/v1/videos/${videoId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting video status:', error);
    throw error;
  }
};

/**
 * List all replicas
 */
export const listReplicas = async (): Promise<TavusReplica[]> => {
  try {
    const response = await tavusClient.get('/v1/replicas');
    return response.data;
  } catch (error) {
    console.error('Error listing replicas:', error);
    throw error;
  }
};

/**
 * List all videos
 */
export const listVideos = async (): Promise<TavusVideo[]> => {
  try {
    const response = await tavusClient.get('/v1/videos');
    return response.data;
  } catch (error) {
    console.error('Error listing videos:', error);
    throw error;
  }
};

export default {
  createReplica,
  getReplicaStatus,
  generateVideo,
  getVideoStatus,
  listReplicas,
  listVideos,
};