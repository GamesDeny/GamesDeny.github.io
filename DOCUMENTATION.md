# Portfolio — Deployment & Operations Guide

## Table of Contents

1. [Local Development](#1-local-development)
2. [Environment Variables](#2-environment-variables)
3. [Production Build (bare metal / VPS)](#3-production-build-bare-metal--vps)
4. [Containerisation with Docker](#4-containerisation-with-docker)
5. [Docker Compose (with reverse proxy)](#5-docker-compose-with-reverse-proxy)
6. [Server / Hosting Options](#6-server--hosting-options)
7. [CI / CD Sketch](#7-ci--cd-sketch)
8. [Checklist before going live](#8-checklist-before-going-live)

---

## 1. Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill environment variables
cp .env.local.example .env.local   # create this file if it doesn't exist yet
#    → fill in ADMIN_PASSWORD, NEXT_PUBLIC_LEETCODE, etc.

# 3. Start dev server (hot reload, Turbopack)
npm run dev
# → http://localhost:3000
```

Content files live in `content/*.json`. Edit them directly or through the admin panel at `/admin`.

---

## 2. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ADMIN_PASSWORD` | **yes** | Password for the `/admin` panel. Cookie is compared to this value. |
| `NEXT_PUBLIC_LEETCODE` | no | Full LeetCode profile URL, e.g. `https://leetcode.com/u/you/` |
| `NEXT_PUBLIC_ROADMAP_USERNAME` | no | roadmap.sh username for the contact link |

> **Never commit `.env.local`**. It is already in `.gitignore`.

For production, set these as environment variables in your hosting platform (Vercel dashboard, Docker `--env-file`, systemd `EnvironmentFile`, etc.).

---

## 3. Production Build (bare metal / VPS)

If you are running directly on a server with Node.js installed:

```bash
# Build
npm run build

# Start (default port 3000)
npm start

# Custom port
PORT=8080 npm start
```

To keep the process alive use **PM2**:

```bash
npm install -g pm2

pm2 start npm --name portfolio -- start
pm2 save
pm2 startup   # follow the printed command to register as a system service
```

---

## 4. Containerisation with Docker

### 4a. Enable standalone output

Add this to `next.config.ts` (or `next.config.js`):

```ts
const nextConfig = {
  output: "standalone",
  // ... rest of your config
};
export default nextConfig;
```

The standalone build copies only the files needed to run — the image stays small (~150 MB vs ~1 GB without it).

### 4b. Dockerfile

```dockerfile
# ── Stage 1: install deps ──────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: build ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Stage 3: runtime (minimal) ─────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# standalone output + static assets
COPY --from=builder /app/public                          ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static

# content directory must be writable (admin saves JSON here)
RUN mkdir -p content && chown nextjs:nodejs content
COPY --chown=nextjs:nodejs content/ ./content/

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

### 4c. .dockerignore

```
.git
.next
node_modules
.env.local
*.md
```

### 4d. Build & run

```bash
# Build image
docker build -t portfolio:latest .

# Run (pass env vars at runtime, not baked in)
docker run -d \
  --name portfolio \
  -p 3000:3000 \
  -e ADMIN_PASSWORD=yourpassword \
  -e NEXT_PUBLIC_LEETCODE=https://leetcode.com/u/you/ \
  -v $(pwd)/content:/app/content \   # persist admin edits outside the container
  portfolio:latest
```

> **The `-v content` mount is important.** Without it, every container restart wipes admin edits because `content/*.json` lives inside the container layer.

---

## 5. Docker Compose (with reverse proxy)

A production-ready `docker-compose.yml` with Caddy as the reverse proxy (automatic HTTPS via Let's Encrypt):

```yaml
services:

  portfolio:
    image: portfolio:latest
    build: .
    restart: unless-stopped
    environment:
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - NEXT_PUBLIC_LEETCODE=${NEXT_PUBLIC_LEETCODE}
      - NEXT_PUBLIC_ROADMAP_USERNAME=${NEXT_PUBLIC_ROADMAP_USERNAME}
    volumes:
      - ./content:/app/content   # persist JSON edits
    expose:
      - "3000"

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - portfolio

volumes:
  caddy_data:
  caddy_config:
```

**Caddyfile** (replace `yourdomain.com`):

```
yourdomain.com {
    reverse_proxy portfolio:3000
}
```

Deploy:

```bash
# First time
docker compose up -d --build

# After code changes
docker compose build portfolio
docker compose up -d --no-deps portfolio

# View logs
docker compose logs -f portfolio
```

### Nginx alternative

If you prefer Nginx over Caddy (no automatic HTTPS — you handle certs with Certbot):

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 6. Server / Hosting Options

| Option | Cost | Effort | HTTPS | Best for |
|---|---|---|---|---|
| **Vercel** (recommended) | Free tier available | Minimal — push to GitHub, done | Automatic | Quickest path to prod; zero-config Next.js support |
| **Railway** | ~$5/month | Low — connect repo or push Docker image | Automatic | Simple VPS alternative with a good DX |
| **Fly.io** | Free tier + usage | Low — `fly launch` auto-detects Next.js | Automatic | Edge deployment, global low-latency |
| **Hetzner VPS** (CX22) | ~€4/month | Medium — set up Docker + Caddy yourself | Via Caddy | Best price/performance ratio for self-hosted |
| **DigitalOcean Droplet** | $6/month | Medium | Via Caddy/Nginx | Good docs, familiar UX |
| **Coolify** (self-hosted PaaS) | VPS cost only | Medium — one-click deploy from Git | Automatic | Heroku-like DX on your own server |
| **AWS EC2 t3.micro** | Free tier 1y, then ~$10/month | High — security groups, IAM, etc. | Via ACM + ALB | If you already live in the AWS ecosystem |

### Recommended path

```
Personal / portfolio  →  Vercel (free, zero ops, automatic previews per branch)
More control needed   →  Hetzner CX22 + Docker Compose + Caddy
Full self-hosted PaaS →  Hetzner + Coolify (manages deploys, HTTPS, env vars via UI)
```

---

## 7. CI / CD Sketch

### GitHub Actions — deploy to VPS on push to `main`

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build & push Docker image
        run: |
          docker build -t portfolio:${{ github.sha }} .
          # push to your registry (GitHub Container Registry, Docker Hub, etc.)
          docker tag portfolio:${{ github.sha }} ghcr.io/${{ github.repository }}:latest
          echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker push ghcr.io/${{ github.repository }}:latest

      - name: Deploy on server via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            docker pull ghcr.io/${{ github.repository }}:latest
            docker compose -f /srv/portfolio/docker-compose.yml up -d --no-deps portfolio
```

For **Vercel**, CI/CD is built in — every push to `main` deploys automatically. Every PR gets a preview URL.

---

## 8. Checklist before going live

- [ ] `ADMIN_PASSWORD` set to a strong secret (not `admin`, not `password`)
- [ ] `.env.local` is in `.gitignore` and not committed
- [ ] `content/` directory is mounted as a volume (Docker) or backed up (VPS) so admin edits survive restarts
- [ ] HTTPS is enabled (Caddy auto-handles this; Vercel/Railway/Fly do it automatically)
- [ ] OG meta tags filled in (`src/app/layout.tsx`) — title, description, og:image
- [ ] `public/resume.pdf` is up to date
- [ ] Run `npm run build` locally one last time before pushing — catch TypeScript errors before CI does
- [ ] Test the admin panel at `/admin` on the production URL
- [ ] Verify all environment variables are set in the hosting platform's dashboard
