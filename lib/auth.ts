// lib/auth.ts
import jwt, { JwtPayload } from 'jsonwebtoken';

// This secret should be in your .env.local file
const JWT_SECRET = process.env.JWT_SECRET;

// 1. Define the specific shape of our JWT payload
export interface UserJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
}

export function signJwt(payload: UserJwtPayload) {
  // 2. We check for the secret right before using it.
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
    // 3. We tell verify what kind of object to expect.
    const decoded = jwt.verify(token, JWT_SECRET) as UserJwtPayload;
    return decoded;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
}
