import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key for database operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export { supabase };

// Helper function to set user context for RLS
export const setUserContext = async (userId: number) => {
  await supabase.rpc('set_config', {
    setting_name: 'app.current_user_id',
    setting_value: userId.toString(),
    is_local: true,
  });
};

export default supabase;