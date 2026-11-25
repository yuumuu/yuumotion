import { Hono } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '../db/schema';
import { requireAuth, SESSION_COOKIE_NAME, signSessionToken, AuthPayload, AppEnv, rateLimitAuth } from '../middleware/auth';

export const authRoutes = new Hono<AppEnv>();

authRoutes.use('/login', rateLimitAuth(15, 60_000));
authRoutes.use('/register', rateLimitAuth(10, 60_000));

const cookieOpts = {
  httpOnly: true,
  sameSite: 'Lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
  secure: process.env.NODE_ENV === 'production'
};

authRoutes.post('/register', async (c) => {
  const body = await c.req.json<{ name?: string; email?: string; password?: string }>();
  const name = (body.name || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';

  if (!name || !email || password.length < 6) {
    return c.json({ error: 'Nama, email valid, dan password minimal 6 karakter wajib diisi.' }, 400);
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return c.json({ error: 'Email sudah terdaftar.' }, 409);
  }

  const id = `usr-${crypto.randomUUID()}`;
  const passwordHash = await bcrypt.hash(password, 10);
  const avatar = name.charAt(0).toUpperCase();

  await db.insert(users).values({
    id,
    name,
    email,
    passwordHash,
    avatar,
    color: '#6366F1',
    createdAt: Date.now()
  });

  const token = await signSessionToken({ sub: id, email, name });
  setCookie(c, SESSION_COOKIE_NAME, token, cookieOpts);

  return c.json({ user: { id, name, email, avatar, color: '#6366F1', isCloudAuth: true } }, 201);
});

authRoutes.post('/login', async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>();
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';

  const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = found[0];
  if (!user || !user.passwordHash) {
    return c.json({ error: 'Email atau password salah.' }, 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return c.json({ error: 'Email atau password salah.' }, 401);
  }

  const token = await signSessionToken({ sub: user.id, email: user.email, name: user.name });
  setCookie(c, SESSION_COOKIE_NAME, token, cookieOpts);

  return c.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      color: user.color,
      isCloudAuth: true
    }
  });
});

authRoutes.post('/logout', (c) => {
  deleteCookie(c, SESSION_COOKIE_NAME, { path: '/' });
  return c.json({ ok: true });
});

authRoutes.get('/me', requireAuth, async (c) => {
  const auth = c.get('user') as AuthPayload;
  const found = await db.select().from(users).where(eq(users.id, auth.sub)).limit(1);
  const user = found[0];
  if (!user) return c.json({ error: 'User tidak ditemukan' }, 404);

  return c.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      color: user.color,
      isCloudAuth: true
    }
  });
});

// Kerangka OAuth Redirect untuk GitHub & Google
authRoutes.get('/oauth/:provider', (c) => {
  const provider = c.req.param('provider');
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  if (provider === 'github' && process.env.GITHUB_CLIENT_ID) {
    const redirect = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user:email`;
    return c.redirect(redirect);
  }
  if (provider === 'google' && process.env.GOOGLE_CLIENT_ID) {
    const redirectUri = `${appUrl}/api/auth/oauth/google/callback`;
    const redirect = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile`;
    return c.redirect(redirect);
  }
  return c.json({ error: `OAuth ${provider} belum dikonfigurasi di environment.` }, 501);
});
