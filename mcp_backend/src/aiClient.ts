import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// OpenRouter uses an OpenAI-compatible API
export const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
    'X-Title': 'MCP Web Analyzer',
  },
});

export const AI_MODEL = process.env.AI_MODEL || 'openai/gpt-4o-mini';

// ─── MCP Tool Definitions (OpenAI function-calling format) ────────────────────

export function getMCPToolDefinitions(siteId: string): OpenAI.Chat.Completions.ChatCompletionTool[] {
  return [
    {
      type: 'function',
      function: {
        name: 'get_summary',
        description: 'Get the AI-generated summary and overview of the analyzed website.',
        parameters: { type: 'object', properties: {}, required: [] },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_seo',
        description: 'Get full SEO data: title, meta description, OG tags, headings, canonical URL, schema types, robots, viewport.',
        parameters: { type: 'object', properties: {}, required: [] },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_tech_stack',
        description: 'Get the detected technology stack: frameworks, CMS, analytics, CDN, fonts, libraries, etc.',
        parameters: { type: 'object', properties: {}, required: [] },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_performance',
        description: 'Get web performance metrics: load time, DOMContentLoaded, resource count, total transfer size.',
        parameters: { type: 'object', properties: {}, required: [] },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_links',
        description: 'Get all links found on the website. Optionally filter by type.',
        parameters: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['all', 'internal', 'external'],
              description: 'Filter links by type. Defaults to all.',
            },
          },
          required: [],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_images',
        description: 'Get all images found on the website with src, alt text, and dimensions.',
        parameters: { type: 'object', properties: {}, required: [] },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_pages',
        description: 'Get the list of all crawled pages with their URL, title, and excerpt.',
        parameters: { type: 'object', properties: {}, required: [] },
      },
    },
    {
      type: 'function',
      function: {
        name: 'get_contact_info',
        description: 'Get contact information: email addresses, phone numbers, social media links.',
        parameters: { type: 'object', properties: {}, required: [] },
      },
    },
    {
      type: 'function',
      function: {
        name: 'query_content',
        description: 'Search the full text content of the website for specific information.',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query or keyword to look for in the website content.',
            },
          },
          required: ['query'],
        },
      },
    },
  ];
}

// ─── Simple AI Completion ─────────────────────────────────────────────────────

export async function generateSummary(context: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: 'system',
        content: `You are a professional web analyst. Generate a concise, insightful summary of the website based on the provided data.
Include: what the website is about, its purpose/business, key features, target audience, and notable characteristics.
Keep the summary between 150-250 words. Be professional and factual.`,
      },
      {
        role: 'user',
        content: `Analyze this website data and provide a comprehensive summary:\n\n${context}`,
      },
    ],
    max_tokens: 500,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content || 'Unable to generate summary.';
}

export async function searchContent(fullText: string, query: string): Promise<string[]> {
  // Simple keyword search with context
  const sentences = fullText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  const scored = sentences.map(sentence => {
    const sentLower = sentence.toLowerCase();
    const score = queryWords.reduce((acc, word) => acc + (sentLower.includes(word) ? 1 : 0), 0);
    return { sentence, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(s => s.sentence);
}
