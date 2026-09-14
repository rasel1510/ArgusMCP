import { Pool, PoolClient } from 'pg';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

let usePostgres = false;
export let pool: Pool | null = null;

// Local JSON store fallback path
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface LocalDB {
  sites: Record<string, any>[];
  pages: Record<string, any>[];
  site_analysis: Record<string, any>[];
}

let localMemoryDB: LocalDB = { sites: [], pages: [], site_analysis: [] };

function loadLocalDB(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      localMemoryDB = JSON.parse(data);
    } else {
      saveLocalDB();
    }
  } catch (err) {
    console.warn('Warning: Could not read local DB file, starting fresh', err);
    localMemoryDB = { sites: [], pages: [], site_analysis: [] };
  }
}

function saveLocalDB(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(localMemoryDB, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist local DB:', err);
  }
}

// ─── Schema Init ──────────────────────────────────────────────────────────────

export async function initDB(): Promise<void> {
  const connectionString =
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/mcp_webanalyzer';

  try {
    const testPool = new Pool({
      connectionString,
      connectionTimeoutMillis: 1500,
    });

    const client: PoolClient = await testPool.connect();
    try {
      await client.query(`
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";

        CREATE TABLE IF NOT EXISTS sites (
          id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
          url         TEXT        NOT NULL,
          domain      TEXT,
          title       TEXT,
          description TEXT,
          favicon     TEXT,
          status      TEXT        NOT NULL DEFAULT 'pending',
          error_msg   TEXT,
          page_count  INTEGER     DEFAULT 0,
          created_at  TIMESTAMPTZ DEFAULT NOW(),
          updated_at  TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_sites_url    ON sites(url);
        CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);

        CREATE TABLE IF NOT EXISTS pages (
          id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
          site_id     UUID        NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
          url         TEXT        NOT NULL,
          title       TEXT,
          content     TEXT,
          html        TEXT,
          status_code INTEGER     DEFAULT 200,
          created_at  TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_pages_site_id ON pages(site_id);

        CREATE TABLE IF NOT EXISTS site_analysis (
          id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
          site_id      UUID        NOT NULL REFERENCES sites(id) ON DELETE CASCADE UNIQUE,
          seo          JSONB       NOT NULL DEFAULT '{}',
          tech_stack   JSONB       NOT NULL DEFAULT '{}',
          performance  JSONB       NOT NULL DEFAULT '{}',
          links        JSONB       NOT NULL DEFAULT '{"internal":[],"external":[]}',
          images       JSONB       NOT NULL DEFAULT '[]',
          contact_info JSONB       NOT NULL DEFAULT '{"emails":[],"phones":[],"socials":[]}',
          summary      TEXT        DEFAULT '',
          full_text    TEXT        DEFAULT '',
          created_at   TIMESTAMPTZ DEFAULT NOW(),
          updated_at   TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_analysis_site_id ON site_analysis(site_id);
      `);
      pool = testPool;
      usePostgres = true;
      console.log('✅ Connected to PostgreSQL database & initialized schema.');
      return;
    } finally {
      client.release();
    }
  } catch (pgError: any) {
    console.warn(`ℹ️ PostgreSQL not directly accessible (${pgError?.message || 'timeout'}). Switching to seamless Local Storage Engine.`);
    usePostgres = false;
    loadLocalDB();
    console.log(`✅ Local Storage Engine active at: ${DB_FILE}`);
  }
}

// ─── Site Operations ──────────────────────────────────────────────────────────

export async function createSite(url: string): Promise<string> {
  const domain = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  })();

  if (usePostgres && pool) {
    const result = await pool.query(
      'INSERT INTO sites (url, domain) VALUES ($1, $2) RETURNING id',
      [url, domain]
    );
    return result.rows[0].id as string;
  }

  const id = uuidv4();
  const newSite = {
    id,
    url,
    domain,
    title: '',
    description: '',
    favicon: '',
    status: 'pending',
    error_msg: null,
    page_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  localMemoryDB.sites.unshift(newSite);
  saveLocalDB();
  return id;
}

export async function updateSiteStatus(id: string, status: string, errorMsg?: string): Promise<void> {
  if (usePostgres && pool) {
    await pool.query(
      'UPDATE sites SET status = $1, error_msg = $2, updated_at = NOW() WHERE id = $3',
      [status, errorMsg ?? null, id]
    );
    return;
  }

  const s = localMemoryDB.sites.find((x) => x.id === id);
  if (s) {
    s.status = status;
    s.error_msg = errorMsg ?? null;
    s.updated_at = new Date().toISOString();
    saveLocalDB();
  }
}

export async function updateSiteDetails(
  id: string,
  details: {
    title: string;
    description: string;
    favicon: string;
    pageCount: number;
  }
): Promise<void> {
  if (usePostgres && pool) {
    await pool.query(
      `UPDATE sites
         SET title = $1, description = $2, favicon = $3, page_count = $4, updated_at = NOW()
       WHERE id = $5`,
      [details.title, details.description, details.favicon, details.pageCount, id]
    );
    return;
  }

  const s = localMemoryDB.sites.find((x) => x.id === id);
  if (s) {
    s.title = details.title;
    s.description = details.description;
    s.favicon = details.favicon;
    s.page_count = details.pageCount;
    s.updated_at = new Date().toISOString();
    saveLocalDB();
  }
}

