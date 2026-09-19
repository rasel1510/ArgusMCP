import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as cheerio from 'cheerio';
import {
  createSite,
  updateSiteStatus,
  updateSiteDetails,
  insertPage,
  upsertAnalysis,
  updateAnalysisSummary,
} from './db';
import { generateSummary } from './aiClient';

// ─── Tech Stack Detection Patterns ───────────────────────────────────────────

interface TechSignature {
  name: string;
  category: string;
  patterns: RegExp[];
}

const TECH_SIGNATURES: TechSignature[] = [
  // CMS
  { name: 'WordPress',      category: 'cms',       patterns: [/wp-content/i, /wp-includes/i, /wp-json/i] },
  { name: 'Drupal',         category: 'cms',       patterns: [/drupal/i, /sites\/default\/files/i] },
  { name: 'Joomla',         category: 'cms',       patterns: [/joomla/i, /\/components\/com_/i] },
  { name: 'Wix',            category: 'cms',       patterns: [/wix\.com/i, /wixstatic/i] },
  { name: 'Squarespace',    category: 'cms',       patterns: [/squarespace/i] },
  { name: 'Webflow',        category: 'cms',       patterns: [/webflow/i] },
  { name: 'Ghost',          category: 'cms',       patterns: [/ghost\.io/i, /content\/themes\/casper/i] },
  // Ecommerce
  { name: 'Shopify',        category: 'ecommerce', patterns: [/cdn\.shopify\.com/i, /shopify\.com/i] },
  { name: 'WooCommerce',    category: 'ecommerce', patterns: [/woocommerce/i, /wc-/i] },
  { name: 'Magento',        category: 'ecommerce', patterns: [/magento/i, /mage\//i] },
  { name: 'BigCommerce',    category: 'ecommerce', patterns: [/bigcommerce/i] },
  // JS Frameworks
  { name: 'Next.js',        category: 'framework', patterns: [/__NEXT_DATA__/i, /_next\//i, /next\.js/i] },
  { name: 'Nuxt.js',        category: 'framework', patterns: [/__NUXT__/i, /_nuxt\//i] },
  { name: 'Gatsby',         category: 'framework', patterns: [/___gatsby/i, /gatsby-/i] },
  { name: 'React',          category: 'framework', patterns: [/react\.js/i, /react\.min\.js/i, /data-reactroot/i, /reactdom/i] },
  { name: 'Vue.js',         category: 'framework', patterns: [/vue\.js/i, /vue\.min\.js/i, /data-v-/i, /vuejs/i] },
  { name: 'Angular',        category: 'framework', patterns: [/angular\.js/i, /ng-version/i, /\[_nghost/i] },
  { name: 'Svelte',         category: 'framework', patterns: [/svelte/i] },
  { name: 'Astro',          category: 'framework', patterns: [/astro/i, /astro-island/i] },
  { name: 'Remix',          category: 'framework', patterns: [/__remixContext/i] },
  // CSS
  { name: 'Bootstrap',      category: 'css',       patterns: [/bootstrap\.min\.css/i, /bootstrap\.css/i, /bootstrap\//i] },
  { name: 'Tailwind CSS',   category: 'css',       patterns: [/tailwind/i] },
  { name: 'Bulma',          category: 'css',       patterns: [/bulma/i] },
  { name: 'Foundation',     category: 'css',       patterns: [/foundation\.css/i] },
  { name: 'Materialize',    category: 'css',       patterns: [/materialize/i] },
  // Libraries
  { name: 'jQuery',         category: 'library',   patterns: [/jquery\.js/i, /jquery\.min\.js/i, /jquery-\d/i] },
  { name: 'GSAP',           category: 'library',   patterns: [/gsap/i, /greensock/i, /TweenMax/i] },
  { name: 'Three.js',       category: 'library',   patterns: [/three\.js/i, /three\.min\.js/i] },
  { name: 'Swiper',         category: 'library',   patterns: [/swiper/i] },
  { name: 'Lodash',         category: 'library',   patterns: [/lodash/i] },
  { name: 'Moment.js',      category: 'library',   patterns: [/moment\.js/i, /moment\.min\.js/i] },
  { name: 'Axios',          category: 'library',   patterns: [/axios/i] },
  // Analytics
  { name: 'Google Analytics', category: 'analytics', patterns: [/google-analytics\.com/i, /googletagmanager\.com/i, /G-[A-Z0-9]+/i, /UA-\d+/i] },
  { name: 'Google Tag Manager', category: 'analytics', patterns: [/googletagmanager\.com\/gtm/i] },
  { name: 'Facebook Pixel', category: 'analytics', patterns: [/connect\.facebook\.net/i, /fbevents\.js/i] },
  { name: 'Hotjar',         category: 'analytics', patterns: [/hotjar\.com/i, /hjid/i] },
  { name: 'Mixpanel',       category: 'analytics', patterns: [/mixpanel/i] },
  { name: 'Segment',        category: 'analytics', patterns: [/segment\.io/i, /segment\.com/i] },
  { name: 'Clarity',        category: 'analytics', patterns: [/clarity\.ms/i, /Microsoft Clarity/i] },
  { name: 'Plausible',      category: 'analytics', patterns: [/plausible\.io/i] },
  // CDN/Hosting
  { name: 'Cloudflare',     category: 'cdn',       patterns: [/cloudflare/i, /cdnjs\.cloudflare\.com/i] },
  { name: 'jsDelivr',       category: 'cdn',       patterns: [/jsdelivr\.net/i] },
  { name: 'unpkg',          category: 'cdn',       patterns: [/unpkg\.com/i] },
  { name: 'AWS',            category: 'hosting',   patterns: [/amazonaws\.com/i, /s3\.amazonaws/i, /cloudfront\.net/i] },
  { name: 'Vercel',         category: 'hosting',   patterns: [/vercel\.app/i, /x-vercel-/i] },
  { name: 'Netlify',        category: 'hosting',   patterns: [/netlify/i, /netlify\.app/i] },
  // Fonts
  { name: 'Google Fonts',   category: 'fonts',     patterns: [/fonts\.googleapis\.com/i, /fonts\.gstatic\.com/i] },
  { name: 'Adobe Fonts',    category: 'fonts',     patterns: [/use\.typekit\.net/i, /typekit/i] },
  // UI Kits
  { name: 'Font Awesome',   category: 'ui',        patterns: [/font-awesome/i, /fontawesome/i, /fa fa-/i] },
  { name: 'Material Icons', category: 'ui',        patterns: [/material-icons/i, /fonts\.googleapis.*icons/i] },
  // Services
  { name: 'reCAPTCHA',      category: 'security',  patterns: [/recaptcha/i, /google\.com\/recaptcha/i] },
  { name: 'Stripe',         category: 'payment',   patterns: [/stripe\.com\/v3/i, /stripe\.js/i] },
  { name: 'PayPal',         category: 'payment',   patterns: [/paypal\.com/i, /paypalobjects/i] },
  { name: 'Intercom',       category: 'support',   patterns: [/intercom\.io/i, /widget\.intercom/i] },
  { name: 'Zendesk',        category: 'support',   patterns: [/zendesk\.com/i, /zopim/i] },
  { name: 'HubSpot',        category: 'marketing', patterns: [/hubspot\.com/i, /hs-analytics/i, /hs-banner/i] },
  { name: 'Mailchimp',      category: 'marketing', patterns: [/mailchimp/i, /list-manage\.com/i] },
  { name: 'Elementor',      category: 'cms',       patterns: [/elementor/i] },
];

function detectTechStack(htmlContent: string): Record<string, string[]> {
  const grouped: Record<string, Set<string>> = {};

  for (const sig of TECH_SIGNATURES) {
    if (sig.patterns.some(p => p.test(htmlContent))) {
      if (!grouped[sig.category]) grouped[sig.category] = new Set();
      grouped[sig.category].add(sig.name);
    }
  }

  return Object.fromEntries(
    Object.entries(grouped).map(([cat, names]) => [cat, Array.from(names)])
  );
}

function extractContactInfo(htmlContent: string) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

  const rawEmails = htmlContent.match(emailRegex) || [];
  const emails = [...new Set(rawEmails)].filter(e =>
    !e.includes('example') && !e.includes('test@') && !e.endsWith('.png') && !e.endsWith('.jpg')
  );

  const rawPhones = htmlContent.match(phoneRegex) || [];
  const phones = [...new Set(rawPhones)].slice(0, 10);

  const socialPatterns: { platform: string; regex: RegExp }[] = [
    { platform: 'Twitter / X',  regex: /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/([^/"'\s?#]+)/gi },
    { platform: 'Facebook',     regex: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([^/"'\s?#]+)/gi },
    { platform: 'Instagram',    regex: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/"'\s?#]+)/gi },
    { platform: 'LinkedIn',     regex: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company)\/([^/"'\s?#]+)/gi },
    { platform: 'YouTube',      regex: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:channel|@|c\/)?([^/"'\s?#]+)/gi },
    { platform: 'GitHub',       regex: /(?:https?:\/\/)?(?:www\.)?github\.com\/([^/"'\s?#]+)/gi },
    { platform: 'TikTok',       regex: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([^/"'\s?#]+)/gi },
    { platform: 'Pinterest',    regex: /(?:https?:\/\/)?(?:www\.)?pinterest\.com\/([^/"'\s?#]+)/gi },
  ];

  const socials: { platform: string; url: string }[] = [];
  const seenUrls = new Set<string>();

  for (const { platform, regex } of socialPatterns) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(htmlContent)) !== null) {
      const rawUrl = match[0];
      const normalized = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
      if (!seenUrls.has(normalized) && !normalized.includes('sharer') && !normalized.includes('share?')) {
        seenUrls.add(normalized);
        socials.push({ platform, url: normalized });
      }
    }
  }

  return { emails: emails.slice(0, 20), phones, socials };
}

function extractSEO($: cheerio.CheerioAPI) {
  const h1s: string[] = [];
  const h2s: string[] = [];
  const h3s: string[] = [];
  $('h1').each((_, el) => { const t = $(el).text().trim(); if (t) h1s.push(t); });
  $('h2').each((_, el) => { const t = $(el).text().trim(); if (t) h2s.push(t); });
  $('h3').each((_, el) => { const t = $(el).text().trim(); if (t) h3s.push(t); });

  const schemaTypes: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '{}');
      const t = data['@type'];
      if (t && !schemaTypes.includes(t)) schemaTypes.push(t);
    } catch (_) { /* skip invalid JSON */ }
  });

  return {
    title:          $('title').first().text().trim(),
    description:    $('meta[name="description"]').attr('content') || '',
    keywords:       $('meta[name="keywords"]').attr('content') || '',
    ogTitle:        $('meta[property="og:title"]').attr('content') || '',
    ogDescription:  $('meta[property="og:description"]').attr('content') || '',
    ogImage:        $('meta[property="og:image"]').attr('content') || '',
    ogUrl:          $('meta[property="og:url"]').attr('content') || '',
    ogType:         $('meta[property="og:type"]').attr('content') || '',
    twitterCard:    $('meta[name="twitter:card"]').attr('content') || '',
    twitterTitle:   $('meta[name="twitter:title"]').attr('content') || '',
    twitterImage:   $('meta[name="twitter:image"]').attr('content') || '',
    canonical:      $('link[rel="canonical"]').attr('href') || '',
    robots:         $('meta[name="robots"]').attr('content') || '',
    viewport:       $('meta[name="viewport"]').attr('content') || '',
    charset:        $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content') || 'utf-8',
    h1s:            h1s.slice(0, 20),
    h2s:            h2s.slice(0, 30),
    h3s:            h3s.slice(0, 40),
    schemaTypes,
    totalImages:    $('img').length,
    imagesWithAlt:  $('img[alt]:not([alt=""])').length,
    internalLinks:  0,  // filled in links step
    externalLinks:  0,
  };
}

function extractLinks(
  $: cheerio.CheerioAPI,
  baseUrl: string
): { internal: { href: string; text: string }[]; external: { href: string; text: string }[] } {
  const origin = (() => { try { return new URL(baseUrl).origin; } catch { return ''; } })();
  const internalSet = new Map<string, string>();
  const externalSet = new Map<string, string>();

  $('a[href]').each((_, el) => {
    const rawHref = $(el).attr('href') || '';
    const text    = $(el).text().trim().substring(0, 100);
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) return;

    let resolved = rawHref;
    try {
      resolved = new URL(rawHref, baseUrl).href;
    } catch { return; }

    if (resolved.startsWith(origin)) {
      if (!internalSet.has(resolved)) internalSet.set(resolved, text);
    } else {
      if (!externalSet.has(resolved)) externalSet.set(resolved, text);
    }
  });

  return {
    internal: Array.from(internalSet.entries()).map(([href, text]) => ({ href, text })).slice(0, 200),
    external: Array.from(externalSet.entries()).map(([href, text]) => ({ href, text })).slice(0, 200),
  };
}

function extractImages(
  $: cheerio.CheerioAPI,
  baseUrl: string
): { src: string; alt: string; width: string; height: string }[] {
  const images: { src: string; alt: string; width: string; height: string }[] = [];
  const seen = new Set<string>();

  $('img').each((_, el) => {
    const rawSrc = $(el).attr('src') || $(el).attr('data-src') || '';
    if (!rawSrc) return;

    let src = rawSrc;
    try { src = new URL(rawSrc, baseUrl).href; } catch { return; }

    if (seen.has(src)) return;
    seen.add(src);

    images.push({
      src,
      alt:    $(el).attr('alt') || '',
      width:  $(el).attr('width') || '',
      height: $(el).attr('height') || '',
    });
  });

  return images.slice(0, 100);
}

// ─── Main Analyzer ────────────────────────────────────────────────────────────

export async function analyzeWebsite(url: string): Promise<string> {
  // Normalize URL
  if (!url.startsWith('http')) url = 'https://' + url;

  const siteId = await createSite(url);
  await updateSiteStatus(siteId, 'analyzing');

  // Run in background
  runAnalysis(siteId, url).catch(async (err) => {
    console.error(`[analyzer] Error for ${url}:`, err);
    await updateSiteStatus(siteId, 'error', err?.message || 'Unknown error');
  });

  return siteId;
}

async function runAnalysis(siteId: string, startUrl: string): Promise<void> {
  const MAX_PAGES = parseInt(process.env.MAX_PAGES || '10', 10);
  const TIMEOUT   = parseInt(process.env.CRAWL_TIMEOUT_MS || '30000', 10);

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });
    const ctx: BrowserContext = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
    });

    const origin = new URL(startUrl).origin;
    const visited = new Set<string>();
    const queue   = [startUrl];

    let titleGlobal    = '';
    let descGlobal     = '';
    let faviconGlobal  = '';
    let allFullText    = '';

    // Aggregate structures
    let firstSEO: Record<string, any>   = {};
    let firstPerf: Record<string, any>  = {};
    let allLinks   = { internal: [] as any[], external: [] as any[] };
    let allImages: any[] = [];
    let allHtml    = '';

    while (queue.length > 0 && visited.size < MAX_PAGES) {
      const pageUrl = queue.shift()!;
      if (visited.has(pageUrl)) continue;
      visited.add(pageUrl);

      console.log(`[analyzer] Crawling (${visited.size}/${MAX_PAGES}): ${pageUrl}`);

      const page: Page = await ctx.newPage();

      try {
        const t0 = Date.now();
        const response = await page.goto(pageUrl, {
          waitUntil: 'domcontentloaded',
          timeout: TIMEOUT,
        }).catch(() => null);

        const loadMs = Date.now() - t0;

        // Get performance timing (best-effort)
        let perfData: Record<string, any> = { loadMs };
        if (visited.size === 1) {
          perfData = await page.evaluate(() => {
            const win = (globalThis as any);
            const t: any = win.performance?.timing;
            if (!t) return {};
            const resources = win.performance?.getEntriesByType('resource') || [];
            return {
              navigationStart:    t.navigationStart,
              domContentLoaded:   Math.max(0, t.domContentLoadedEventEnd - t.navigationStart),
              loadComplete:       Math.max(0, t.loadEventEnd - t.navigationStart),
              resourceCount:      resources.length,
              totalTransferSize:  resources.reduce((s: number, r: any) => s + (r.transferSize || 0), 0),
            };
          }).catch(() => ({ loadMs }));
          firstPerf = perfData;
        }

        const html  = await page.content().catch(() => '');
        const title = await page.title().catch(() => '');
        const url   = page.url();

        const $     = cheerio.load(html);

        // SEO (first page only)
        if (visited.size === 1) {
          firstSEO     = extractSEO($);
          faviconGlobal = (
            $('link[rel="icon"]').attr('href') ||
            $('link[rel="shortcut icon"]').attr('href') ||
            `${origin}/favicon.ico`
          );
          try { faviconGlobal = new URL(faviconGlobal, url).href; } catch { /* keep as-is */ }
          titleGlobal  = firstSEO.title || title;
          descGlobal   = firstSEO.description || firstSEO.ogDescription || '';
          allHtml      = html;
        }

        // Links
        const links = extractLinks($, url);
        for (const l of links.internal) {
          if (!allLinks.internal.find((x: any) => x.href === l.href)) allLinks.internal.push(l);
          // Enqueue unvisited internal pages
          try {
            const u = new URL(l.href);
            if (u.origin === origin && !visited.has(l.href) && !queue.includes(l.href)) {
              queue.push(l.href);
            }
          } catch { /* skip invalid */ }
        }
        for (const l of links.external) {
          if (!allLinks.external.find((x: any) => x.href === l.href)) allLinks.external.push(l);
        }

        // Images
        const imgs = extractImages($, url);
        for (const img of imgs) {
          if (!allImages.find((x: any) => x.src === img.src)) allImages.push(img);
        }

        // Text content
        $('script, style, noscript, head').remove();
        const pageText = $('body').text().replace(/\s+/g, ' ').trim();
        allFullText += ` ${pageText}`;

        // Store page in DB
        await insertPage(siteId, {
          url,
          title,
          content: pageText.substring(0, 50000),
          html:    html.substring(0, 200000),
          statusCode: response?.status() ?? 200,
        });

      } catch (err) {
        console.warn(`[analyzer] Failed to crawl ${pageUrl}:`, (err as any)?.message);
      } finally {
        await page.close().catch(() => {});
      }
    }

    await ctx.close().catch(() => {});

    // Update site details
    await updateSiteDetails(siteId, {
      title:       titleGlobal,
      description: descGlobal,
      favicon:     faviconGlobal,
      pageCount:   visited.size,
    });

    // Detect tech stack from combined HTML
    const techStack = detectTechStack(allHtml);

    // Extract contact info from combined HTML
    const contactInfo = extractContactInfo(allHtml);

    // Update SEO link counts
    firstSEO.internalLinks = allLinks.internal.length;
    firstSEO.externalLinks = allLinks.external.length;

    // Trim full text
    const fullText = allFullText.replace(/\s+/g, ' ').trim().substring(0, 100000);

    // Store analysis (without summary yet)
    await upsertAnalysis(siteId, {
      seo:         firstSEO,
      techStack,
      performance: firstPerf,
      links:       allLinks,
      images:      allImages,
      contactInfo,
      summary:     '',
      fullText,
    });

    // Mark as done before generating AI summary
    await updateSiteStatus(siteId, 'done');

    // Generate AI summary asynchronously
    const summaryContext = `
Website URL: ${startUrl}
Title: ${titleGlobal}
Description: ${descGlobal}
Pages Crawled: ${visited.size}
Tech Stack: ${JSON.stringify(techStack)}
SEO Title: ${firstSEO.title}
H1 Headings: ${(firstSEO.h1s || []).join(', ')}
H2 Headings: ${(firstSEO.h2s || []).slice(0, 8).join(', ')}
Contact Emails: ${contactInfo.emails.join(', ')}
Social Profiles: ${contactInfo.socials.map((s: any) => s.platform).join(', ')}
Internal Links: ${allLinks.internal.length}
External Links: ${allLinks.external.length}
Images: ${allImages.length}
Content Excerpt: ${fullText.substring(0, 2000)}
    `.trim();

    const summary = await generateSummary(summaryContext).catch(() => '');
    if (summary) await updateAnalysisSummary(siteId, summary);

    console.log(`[analyzer] ✅ Done: ${startUrl} (${visited.size} pages)`);

  } finally {
    await browser?.close().catch(() => {});
  }
}
