import { getAnalysisBySiteId, getPagesBySiteId } from '../db';
import { searchContent } from '../aiClient';

export type ToolName =
  | 'get_summary'
  | 'get_seo'
  | 'get_tech_stack'
  | 'get_performance'
  | 'get_links'
  | 'get_images'
  | 'get_pages'
  | 'get_contact_info'
  | 'query_content';

export async function executeTool(
  toolName: ToolName,
  args: Record<string, any>,
  siteId: string
): Promise<Record<string, any>> {
  const analysis = await getAnalysisBySiteId(siteId);
  if (!analysis) throw new Error(`No analysis found for site ${siteId}`);

  switch (toolName) {
    case 'get_summary':
      return { summary: analysis.summary || 'Summary not yet generated.' };

    case 'get_seo':
      return { seo: analysis.seo };

    case 'get_tech_stack':
      return { tech_stack: analysis.tech_stack };

    case 'get_performance':
      return { performance: analysis.performance };

    case 'get_links': {
      const type = args.type || 'all';
      const links = analysis.links;
      if (type === 'internal') return { links: links.internal, count: links.internal.length };
      if (type === 'external') return { links: links.external, count: links.external.length };
      return {
        internal: links.internal,
        external: links.external,
        total: links.internal.length + links.external.length,
      };
    }

    case 'get_images':
      return { images: analysis.images, count: analysis.images.length };

    case 'get_pages': {
      const pages = await getPagesBySiteId(siteId);
      return { pages, count: pages.length };
    }

    case 'get_contact_info':
      return { contact_info: analysis.contact_info };

    case 'query_content': {
      const query = args.query as string;
      if (!query) throw new Error('query parameter is required');
      const results = await searchContent(analysis.full_text || '', query);
      return { query, results, count: results.length };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
