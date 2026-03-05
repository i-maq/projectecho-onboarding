import { DataProvider, User, UserProfile, Echo } from './types';

// Lazy import to avoid crashing when Supabase env vars are missing
let supabase: any = null;

function getSupabase() {
  if (!supabase) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { supabase: client } = require('../database');
    supabase = client;
  }
  return supabase;
}

export const supabaseProvider: DataProvider = {
  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await getSupabase()
      .from('users')
      .select('id, email, password')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !data) return null;
    return data;
  },

  async createUser(email: string, hashedPassword: string): Promise<User | null> {
    const { data, error } = await getSupabase()
      .from('users')
      .insert([{ email: email.toLowerCase(), password: hashedPassword }])
      .select('id, email')
      .single();

    if (error || !data) return null;
    return data;
  },

  async getProfile(userId: number): Promise<UserProfile | null> {
    const { data, error } = await getSupabase()
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data;
  },

  async upsertProfile(userId: number, profileData: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    age?: number;
  }): Promise<UserProfile | null> {
    const { data, error } = await getSupabase()
      .from('user_profiles')
      .upsert(
        {
          user_id: userId,
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          date_of_birth: profileData.dateOfBirth,
          age: profileData.age,
        },
        { onConflict: 'user_id' }
      )
      .select('*')
      .single();

    if (error || !data) return null;
    return data;
  },

  async getEchoes(userId: number): Promise<Echo[]> {
    const { data, error } = await getSupabase()
      .from('echoes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  },

  async createEcho(userId: number, content: string): Promise<Echo | null> {
    const { data, error } = await getSupabase()
      .from('echoes')
      .insert([{ content, user_id: userId }])
      .select()
      .single();

    if (error || !data) return null;
    return data;
  },
};
