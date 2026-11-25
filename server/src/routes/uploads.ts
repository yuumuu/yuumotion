import { Hono } from 'hono';
import { db } from '../db';
import { uploads } from '../db/schema';
import { requireAuth, AuthPayload, AppEnv } from '../middleware/auth';

export const uploadRoutes = new Hono<AppEnv>();

uploadRoutes.use('*', requireAuth);

// Endpoint upload ke Wasmer Storage / S3-compatible dengan fallback data-URL untuk dev lokal
uploadRoutes.post('/', async (c) => {
  const auth = c.get('user') as AuthPayload;
  const form = await c.req.formData();
  const file = form.get('file');
  const workspaceId = String(form.get('workspaceId') || '');

  if (!file || !(file instanceof File)) {
    return c.json({ error: 'File tidak ditemukan di payload form-data.' }, 400);
  }

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
    const targetUrl = `${storageEndpoint.replace(/\/$/, '')}/${bucket}/${uploadId}-${encodeURIComponent(file.name)}`;
    const putRes = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream'
      },
      body: buffer
    });
    if (!putRes.ok) {
      return c.json({ error: 'Gagal mengunggah ke Wasmer Storage.' }, 502);
    }
    storageUrl = targetUrl;
  } else {
    const base64 = Buffer.from(buffer).toString('base64');
    storageUrl = `data:${file.type || 'application/octet-stream'};base64,${base64}`;
  }

  await db.insert(uploads).values({
    id: uploadId,
    workspaceId: workspaceId || null,
    userId: auth.sub,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    storageUrl,
    createdAt: Date.now()
  });

  return c.json({
    id: uploadId,
    name: file.name,
    mimeType: file.type,
    size: file.size,
    url: storageUrl
  }, 201);
});
