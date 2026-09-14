'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import AnalysisDashboard from '../../../components/AnalysisDashboard';
import { Loader2, Globe, Cpu, Search, CheckCircle2, AlertTriangle, ArrowLeft, Terminal, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AnalyzePage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id as string;

  const [siteData, setSiteData] = useState<{
    site: Record<string, any> | null;
    analysis: Record<string, any> | null;
    pages: Record<string, any>[];
  }>({ site: null, analysis: null, pages: [] });

  const [status, setStatus] = useState<'loading' | 'analyzing' | 'done' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [crawlStep, setCrawlStep] = useState(0);

  const crawlSteps = [
    'Initializing Headless Chromium browser context...',
    'Navigating and rendering client-side DOM...',
    'Extracting full-text content, headings & meta tags...',
    'Fingerprinting frameworks, CMS & analytics pixels...',
    'Mapping internal navigation tree and external links...',
    'Indexing media assets and computing performance timings...',
    'Registering dynamic MCP tools for OpenRouter AI agent...',
    'Finalizing analysis and synthesizing intelligence...',
  ];

  useEffect(() => {
    if (status === 'analyzing') {
      const interval = setInterval(() => {
        setCrawlStep((prev) => (prev < crawlSteps.length - 1 ? prev + 1 : prev));
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [status, crawlSteps.length]);

  useEffect(() => {
    if (!siteId) return;

    let isSubscribed = true;
    let pollTimer: NodeJS.Timeout;

    const fetchStatusAndData = async () => {
      try {
        const res = await fetch(`/api/sites/${siteId}`);
        if (!res.ok) {
          throw new Error('Failed to load site details');
        }
        const data = await res.json();
        if (!isSubscribed) return;

        if (data.site) {
          setSiteData({
            site: data.site,
            analysis: data.analysis,
            pages: data.pages || [],
          });

          if (data.site.status === 'done') {
            setStatus('done');
            // Fire celebration confetti
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#00f0ff', '#8b5cf6', '#10b981', '#ffffff'],
              });
            } catch {
              // Ignore if canvas-confetti fails
            }
          } else if (data.site.status === 'error') {
            setStatus('error');
            setErrorMsg(data.site.error_msg || 'Analysis encountered an error');
          } else {
            setStatus('analyzing');
            pollTimer = setTimeout(fetchStatusAndData, 1800);
          }
        }
      } catch (err: any) {
        if (!isSubscribed) return;
        setStatus('error');
        setErrorMsg(err.message || 'Error communicating with backend');
      }
    };

    fetchStatusAndData();

    return () => {
      isSubscribed = false;
      clearTimeout(pollTimer);
    };
  }, [siteId]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2rem 1.5rem 4rem' }}>
        {status === 'loading' && (
          <div style={{
            maxWidth: '600px',
            margin: '6rem auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <Loader2 className="animate-spin-slow" size={36} color="#00f0ff" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f3f4f6' }}>Connecting to MCP System...</h2>
          </div>
        )}

        {status === 'analyzing' && (
          <div style={{
            maxWidth: '700px',
            margin: '4rem auto',
          }}>
            <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px', textAlign: 'center' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '20px',
                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: 'var(--shadow-glow)',
              }}>
                <Loader2 size={36} color="#00f0ff" className="animate-spin-slow" />
              </div>

              <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>
                Playwright Headless Engine Active
              </span>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                Analyzing Website Architecture
              </h2>

              <p style={{ fontSize: '0.95rem', color: '#94a3b8', marginBottom: '2rem', wordBreak: 'break-all' }}>
                Target: <strong style={{ color: '#00f0ff' }}>{siteData.site?.url || 'Crawling site...'}</strong>
              </p>

              {/* Crawl Progress Pipeline */}
              <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                borderRadius: '14px',
                padding: '1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a78bfa', fontSize: '0.8rem', fontWeight: 600 }}>
                  <Terminal size={14} />
                  <span>CRAWL PIPELINE STATUS:</span>
                </div>

                <div style={{ fontSize: '0.92rem', color: '#34d399', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                  {crawlSteps[crawlStep]}
                </div>

                {/* Progress bar */}
                <div style={{
                  height: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  marginTop: '0.5rem',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(96, ((crawlStep + 1) / crawlSteps.length) * 100)}%`,
                    background: 'linear-gradient(90deg, #00f0ff, #8b5cf6)',
                    borderRadius: '999px',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div style={{ maxWidth: '600px', margin: '5rem auto', textAlign: 'center' }}>
            <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '20px' }}>
              <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f87171', marginBottom: '0.75rem' }}>
                Analysis Could Not Complete
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                {errorMsg || 'Failed to crawl or parse this website. Please verify that the URL is live and accessible.'}
              </p>
              <button
                onClick={() => router.push('/')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                <ArrowLeft size={16} />
                <span>Return to Homepage</span>
              </button>
            </div>
          </div>
        )}

        {status === 'done' && siteData.site && (
          <AnalysisDashboard
            site={siteData.site}
            analysis={siteData.analysis}
            pages={siteData.pages}
          />
        )}
      </main>
    </div>
  );
}
