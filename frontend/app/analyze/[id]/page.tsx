'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import AnalysisDashboard from '../../../components/AnalysisDashboard';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';

const steps = [
  'Loading browser context',
  'Rendering page',
  'Extracting content',
  'Detecting tech stack',
  'Mapping links',
  'Indexing assets',
  'Finalizing',
];

export default function AnalyzePage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id as string;

  const [siteData, setSiteData] = useState<{
    site: Record<string, any> | null;
    analysis: Record<string, any> | null;
    pages: Record<string, any>[];
  }>({ site: null, analysis: null, pages: [] });

  const [status, setStatus]   = useState<'loading' | 'analyzing' | 'done' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stepIdx, setStepIdx]  = useState(0);

  // Cycle through step labels while analyzing
  useEffect(() => {
    if (status !== 'analyzing') return;
    const t = setInterval(() => setStepIdx((p) => (p < steps.length - 1 ? p + 1 : p)), 2800);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => {
    if (!siteId) return;
    let active = true;
    let timer: NodeJS.Timeout;

    const poll = async () => {
      try {
        const res = await fetch(`/api/sites/${siteId}`);
        if (!res.ok) throw new Error('Could not load site');
        const data = await res.json();
        if (!active) return;

        if (data.site) {
          setSiteData({ site: data.site, analysis: data.analysis, pages: data.pages || [] });

          if (data.site.status === 'done')  { setStatus('done'); }
          else if (data.site.status === 'error') {
            setStatus('error');
            setErrorMsg(data.site.error_msg || 'Analysis failed');
          } else {
            setStatus('analyzing');
            timer = setTimeout(poll, 1800);
          }
        }
      } catch (err: any) {
        if (!active) return;
        setStatus('error');
        setErrorMsg(err.message || 'Connection error');
      }
    };

    poll();
    return () => { active = false; clearTimeout(timer); };
  }, [siteId]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '2rem 1rem 4rem' }}>

        {/* Loading */}
        {status === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '8rem', color: 'var(--text-tertiary)' }}>
            <Loader2 size={22} className="animate-spin" />
            <span style={{ fontSize: '0.85rem' }}>Loading…</span>
          </div>
        )}

        {/* Analyzing */}
        {status === 'analyzing' && (
          <div style={{ maxWidth: '480px', margin: '7rem auto', textAlign: 'center' }}>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
            }}>
              <Loader2 size={28} className="animate-spin" color="var(--accent)" />

              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Analyzing
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', wordBreak: 'break-all' }}>
                  {siteData.site?.url || ''}
                </p>
              </div>

              {/* Progress */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{
                  height: '3px',
                  background: 'var(--bg-raised)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(96, ((stepIdx + 1) / steps.length) * 100)}%`,
                    background: 'var(--accent)',
                    borderRadius: '999px',
                    transition: 'width 0.7s ease',
                  }} />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'left' }}>
                  {steps[stepIdx]}…
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div style={{ maxWidth: '480px', margin: '7rem auto' }}>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid rgba(231, 76, 60, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              textAlign: 'center',
            }}>
              <AlertTriangle size={28} color="var(--red)" />
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Analysis failed
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {errorMsg || 'Could not crawl this URL. Make sure it is publicly accessible.'}
                </p>
              </div>
              <button
                onClick={() => router.push('/')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.5rem 1.1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  fontSize: '0.83rem',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={14} />
                Go back
              </button>
            </div>
          </div>
        )}

        {/* Done */}
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
