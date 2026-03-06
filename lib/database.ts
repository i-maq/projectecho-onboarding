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

let supabase: SupabaseClient;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
} else {
  console.warn('Missing Supabase environment variables. Server-side DB operations will fail.');
  // Create a placeholder that will throw at call-time rather than at import-time
  supabase = new Proxy({} as SupabaseClient, {
    get() {
      throw new Error('Supabase client not initialized — missing environment variables.');
    },
  });
}

export { supabase };

// Helper function to set user context for RLS
export const setUserContext = async (userId: number) => {
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

export default supabase;
