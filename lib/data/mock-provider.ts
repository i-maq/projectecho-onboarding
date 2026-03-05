import { DataProvider, User, UserProfile, Echo } from './types';

// In-memory data stores
const users: User[] = [];
const profiles: UserProfile[] = [];
const echoes: Echo[] = [];

let nextUserId = 1;
let nextProfileId = 1;
let nextEchoId = 1;

export const mockProvider: DataProvider = {
  async getUserByEmail(email: string): Promise<User | null> {
    return users.find(u => u.email === email.toLowerCase()) || null;
  },

  async createUser(email: string, hashedPassword: string): Promise<User | null> {
    const existing = users.find(u => u.email === email.toLowerCase());
    if (existing) return null;

    const user: User = {
      id: nextUserId++,
      email: email.toLowerCase(),
      password: hashedPassword,
    };
    users.push(user);
    return { id: user.id, email: user.email };
  },

  async getProfile(userId: number): Promise<UserProfile | null> {
    return profiles.find(p => p.user_id === userId) || null;
  },

  async upsertProfile(userId: number, data: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    age?: number;
  }): Promise<UserProfile | null> {
    const now = new Date().toISOString();
    const existing = profiles.find(p => p.user_id === userId);

    if (existing) {
      existing.first_name = data.firstName;
      existing.last_name = data.lastName;
      existing.date_of_birth = data.dateOfBirth || null;
      existing.age = data.age || null;
      existing.updated_at = now;
      return existing;
    }

    const profile: UserProfile = {
      id: nextProfileId++,
      user_id: userId,
      first_name: data.firstName,
      last_name: data.lastName,
      date_of_birth: data.dateOfBirth || null,
      age: data.age || null,
      created_at: now,
      updated_at: now,
    };
    profiles.push(profile);
    return profile;
  },

  async getEchoes(userId: number): Promise<Echo[]> {
    return echoes
      .filter(e => e.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createEcho(userId: number, content: string): Promise<Echo | null> {
    const now = new Date().toISOString();
    const echo: Echo = {
      id: nextEchoId++,
      user_id: userId,
      content,
      created_at: now,
      updated_at: now,
    };
    echoes.push(echo);
    return echo;
  },
};
