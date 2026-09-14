import { Router, Request, Response } from 'express';
import { analyzeWebsite } from '../analyzer';
import { getSiteById, getAnalysisBySiteId } from '../db';

const router = Router();

// POST /api/analyze - Trigger analysis for a URL
router.post('/', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid URL is required' });
    }

    // Clean and validate URL
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    try {
      new URL(targetUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const siteId = await analyzeWebsite(targetUrl);
    return res.status(202).json({
      message: 'Analysis initiated',
      siteId,
      url: targetUrl,
    });
  } catch (error: any) {
    console.error('Error starting analysis:', error);
    return res.status(500).json({ error: error?.message || 'Failed to start analysis' });
  }
});

// GET /api/analyze/:id/status - Check status of analysis
router.get('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const site = await getSiteById(id);
    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    const analysis = site.status === 'done' ? await getAnalysisBySiteId(id) : null;

    return res.json({
      id: site.id,
      url: site.url,
      domain: site.domain,
      title: site.title,
      description: site.description,
      favicon: site.favicon,
      status: site.status,
      error: site.error_msg,
      pageCount: site.page_count,
      createdAt: site.created_at,
      hasSummary: !!analysis?.summary,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

export default router;