export async function getSiteById(id: string): Promise<Record<string, any> | null> {
  if (usePostgres && pool) {
    const result = await pool.query('SELECT * FROM sites WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  }

  loadLocalDB();
  return localMemoryDB.sites.find((x) => x.id === id) ?? null;
}

export async function getAllSites(limit = 50): Promise<Record<string, any>[]> {
  if (usePostgres && pool) {
    const result = await pool.query(
      'SELECT id, url, domain, title, favicon, status, page_count, created_at FROM sites ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }

  loadLocalDB();
  return localMemoryDB.sites.slice(0, limit);
}

// ─── Page Operations ──────────────────────────────────────────────────────────

export async function insertPage(
  siteId: string,
  page: {
    url: string;
    title: string;
    content: string;
    html: string;
    statusCode?: number;
  }
): Promise<string> {
  if (usePostgres && pool) {
    const result = await pool.query(
      'INSERT INTO pages (site_id, url, title, content, html, status_code) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
      [siteId, page.url, page.title, page.content, page.html, page.statusCode ?? 200]
    );
    return result.rows[0].id as string;
  }

  const id = uuidv4();
  localMemoryDB.pages.push({
    id,
    site_id: siteId,
    url: page.url,
    title: page.title,
    content: page.content,
    html: page.html,
    status_code: page.statusCode ?? 200,
    created_at: new Date().toISOString(),
  });
  saveLocalDB();
  return id;
}

export async function getPagesBySiteId(siteId: string): Promise<Record<string, any>[]> {
  if (usePostgres && pool) {
    const result = await pool.query(
      'SELECT id, site_id, url, title, status_code, created_at, LEFT(content, 500) AS excerpt FROM pages WHERE site_id = $1 ORDER BY created_at ASC',
      [siteId]
    );
    return result.rows;
  }

  return localMemoryDB.pages
    .filter((p) => p.site_id === siteId)
    .map((p) => ({
      id: p.id,
      site_id: p.site_id,
      url: p.url,
      title: p.title,
      status_code: p.status_code,
      created_at: p.created_at,
      excerpt: p.content ? p.content.substring(0, 500) : '',
    }));
}

export async function getPageContent(siteId: string, pageUrl: string): Promise<string> {
  if (usePostgres && pool) {
    const result = await pool.query(
      'SELECT content FROM pages WHERE site_id = $1 AND url = $2 LIMIT 1',
      [siteId, pageUrl]
    );
    return result.rows[0]?.content ?? '';
  }

  const p = localMemoryDB.pages.find((x) => x.site_id === siteId && x.url === pageUrl);
  return p?.content ?? '';
}

// ─── Analysis Operations ──────────────────────────────────────────────────────

export async function upsertAnalysis(
  siteId: string,
  analysis: {
    seo: Record<string, any>;
    techStack: Record<string, any>;
    performance: Record<string, any>;
    links: Record<string, any>;
    images: any[];
    contactInfo: Record<string, any>;
    summary: string;
    fullText: string;
  }
): Promise<void> {
  if (usePostgres && pool) {
    await pool.query(
      `INSERT INTO site_analysis
         (site_id, seo, tech_stack, performance, links, images, contact_info, summary, full_text)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (site_id) DO UPDATE SET
         seo          = EXCLUDED.seo,
         tech_stack   = EXCLUDED.tech_stack,
         performance  = EXCLUDED.performance,
         links        = EXCLUDED.links,
         images       = EXCLUDED.images,
         contact_info = EXCLUDED.contact_info,
         summary      = EXCLUDED.summary,
         full_text    = EXCLUDED.full_text,
         updated_at   = NOW()`,
      [
        siteId,
        JSON.stringify(analysis.seo),
        JSON.stringify(analysis.techStack),
        JSON.stringify(analysis.performance),
        JSON.stringify(analysis.links),
        JSON.stringify(analysis.images),
        JSON.stringify(analysis.contactInfo),
        analysis.summary,
        analysis.fullText,
      ]
    );
    return;
  }

  const existingIdx = localMemoryDB.site_analysis.findIndex((a) => a.site_id === siteId);
  const record = {
    id: existingIdx >= 0 ? localMemoryDB.site_analysis[existingIdx].id : uuidv4(),
    site_id: siteId,
    seo: analysis.seo,
    tech_stack: analysis.techStack,
    performance: analysis.performance,
    links: analysis.links,
    images: analysis.images,
    contact_info: analysis.contactInfo,
    summary: analysis.summary,
    full_text: analysis.fullText,
    created_at: existingIdx >= 0 ? localMemoryDB.site_analysis[existingIdx].created_at : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    localMemoryDB.site_analysis[existingIdx] = record;
  } else {
    localMemoryDB.site_analysis.push(record);
  }
  saveLocalDB();
}

export async function updateAnalysisSummary(siteId: string, summary: string): Promise<void> {
  if (usePostgres && pool) {
    await pool.query(
      'UPDATE site_analysis SET summary = $1, updated_at = NOW() WHERE site_id = $2',
      [summary, siteId]
    );
    return;
  }

  const a = localMemoryDB.site_analysis.find((x) => x.site_id === siteId);
  if (a) {
    a.summary = summary;
    a.updated_at = new Date().toISOString();
    saveLocalDB();
  }
}

export async function getAnalysisBySiteId(siteId: string): Promise<Record<string, any> | null> {
  if (usePostgres && pool) {
    const result = await pool.query('SELECT * FROM site_analysis WHERE site_id = $1', [siteId]);
    return result.rows[0] ?? null;
  }

  loadLocalDB();
  return localMemoryDB.site_analysis.find((x) => x.site_id === siteId) ?? null;
}
