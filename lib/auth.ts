import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
  const client = await pool.connect();
  
  try {
    const hashedPassword = await hashPassword(password);
    const result = await client.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  } finally {
    client.release();
  }
};

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  const client = await pool.connect();
  
  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    const isValid = await comparePassword(password, user.password);
    
    if (!isValid) {
      return null;
    }
    
    return { id: user.id, email: user.email };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  } finally {
    client.release();
  }
};