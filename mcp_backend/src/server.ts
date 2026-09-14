import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { initDB, getAllSites, getSiteById, getAnalysisBySiteId } from './db';
import analyzeRouter from './routes/analyze';
import sitesRouter from './routes/sites';
import queryRouter from './routes/query';
import { executeTool, ToolName } from './tools';
import { analyzeWebsite } from './analyzer';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'MCP Web Analyzer Backend',
    timestamp: new Date().toISOString(),
  });
});

// REST API Routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/sites', sitesRouter);
app.use('/api/query', queryRouter);

// ─── Setup Official MCP Server ───────────────────────────────────────────────
export function createMCPServer(): Server {
  const mcpServer = new Server(
    {
      name: 'mcp-webanalyzer-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'analyze_website',
          description: 'Crawl and analyze an entire website, extracting SEO, tech stack, performance, links, and content.',
          inputSchema: {
            type: 'object',
            properties: {
              url: { type: 'string', description: 'The website URL to analyze (e.g. https://codemypixel.com)' },
            },
            required: ['url'],
          },
        },
        {
          name: 'get_summary',
          description: 'Get an AI-generated summary and overview of the analyzed website.',
          inputSchema: {
            type: 'object',
            properties: {
              siteId: { type: 'string', description: 'The unique ID of the analyzed site' },
            },
            required: ['siteId'],
          },
        },
        {
          name: 'get_seo',
          description: 'Get all SEO metadata: title, description, OG tags, headings, canonical URL, schema types.',
          inputSchema: {
            type: 'object',
            properties: {
              siteId: { type: 'string', description: 'The unique ID of the analyzed site' },
            },
            required: ['siteId'],
          },
        },
        {
          name: 'get_tech_stack',
          description: 'Get detected technology stack: frameworks, CMS, analytics, CDN, fonts, libraries.',
          inputSchema: {
            type: 'object',
            properties: {
              siteId: { type: 'string', description: 'The unique ID of the analyzed site' },
            },
            required: ['siteId'],
          },
        },
        {
          name: 'get_performance',
          description: 'Get web performance metrics: load time, domContentLoaded, resource count, transfer size.',
          inputSchema: {
            type: 'object',
            properties: {
              siteId: { type: 'string', description: 'The unique ID of the analyzed site' },
            },
            required: ['siteId'],
          },
        },
        {
          name: 'get_links',
          description: 'Get internal and external links detected on the website.',
          inputSchema: {
            type: 'object',
            properties: {
              siteId: { type: 'string', description: 'The unique ID of the analyzed site' },
              type: { type: 'string', enum: ['all', 'internal', 'external'], description: 'Filter link type' },
            },
            required: ['siteId'],
          },
        },
        {
          name: 'get_images',
          description: 'Get all images found on the website with src, alt text, and dimensions.',
          inputSchema: {
            type: 'object',
            properties: {
              siteId: { type: 'string', description: 'The unique ID of the analyzed site' },
            },
            required: ['siteId'],
          },
        },
        {
          name: 'get_pages',
          description: 'Get the list of all crawled pages for the website.',
          inputSchema: {
            type: 'object',
            properties: {
              siteId: { type: 'string', description: 'The unique ID of the analyzed site' },
            },
            required: ['siteId'],
          },
        },
        {
          name: 'get_contact_info',
          description: 'Get extracted emails, phones, and social media handles.',
          inputSchema: {
            type: 'object',
            properties: {
              siteId: { type: 'string', description: 'The unique ID of the analyzed site' },
            },
            required: ['siteId'],
          },
        },
        {
          name: 'query_content',
          description: 'Search full-text content of the analyzed website.',
          inputSchema: {
            type: 'object',
            properties: {
              siteId: { type: 'string', description: 'The unique ID of the analyzed site' },
              query: { type: 'string', description: 'Search term or question keywords' },
            },
            required: ['siteId', 'query'],
          },
        },
      ],
    };
  });

  // Handle tool execution
  mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    if (name === 'analyze_website') {
      const url = (args as any).url;
      const siteId = await analyzeWebsite(url);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ message: 'Website analysis started', siteId, url }, null, 2),
          },
        ],
      };
    }

    const siteId = (args as any).siteId;
    if (!siteId) {
      throw new Error('siteId is required');
    }

    const result = await executeTool(name as ToolName, args as any, siteId);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  });

  return mcpServer;
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function main() {
  try {
    await initDB();

    app.listen(PORT, () => {
      console.log(`
┌─────────────────────────────────────────────────────────────┐
│  🚀 MCP Web Analyzer Backend Running                        │
│  ➜ HTTP REST API: http://localhost:${PORT}                     │
│  ➜ Health check:  http://localhost:${PORT}/health              │
│  ➜ AI Provider:   OpenRouter (claude-3.5-sonnet)            │
│  ➜ MCP Tools:     9 Tools Active & Ready                    │
└─────────────────────────────────────────────────────────────┘
      `);
    });

    // If run directly with --stdio, also connect MCP stdio transport
    if (process.argv.includes('--stdio')) {
      const mcp = createMCPServer();
      const transport = new StdioServerTransport();
      await mcp.connect(transport);
      console.log('🔌 MCP Server connected via stdio transport');
    }
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

main();
