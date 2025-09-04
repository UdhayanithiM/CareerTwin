import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

// This is the secret key for signing the JWT. It MUST be in your .env.local file
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface UserJwtPayload {
  id: string;
  email: string;
  role: string;
  name: string;
  jti: string; // jti is a standard claim for JWT ID
  iat: number; // iat is a standard claim for issued at time
}

// Function to sign a new token (used in the login API)
export async function signJwt(payload: { id: string, email: string, role: string, name: string }) {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 60 * 60 * 24 * 7; // 7 days expiration

    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setExpirationTime(exp)
        .setIssuedAt(iat)
        .setNotBefore(iat)
        .sign(secretKey);
}

// Function to verify a token (used in API routes for full security)
export async function verifyJwt(token: string): Promise<UserJwtPayload | null> {
    try {
        const { payload } = await jwtVerify<UserJwtPayload>(token, secretKey);
        return payload;
    } catch (error) {
        console.error('JWT Verification Error:', error);
        return null;
    }
}

// Helper function to get the current session from the cookie
export async function getSession(): Promise<UserJwtPayload | null> {
    const token = cookies().get('token')?.value;
    if (token) {
        return await verifyJwt(token);
    }
    return null;
}