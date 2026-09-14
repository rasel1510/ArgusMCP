# Deployment & Database Guide 🚀

This guide explains how to deploy **MCP Web Analyzer** with maximum security, **Neon DB** (Serverless PostgreSQL), and **Vercel**.

---

## 🔒 Security & Privacy Guarantee

- **Zero Secrets in Git**: Your `.env`, `.env.local`, and any API keys (`OPENROUTER_API_KEY`, etc.) are explicitly excluded in [.gitignore](file:///.gitignore).
- **No Private Data in Commits**: Verification confirmed that no keys or credentials exist in the Git commit history.
- **Environment Variables**: All secret credentials are set securely in your hosting platform dashboard (e.g., Vercel / Render / Railway) and are never exposed publicly.

---

## 🐘 1. Database Setup: Neon DB (Serverless PostgreSQL)

Neon DB provides free, serverless PostgreSQL with auto-scaling and connection pooling.

1. Go to [https://neon.tech](https://neon.tech) and create a free account.
2. Click **Create Project** (choose a project name e.g. `mcp-webanalyzer`).
3. Under your project **Dashboard**, locate your **Connection Details**:
   - Choose **Pooled connection**
   - Copy the connection string format:
     ```text
     postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
4. Set this as your `DATABASE_URL` in your backend environment variables.
   > **Note**: `mcp_backend/src/db.ts` is already pre-configured to auto-detect Neon DB URLs, enable SSL encryption (`rejectUnauthorized: false`), and automatically run the table migrations on startup.

---

## ⚡ 2. Frontend Deployment: Vercel

The frontend is built with **Next.js 14 (App Router)** and is 100% optimized for Vercel.

### Step-by-Step Vercel Setup:
1. Go to [https://vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `rasel1510/MCP_Web_Analyzer_Agent`.
4. In the **Configure Project** screen:
   - **Root Directory**: Click *Edit* and select `frontend`.
   - **Framework Preset**: Next.js (automatically detected).
   - **Environment Variables**:
     | Variable Name | Value | Purpose |
     |---|---|---|
     | `BACKEND_INTERNAL_URL` | `https://your-backend-service.onrender.com` | URL of your deployed backend |
     | `NEXT_PUBLIC_BACKEND_URL` | `https://your-backend-service.onrender.com` | Public backend API URL |
5. Click **Deploy**. Vercel will build and assign you a fast global CDN domain (e.g. `https://mcp-webanalyzer.vercel.app`).

---

## 🖥️ 3. Backend Deployment (MCP & Headless Crawler)

The backend (`mcp_backend`) runs an Express server, Model Context Protocol tools, and **Playwright headless Chromium** for deep web scraping.

> **Why host backend on Render / Railway / VPS?**  
> Playwright runs a headless Chrome browser engine to render SPAs and JavaScript pages. Vercel Serverless Functions have strict 10s execution limits and binary size limits that can terminate long web crawls. A containerized or Node environment on **Render.com** (Free) or **Railway** is ideal.

### Deploying Backend on Render (Free & 1-Click):
1. Create a free account at [https://render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your repository `rasel1510/MCP_Web_Analyzer_Agent`.
4. Configure settings:
   - **Root Directory**: `mcp_backend`
   - **Build Command**: `npm install && npx playwright install chromium && npm run build`
   - **Start Command**: `npm run start`
5. Under **Environment Variables**, add:
   - `DATABASE_URL`: Your Neon DB connection string
   - `OPENROUTER_API_KEY`: Your private OpenRouter AI API key
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g. `https://your-project.vercel.app`)
   - `PORT`: `4000`
   - `NODE_ENV`: `production`
6. Click **Deploy Web Service**.
7. Copy your backend URL (e.g. `https://mcp-webanalyzer-backend.onrender.com`) and paste it into your Vercel frontend's `BACKEND_INTERNAL_URL` and `NEXT_PUBLIC_BACKEND_URL`.
