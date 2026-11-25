import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { jwtVerify, SignJWT } from 'jose';
import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { workspaceMembers } from '../db/schema';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production.');
    }
    return new TextEncoder().encode('yuumotion-dev-only-secret');
  }
  return new TextEncoder().encode(secret);
};

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

const ROLE_WEIGHT: Record<string, number> = {
  viewer: 1,
  member: 2,
  admin: 3,
  owner: 4
};

export async function checkWorkspaceRole(
  userId: string,
  workspaceId: string,
  minRole: 'viewer' | 'member' | 'admin' | 'owner' = 'viewer'
): Promise<boolean> {
  const rows = await db
    .select()
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)))
    .limit(1);

  const member = rows[0];
  if (!member) return false;
  return (ROLE_WEIGHT[member.role] || 0) >= ROLE_WEIGHT[minRole];
}

const rateHits = new Map<string, number[]>();
let lastPruneAt = Date.now();

export function rateLimitAuth(maxAttempts = 15, windowMs = 60_000) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-real-ip') || c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    const now = Date.now();

    // Bersihkan entri kadaluarsa secara berkala agar Map tidak tumbuh tanpa batas
    if (now - lastPruneAt > windowMs) {
      for (const [key, hits] of rateHits.entries()) {
        const active = hits.filter((ts) => now - ts < windowMs);
        if (active.length === 0) rateHits.delete(key);
        else rateHits.set(key, active);
      }
      lastPruneAt = now;
    }

    const recent = (rateHits.get(ip) || []).filter((ts) => now - ts < windowMs);
    if (recent.length >= maxAttempts) {
      return c.json({ error: 'Terlalu banyak percobaan. Coba lagi sebentar.' }, 429);
    }
    recent.push(now);
    rateHits.set(ip, recent);
    await next();
  };
}
