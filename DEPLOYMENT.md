# Deployment Guide: ArgusMCP 🚀

This guide provides an end-to-end walkthrough to deploy **ArgusMCP**:
- **Frontend**: Deployed to **Vercel** (Global Edge CDN)
- **Backend**: Deployed to **Render** (Easiest free-tier containerized platform with full Playwright Chromium support)
- **Database**: **Neon DB** (Free Serverless PostgreSQL with SSL)

---

## 🏗 Architecture Overview

```
[ User Browser ]
       │
       ▼
[ Vercel: Next.js 14 Frontend ]
       │  (Proxies requests via internal route handlers)
       ▼
[ Render: Express + MCP Backend (Docker with Playwright) ]
       ├──► [ Headless Chromium Engine (DOM / SPA Crawling) ]
       ├──► [ OpenRouter AI (LLM Analysis) ]
       └──► [ Neon PostgreSQL (Persistent Storage) ]
```

---

## 🐘 Step 1: Set Up Free Database (Neon Serverless PostgreSQL)

1. Sign up for a free account at **[neon.tech](https://neon.tech)**.
2. Click **Create Project** (Name: `argus-mcp`).
3. Under **Connection Details**, select **Pooled connection**.
4. Copy your connection URI. It will look like:
   ```text
   postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. *Keep this connection string ready for Step 2.* (ArgusMCP automatically creates and migrates all required database tables on first boot).

---

## 🖥 Step 2: Deploy Backend to Render (Recommended & Easiest)

> **Why Render?**  
> Playwright needs a Linux environment with Chromium and headless browser rendering dependencies. We have provided an official **`mcp_backend/Dockerfile`** that builds effortlessly on Render without any missing shared library issues.

1. Create a free account at **[render.com](https://render.com)**.
2. From your Render Dashboard, click **New +** ➔ **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your GitHub repo:
   `https://github.com/rasel1510/ArgusMCP`
4. Configure the Web Service settings:
   - **Name**: `argus-mcp-backend` (or your preferred name)
   - **Region**: Choose the region closest to you or your Neon database (e.g., Frankfurt or Ohio)
   - **Root Directory**: `mcp_backend`
   - **Language / Runtime**: Select **Docker** (Render will automatically pick up `mcp_backend/Dockerfile`)
   - **Instance Type**: **Free**
5. Scroll down to **Environment Variables** and add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `PORT` | `4000` | Port exposed by Dockerfile |
   | `NODE_ENV` | `production` | Production optimizations |
   | `OPENROUTER_API_KEY` | `sk-or-v1-...` | Your private OpenRouter AI key |
   | `DATABASE_URL` | `postgresql://neondb_owner:...` | Neon DB connection string from Step 1 |
   | `FRONTEND_URL` | `*` *(or your Vercel URL once created)* | Allowed CORS origin |
6. Click **Deploy Web Service**.
7. Render will build the Docker container and output logs. Once deployed, copy your service URL:
   `https://argus-mcp-backend.onrender.com`

---

## ⚡ Step 3: Deploy Frontend to Vercel

The frontend is built with **Next.js 14 App Router** and is natively optimized for Vercel.

1. Go to **[vercel.com](https://vercel.com)** and log in with GitHub.
2. Click **Add New...** ➔ **Project**.
3. Import your GitHub repository: `rasel1510/ArgusMCP`.
4. In the **Configure Project** setup:
   - **Project Name**: `argus-mcp` (or your choice)
   - **Framework Preset**: `Next.js` (automatically detected)
   - **Root Directory**: Click **Edit** and select **`frontend`** *(CRITICAL)*
5. Open the **Environment Variables** section and add:
   | Variable Name | Value | Purpose |
   | :--- | :--- | :--- |
   | `BACKEND_INTERNAL_URL` | `https://argus-mcp-backend.onrender.com` | Target URL of your Render backend |
6. Click **Deploy**.
7. In ~60 seconds, your site will be live at `https://argus-mcp.vercel.app`!

---

## 🔄 Step 4: Final Linkage & Verification

1. Open your deployed Vercel site: `https://your-project.vercel.app`.
2. Enter a website URL (e.g., `https://news.ycombinator.com` or `https://github.com`) and click **Analyze**.
3. Watch the real-time crawling, tech stack discovery, SEO audit, and interactive AI Q&A panel load!
4. *(Optional)* Go back to your Render backend dashboard ➔ Environment Variables, and update `FRONTEND_URL` to your exact Vercel URL (e.g., `https://argus-mcp.vercel.app`) for strict CORS security.

---

## 🛠 Alternative Backend Hosts

If you prefer not to use Render, you can also deploy `mcp_backend/Dockerfile` with 1 click to:
- **Railway.app**: Select *New Project* ➔ *Deploy from GitHub repo* ➔ Set Root Directory to `mcp_backend`.
- **Fly.io**: Run `fly launch` inside `mcp_backend/`.
- **Any VPS (Ubuntu/Debian)**: Run `docker run -d -p 4000:4000 --env-file .env $(docker build -q mcp_backend)`.
