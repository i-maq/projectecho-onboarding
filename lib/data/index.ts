import { DataProvider } from './types';
import { mockProvider } from './mock-provider';

function getProvider(): DataProvider {
  const providerType = process.env.DATA_PROVIDER || 'mock';

  if (providerType === 'supabase') {
    // Dynamic import to avoid loading Supabase when not needed
    const { supabaseProvider } = require('./supabase-provider');
    return supabaseProvider;
  }

  return mockProvider;
}

export const db: DataProvider = getProvider();
export type { DataProvider, User, UserProfile, Echo } from './types';
