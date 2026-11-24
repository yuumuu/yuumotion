# Yuumotion 🚀

AppFlowy-inspired collaborative Kanban workspace crafted for frictionless multi-user synchronization and zero-cost hosting on Wasmer Edge Free Tier.

## ✨ Highlights

- **AppFlowy Aesthetic**: Clean typography, pastel tags, responsive Kanban columns, and immersive card document modal.
- **Multi-User Collaboration**: Live updates across clients with real-time broadcast channels and active presence indicators.
- **Local-First & Offline**: Instant 0ms reads and writes persisted to browser storage with JSON export/import.
- **Wasmer Edge Ready**: Configured out of the box with `wasmer.toml` and `wasmer/static-web-server`.

## 🛠️ Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser. Open multiple tabs or windows to see instant real-time card and column synchronization.

## 📦 Build & Deploy to Wasmer Edge

```bash
# Build production bundle
npm run build

# Deploy to Wasmer Edge
wasmer deploy
```

## 📖 Documentation

Explore the `/docs` directory for complete design and architecture specifications:
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): System architecture and data flow.
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md): AppFlowy-style UI color palette and typography.
- [`docs/DEPLOYMENT_WASMER.md`](docs/DEPLOYMENT_WASMER.md): Step-by-step Wasmer Edge deployment guide.
- [`docs/MULTIUSER_SYNC.md`](docs/MULTIUSER_SYNC.md): Multi-user concurrency, broadcast protocol, and conflict resolution.
