import { Hono } from 'hono';
import fs from 'node:fs/promises';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { uploads } from '../db/schema';
import { requireAuth, AuthPayload, AppEnv } from '../middleware/auth';

export const uploadRoutes = new Hono<AppEnv>();

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

function getVolumeDir(): string {
  return process.env.UPLOAD_DIR || '/app/storage/uploads';
}

uploadRoutes.get('/:id/:fileName', async (c) => {
  const id = c.req.param('id');
  if (!id) return c.json({ error: 'ID tidak valid.' }, 400);

  const [record] = await db.select().from(uploads).where(eq(uploads.id, id));
  if (!record) return c.json({ error: 'File tidak ditemukan.' }, 404);

  const filePath = path.join(getVolumeDir(), `${record.id}-${sanitizeUploadFileName(record.fileName)}`);
  try {
    const data = await fs.readFile(filePath);
    return new Response(data, {
      headers: {
        'Content-Type': record.mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch {
    return c.json({ error: 'File fisik tidak ditemukan di volume.' }, 404);
  }
});

// Endpoint upload ke Wasmer Storage (S3), Wasmer Volume (/app/storage/uploads), atau fallback data-URL
uploadRoutes.post('/', requireAuth, async (c) => {
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
    const volumeDir = getVolumeDir();
    try {
      await fs.mkdir(volumeDir, { recursive: true });
      await fs.writeFile(path.join(volumeDir, `${uploadId}-${safeName}`), Buffer.from(buffer));
      storageUrl = `/api/uploads/${uploadId}/${encodeURIComponent(safeName)}`;
    } catch {
      const base64 = Buffer.from(buffer).toString('base64');
      storageUrl = `data:${mimeType};base64,${base64}`;
    }
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
