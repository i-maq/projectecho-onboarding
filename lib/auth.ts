import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generate a random dev secret (persists for process lifetime)
const DEV_SECRET = crypto.randomBytes(32).toString('hex');

// Use JWT_SECRET from env, or fall back to dev secret for local development and build
const JWT_SECRET = process.env.JWT_SECRET || DEV_SECRET;

if (!process.env.JWT_SECRET) {
  // Only warn at runtime (not during build) — check if we're actually handling a request
  if (typeof globalThis !== 'undefined') {
    console.warn('[auth] No JWT_SECRET set — using auto-generated dev secret. Tokens will not persist across restarts.');
  }
}

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