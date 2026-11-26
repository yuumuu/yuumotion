# Panduan Deployment Yuumotion ke Wasmer Edge

Yuumotion berjalan sebagai aplikasi **full-stack Node.js 24 + Hono + React SPA** di **Wasmer Edge**, terhubung ke **Wasmer Managed MySQL** dan **Wasmer Persistent Volume** untuk penyimpanan file unggahan.

## 1. Prasyarat

1. **Wasmer CLI** (`wasmer >= 7.x`):
   ```powershell
   irm https://cli.wasmer.io/install.ps1 | iex
   ```
2. Login ke akun Wasmer:
   ```bash
   wasmer login
   wasmer whoami
   ```

---

## 2. Konfigurasi Deployment

### `app.yaml`
File `app.yaml` di root proyek mendeklarasikan runtime, environment, database MySQL, dan volume persisten:

```yaml
kind: wasmer.io/App.v0
name: yuumotion
owner: yuumuu
package: .
debug: true

env:
  NODE_ENV: production
  PORT: "8080"
  UPLOAD_DIR: /app/storage/uploads
  APP_URL: https://yuumotion.wasmer.app

capabilities:
  database:
    engine: mysql

volumes:
  - name: uploads
    mount: /app/storage/uploads
```

### `Anybuild`
File `Anybuild` memastikan remote builder Wasmer menjalankan build frontend + bundle ESM server (`esbuild`) dan memulai proses Hono:

```python
load("//anybuild/tools:node.bzl", "node_build", "node_config", "node_serve")

config = node_config(
    schema = 1,
    node_server = "hono",
    node_version = "24",
    commands = {
        "build": "npm run build && npm run build:server",
        "start": "node server/dist/index.js",
    },
)

build = node_build(config)
node_serve(config, build, name = "yuumotion")
```

---

## 3. Pengaturan Secret & Database

1. **JWT Secret** (wajib di mode `production`, jangan pernah disimpan di git):
   ```powershell
   wasmer app secret create --app yuumuu/yuumotion --non-interactive JWT_SECRET "<random-hex-48-char>"
   ```
2. **MySQL Wasmer**:
   Wasmer otomatis mem-provision database MySQL dan menyuntikkan variabel lingkungan `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, dan `DB_PASSWORD`. Modul `server/src/db/index.ts` membaca variabel tersebut secara otomatis (dengan SSL aktif) dan menjalankan `ensureSchema()` saat server menyala.
3. **Volume Storage**:
   Direktori `/app/storage/uploads` bersifat persisten lintas *deployment* untuk menyimpan file lampiran kartu dari `/api/uploads`.

---

## 4. Menjalankan Deploy

```bash
wasmer deploy --non-interactive --build-remote
```

Setelah rollout selesai, verifikasi endpoint kesehatan dan aplikasi:
- **Live App**: `https://yuumotion.wasmer.app`
- **Healthcheck**: `https://yuumotion.wasmer.app/api/health`
- **Cek Log & Database**:
  ```bash
  wasmer app logs yuumuu/yuumotion
  wasmer app database list yuumuu/yuumotion
  wasmer app volume list yuumuu/yuumotion
  ```
