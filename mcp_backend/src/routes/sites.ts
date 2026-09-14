import { Router, Request, Response } from 'express';
import {
  getAllSites,
  getSiteById,
  getAnalysisBySiteId,
  getPagesBySiteId,
} from '../db';

const router = Router();

// GET /api/sites - List all analyzed sites
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const sites = await getAllSites(limit);
    return res.json({ sites });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to fetch sites' });
  }
});

// GET /api/sites/:id - Get full details and analysis of a site
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const site = await getSiteById(id);
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    const analysis = await getAnalysisBySiteId(id);
    const pages = await getPagesBySiteId(id);

    return res.json({
      site,
      analysis: analysis ? {
        summary: analysis.summary,
        seo: typeof analysis.seo === 'string' ? JSON.parse(analysis.seo) : analysis.seo,
        techStack: typeof analysis.tech_stack === 'string' ? JSON.parse(analysis.tech_stack) : analysis.tech_stack,
        performance: typeof analysis.performance === 'string' ? JSON.parse(analysis.performance) : analysis.performance,
        links: typeof analysis.links === 'string' ? JSON.parse(analysis.links) : analysis.links,
        images: typeof analysis.images === 'string' ? JSON.parse(analysis.images) : analysis.images,
        contactInfo: typeof analysis.contact_info === 'string' ? JSON.parse(analysis.contact_info) : analysis.contact_info,
        updatedAt: analysis.updated_at,
      } : null,
      pages,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to fetch site details' });
  }
});

// GET /api/sites/:id/pages - Get pages of a site
router.get('/:id/pages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pages = await getPagesBySiteId(id);
    return res.json({ pages });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Failed to fetch pages' });
  }
});

export default router;
