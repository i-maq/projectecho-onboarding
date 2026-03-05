export interface User {
  id: number;
  email: string;
  password?: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  age: number | null;
  created_at: string;
  updated_at: string;
}

export interface Echo {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface DataProvider {
  // Auth
  getUserByEmail(email: string): Promise<User | null>;
  createUser(email: string, hashedPassword: string): Promise<User | null>;

  // Profile
  getProfile(userId: number): Promise<UserProfile | null>;
  upsertProfile(userId: number, data: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    age?: number;
  }): Promise<UserProfile | null>;

  // Echoes
  getEchoes(userId: number): Promise<Echo[]>;
  createEcho(userId: number, content: string): Promise<Echo | null>;
}
