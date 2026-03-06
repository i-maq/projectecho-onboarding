import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

let supabaseAdmin: SupabaseClient;

if (supabaseUrl && supabaseServiceKey) {
  // Admin client for server-side operations with RLS bypass
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} else {
  console.warn('Missing Supabase admin environment variables. Admin DB operations will fail.');
  supabaseAdmin = new Proxy({} as SupabaseClient, {
    get() {
      throw new Error('Supabase admin client not initialized — missing environment variables.');
    },
  });
}

export { supabaseAdmin };

// Helper function to set user context for RLS
export const setUserContext = async (userId: number) => {
  try {
    await supabaseAdmin.rpc('set_config', {
      setting_name: 'app.current_user_id',
      setting_value: userId.toString(),
      is_local: true,
    });
  } catch (error) {
    console.error('Error setting user context:', error);
  }
};
