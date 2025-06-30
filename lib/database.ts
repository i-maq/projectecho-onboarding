import { createClient } from '@supabase/supabase-js';

// Support both public and server env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Choose the key: prefer service role on server, anon on client
const supabaseKey =
  typeof window === 'undefined'
    ? (supabaseServiceKey || supabaseAnonKey)
    : supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Ensure SUPABASE_URL and a key are set.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

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