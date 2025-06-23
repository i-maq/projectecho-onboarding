import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export interface User {
  id: number;
  email: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user: User): string => {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): User | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { id: decoded.userId, email: decoded.email };
  } catch {
    return null;
  }
};

export const createUser = async (email: string, password: string): Promise<User | null> => {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      console.log('User already exists');
      return null; // User already exists
    }

    const hashedPassword = await hashPassword(password);
    
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: email.toLowerCase(),
          password: hashedPassword,
        },
      ])
      .select('id, email')
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      console.log('User not found');
      return null;
    }

    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      console.log('Invalid password');
      return null;
    }

    return { id: user.id, email: user.email };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
};