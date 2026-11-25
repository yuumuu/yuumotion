import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { jwtVerify, SignJWT } from 'jose';

const getJwtSecret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET || 'yuumotion-dev-secret-change-in-prod');

export const SESSION_COOKIE_NAME = 'yuumotion_session';

export interface AuthPayload {
  sub: string;
  email: string;
  name: string;
}

export type AppEnv = {
  Variables: {
    user: AuthPayload;
  };
};

export async function signSessionToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

export async function requireAuth(c: Context, next: Next) {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    c.set('user', {
      sub: String(payload.sub),
      email: String(payload.email || ''),
      name: String(payload.name || '')
    } as AuthPayload);
    await next();
  } catch {
    return c.json({ error: 'Invalid or expired session' }, 401);
  }
}
