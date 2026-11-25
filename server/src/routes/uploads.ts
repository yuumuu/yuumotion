import { Hono } from 'hono';
import { db } from '../db';
import { uploads } from '../db/schema';
import { requireAuth, AuthPayload, AppEnv } from '../middleware/auth';

export const uploadRoutes = new Hono<AppEnv>();

uploadRoutes.use('*', requireAuth);

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'text/markdown'
]);

function sanitizeUploadFileName(rawName: string): string {
  const base = rawName.replace(/[/\\]/g, '_').replace(/[^a-zA-Z0-9._-]/g, '_');
  return base.slice(0, 120) || 'file';
}

// Endpoint upload ke Wasmer Storage / S3-compatible dengan fallback data-URL untuk dev lokal
uploadRoutes.post('/', async (c) => {
  const auth = c.get('user') as AuthPayload;
  const form = await c.req.formData();
  const file = form.get('file');
  const workspaceId = String(form.get('workspaceId') || '');

  if (!file || !(file instanceof File)) {
    return c.json({ error: 'File tidak ditemukan di payload form-data.' }, 400);
  }

  const mimeType = file.type || 'application/octet-stream';
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return c.json({ error: 'Tipe file tidak diizinkan. Gunakan gambar (PNG/JPG/WEBP/GIF), PDF, atau teks.' }, 415);
  }

  const safeName = sanitizeUploadFileName(file.name);
  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    return c.json({ error: 'Ukuran file maksimal 5 MB.' }, 413);
  }

  const buffer = await file.arrayBuffer();
  const uploadId = `upl-${crypto.randomUUID()}`;
  const storageEndpoint = process.env.WASMER_STORAGE_ENDPOINT;
  const bucket = process.env.WASMER_STORAGE_BUCKET || 'yuumotion-uploads';

  let storageUrl = '';
  if (storageEndpoint) {
    // Upload ke endpoint S3/Wasmer Storage jika kredensial tersedia
    const targetUrl = `${storageEndpoint.replace(/\/$/, '')}/${bucket}/${uploadId}-${encodeURIComponent(safeName)}`;
    const putRes = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': mimeType
      },
      body: buffer
    });
    if (!putRes.ok) {
      return c.json({ error: 'Gagal mengunggah ke Wasmer Storage.' }, 502);
    }
    storageUrl = targetUrl;
  } else {
    const base64 = Buffer.from(buffer).toString('base64');
    storageUrl = `data:${mimeType};base64,${base64}`;
  }

  await db.insert(uploads).values({
    id: uploadId,
    workspaceId: workspaceId || null,
    userId: auth.sub,
    fileName: safeName,
    mimeType,
    size: file.size,
    storageUrl,
    createdAt: Date.now()
  });

  return c.json({
    id: uploadId,
    name: safeName,
    mimeType,
    size: file.size,
    url: storageUrl
  }, 201);
});
