# Deploying Yuumotion to Wasmer Edge (Free Tier)

This guide details how to build and deploy Yuumotion to Wasmer Edge using the official `wasmer/static-web-server`.

## Prerequisites

1. Install Wasmer CLI (if not already installed):
   ```powershell
   # Windows PowerShell
   irm https://cli.wasmer.io/install.ps1 | iex
   ```
2. Log in or configure your Wasmer account:
   ```bash
   wasmer login
   ```

## Configuration: `wasmer.toml`

The project root contains `wasmer.toml`:
```toml
[package]
name = "your-username/yuumotion"
version = "0.1.0"
description = "AppFlowy-inspired collaborative Kanban workspace"
license = "MIT"

[dependencies]
"wasmer/static-web-server" = "^1"

[fs]
public = "dist"
```

## Deployment Steps

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Build static production assets:
   ```bash
   npm run build
   ```
   This creates the optimized static bundle in `dist/`.

3. Deploy to Wasmer Edge:
   ```bash
   wasmer deploy
   ```

4. Wasmer will output your live URL:
   ```
   https://yuumotion-<id>.wasmer.app
   ```
