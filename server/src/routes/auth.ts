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

async function upsertOAuthUser(provider: string, oauthId: string, email: string, name: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
  if (existing[0]) {
    await db
      .update(users)
      .set({ oauthProvider: provider, oauthId })
      .where(eq(users.id, existing[0].id));
    return existing[0];
  }
  const id = `usr-${crypto.randomUUID()}`;
  const avatar = (name || normalizedEmail).charAt(0).toUpperCase();
  const newUser = {
    id,
    name: name || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    passwordHash: null,
    oauthProvider: provider,
    oauthId,
    avatar,
    color: '#2563EB',
    createdAt: Date.now()
  };
  await db.insert(users).values(newUser);
  return newUser;
}

// OAuth Redirect & Callback untuk GitHub & Google
authRoutes.get('/oauth/:provider', (c) => {
  const provider = c.req.param('provider');
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  if (provider === 'github' && process.env.GITHUB_CLIENT_ID) {
    const redirectUri = `${appUrl}/api/auth/oauth/github/callback`;
    const redirect = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
    return c.redirect(redirect);
  }
  if (provider === 'google' && process.env.GOOGLE_CLIENT_ID) {
    const redirectUri = `${appUrl}/api/auth/oauth/google/callback`;
    const redirect = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile`;
    return c.redirect(redirect);
  }
  return c.json({ error: `OAuth ${provider} belum dikonfigurasi di environment.` }, 501);
});

authRoutes.get('/oauth/github/callback', async (c) => {
  const code = c.req.query('code');
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  if (!code || !process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return c.redirect(`${appUrl}/#auth`);
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    })
  });
  const tokenData = (await tokenRes.json()) as { access_token?: string };
  if (!tokenData.access_token) return c.redirect(`${appUrl}/#auth`);

  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'Yuumotion' }
  });
  const ghUser = (await userRes.json()) as { id: number; name?: string; login?: string; email?: string };
  const email = ghUser.email || `${ghUser.login || ghUser.id}@users.noreply.github.com`;
  const user = await upsertOAuthUser('github', String(ghUser.id), email, ghUser.name || ghUser.login || 'GitHub User');

  const jwt = await signSessionToken({ sub: user.id, email: user.email, name: user.name });
  setCookie(c, SESSION_COOKIE_NAME, jwt, cookieOpts);
  return c.redirect(`${appUrl}/#app`);
});

authRoutes.get('/oauth/google/callback', async (c) => {
  const code = c.req.query('code');
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  if (!code || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return c.redirect(`${appUrl}/#auth`);
  }

  const redirectUri = `${appUrl}/api/auth/oauth/google/callback`;
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  });
  const tokenData = (await tokenRes.json()) as { access_token?: string };
  if (!tokenData.access_token) return c.redirect(`${appUrl}/#auth`);

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const gUser = (await profileRes.json()) as { id: string; email?: string; name?: string };
  if (!gUser.email) return c.redirect(`${appUrl}/#auth`);

  const user = await upsertOAuthUser('google', gUser.id, gUser.email, gUser.name || gUser.email.split('@')[0]);
  const jwt = await signSessionToken({ sub: user.id, email: user.email, name: user.name });
  setCookie(c, SESSION_COOKIE_NAME, jwt, cookieOpts);
  return c.redirect(`${appUrl}/#app`);
});
