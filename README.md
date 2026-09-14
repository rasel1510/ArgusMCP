# MCP Web Analyzer Agent 🌐🤖

An AI-powered web analysis and intelligence platform built on the **Model Context Protocol (MCP)**, **Playwright**, **OpenRouter AI (LLM)**, **Express**, and **Next.js**.

---

## 🌟 Highlights & Features

- **MCP-Native Architecture**: Integrates with the official Model Context Protocol (`@modelcontextprotocol/sdk`) exposing modular tools for dynamic web scraping, semantic analysis, and structured reporting.
- **Deep Web Scraping & Crawling**: Uses Playwright and Cheerio for headless browser rendering, single-page application (SPA) support, and multi-page crawl discovery.
- **AI-Driven Intelligence**: Powered by OpenRouter AI (e.g. GPT-4o-mini) to generate comprehensive SEO audits, readability scores, competitive intelligence, and structural insights.
- **Modern Interactive UI**: Sleek, high-performance dashboard created with Next.js 14, TypeScript, Lucide icons, and real-time analysis status updates.
- **Persistent Storage**: Robust PostgreSQL integration with Docker Compose setup for storing crawled pages, analysis history, and metadata.

---

## 🏗️ Architecture

```
mcp_webanalyzer/
├── docker-compose.yml       # PostgreSQL database container configuration
├── package.json             # Root workspace script definitions
├── start.bat                # Windows 1-click startup script
├── mcp_backend/             # MCP Server & REST API backend
│   ├── src/
│   │   ├── analyzer.ts      # Web crawler & deep parsing engine
│   │   ├── aiClient.ts      # OpenRouter / LLM analysis integration
│   │   ├── db.ts            # PostgreSQL queries & migrations
│   │   ├── server.ts        # Express server & MCP endpoint handlers
│   │   ├── routes/          # REST endpoints
│   │   └── tools/           # Registered MCP tools
│   ├── .env.example
│   └── package.json
└── frontend/                # Next.js 14 web client
    ├── app/                 # Next.js App Router (pages & layouts)
    ├── components/          # Reusable UI widgets & cards
    ├── .env.example
    └── package.json
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** 18+ & **npm**
- **Docker & Docker Compose** (for PostgreSQL database)
- **OpenRouter API Key** (or compatible OpenAI-compatible endpoint)

### 2. Environment Setup

#### Backend:
Copy the example environment file in `mcp_backend`:
```bash
cd mcp_backend
cp .env.example .env
```
Open `mcp_backend/.env` and supply your `OPENROUTER_API_KEY` and database credentials:
```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mcp_webanalyzer
OPENROUTER_API_KEY=your_key_here
AI_MODEL=openai/gpt-4o-mini
FRONTEND_URL=http://localhost:3000
```

#### Frontend:
Copy the example environment file in `frontend`:
```bash
cd ../frontend
cp .env.example .env.local
```

---

### 3. Database Initialization

Start the PostgreSQL service using Docker:
```bash
docker-compose up -d
```

---

### 4. Install Dependencies

Install root, backend, and frontend packages:
```bash
# Backend dependencies (and install Playwright browser binaries)
cd mcp_backend
npm install
npx playwright install chromium

# Frontend dependencies
cd ../frontend
npm install
```

---

### 5. Running the Application

#### Option A: One-Click Launch (Windows)
Double-click `start.bat` or run:
```cmd
start.bat
```

#### Option B: Manual Startup
From the project root:
```bash
# Terminal 1: Start Backend (Port 4000)
npm run dev:backend

# Terminal 2: Start Frontend (Port 3000)
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start analyzing URLs.

---

## 🛠️ MCP Tools Exposed

| Tool Name | Description |
|---|---|
| `crawl_website` | Crawls target domain up to specified depth, extracting HTML, metadata, and asset links. |
| `analyze_seo` | Computes on-page SEO metrics, heading hierarchy, meta tags, and accessibility warnings. |
| `summarize_page` | Uses LLM via OpenRouter to generate concise executive summaries and key takeaways. |
| `extract_tech_stack` | Identifies frameworks, CMS, analytics, and third-party libraries deployed on the site. |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
