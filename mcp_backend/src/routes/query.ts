import { Router, Request, Response } from 'express';
import { openai, AI_MODEL, getMCPToolDefinitions } from '../aiClient';
import { executeTool, ToolName } from '../tools';
import { getSiteById, getAnalysisBySiteId } from '../db';

const router = Router();

// POST /api/query - Query the site using MCP tools + OpenRouter AI
router.post('/', async (req: Request, res: Response) => {
  try {
    const { siteId, query, history = [] } = req.body;

    if (!siteId || !query) {
      return res.status(400).json({ error: 'siteId and query are required' });
    }

    const site = await getSiteById(siteId);
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    const analysis = await getAnalysisBySiteId(siteId);
    if (!analysis) {
      return res.status(400).json({ error: 'Site analysis is still in progress or failed.' });
    }

    // Build system prompt with website awareness
    const systemPrompt = `You are a world-class Web Analyst & Intelligence Agent with access to Model Context Protocol (MCP) tools for the website: "${site.title || site.domain || site.url}".
Website URL: ${site.url}
Domain: ${site.domain}
Pages Crawled: ${site.page_count}

You have access to specialized MCP tools that query the analyzed data:
- get_summary: Retrieves high-level business and content summary.
- get_seo: Retrieves comprehensive SEO signals, headings, meta tags, and structured data.
- get_tech_stack: Detects frameworks, libraries, analytics, CDN, CMS, and hosting.
- get_performance: Retrieves load times, page metrics, and asset sizes.
- get_links: Retrieves internal and external links.
- get_images: Retrieves images, dimensions, and alt text.
- get_pages: Lists crawled pages.
- get_contact_info: Retrieves emails, phones, and social media links.
- query_content: Searches exact text across the scraped pages.

CRITICAL INSTRUCTIONS:
1. When asked about anything related to this website, ALWAYS use the relevant MCP tool(s) first to fetch ground-truth data.
2. Formulate your answer in rich, beautiful Markdown with clear headings, bullet points, key takeaways, and tables where applicable.
3. Be direct, authoritative, and helpful. If the user asks for recommendations (e.g. how to improve SEO or performance), give actionable, modern engineering suggestions based on the actual tool data.`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6), // Keep recent conversation context
      { role: 'user', content: query },
    ];

    const tools = getMCPToolDefinitions(siteId);
    const executedTools: Array<{ tool: string; args: any; result: any }> = [];

    // First LLM call with MCP tools
    let response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages,
      tools,
      tool_choice: 'auto',
      max_tokens: 1500,
      temperature: 0.2,
    });

    let choice = response.choices[0];

    // Tool calling execution loop (up to 4 steps)
    let loopCount = 0;
    while (choice?.message?.tool_calls && choice.message.tool_calls.length > 0 && loopCount < 4) {
      loopCount++;
      const toolCalls = choice.message.tool_calls;

      // Append assistant's tool-call request to messages
      messages.push(choice.message);

      for (const call of toolCalls) {
        const toolName = call.function.name as ToolName;
        let toolArgs: any = {};
        try {
          toolArgs = JSON.parse(call.function.arguments || '{}');
        } catch {
          toolArgs = {};
        }

        console.log(`[MCP Tool Exec] Calling ${toolName} with`, toolArgs);

        let toolResult: any;
        try {
          toolResult = await executeTool(toolName, toolArgs, siteId);
        } catch (err: any) {
          toolResult = { error: err.message };
        }

        executedTools.push({
          tool: toolName,
          args: toolArgs,
          result: toolResult,
        });

        // Add tool response to messages
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(toolResult),
        });
      }

      // Next step of conversation with tool results
      response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages,
        tools,
        tool_choice: 'auto',
        max_tokens: 1500,
        temperature: 0.2,
      });

      choice = response.choices[0];
    }

    const finalAnswer = choice?.message?.content || 'No response generated.';

    return res.json({
      answer: finalAnswer,
      executedTools,
    });
  } catch (error: any) {
    console.error('Error executing query with MCP tools:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process query',
    });
  }
});

// Direct MCP Tool execution endpoint
router.post('/tool', async (req: Request, res: Response) => {
  try {
    const { siteId, toolName, args = {} } = req.body;
    if (!siteId || !toolName) {
      return res.status(400).json({ error: 'siteId and toolName are required' });
    }

    const result = await executeTool(toolName as ToolName, args, siteId);
    return res.json({ toolName, result });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Tool execution failed' });
  }
});

export default router;
