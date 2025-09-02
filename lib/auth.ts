// lib/auth.ts
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// 1. ====================================================================
// THE FIX: Add the 'name' property to our JWT payload interface.
// ====================================================================
export interface UserJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
  name: string; // <-- ADD THIS LINE
}

export function signJwt(payload: UserJwtPayload) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwt(token: string): UserJwtPayload | null {
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined, cannot verify token.');
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserJwtPayload;
    return decoded;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
}