import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Support both public and server env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Choose the key: prefer service role on server, anon on client
const supabaseKey =
  typeof window === 'undefined'
    ? (supabaseServiceKey || supabaseAnonKey)
    : supabaseAnonKey;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
} else {
  const provider = process.env.DATA_PROVIDER || 'mock';
  if (provider === 'supabase') {
    console.error('[database] DATA_PROVIDER is "supabase" but Supabase env vars are missing.');
  } else {
    console.info('[database] Supabase not configured — using mock data provider.');
  }
}

// Helper function to set user context for RLS
export const setUserContext = async (userId: number) => {
  if (!supabase) return;
  try {
    await supabase.rpc('set_config', {
      setting_name: 'app.current_user_id',
      setting_value: userId.toString(),
      is_local: true,
    });
  } catch (error) {
    console.error('Error setting user context:', error);
  }
};

export { supabase };
export default supabase;
