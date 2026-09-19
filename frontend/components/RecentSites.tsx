'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Globe, Layers, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface SiteItem {
  id: string;
  url: string;
  domain: string;
  title: string;
  favicon?: string;
  status: string;
  page_count: number;
  created_at: string;
}

export default function RecentSites() {
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sites?limit=6')
      .then((r) => r.json())
      .then((d) => { if (d.sites) setSites(d.sites); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <Loader2 size={18} className="animate-spin" color="var(--text-tertiary)" />
    </div>
  );

  if (sites.length === 0) return null;

  return (
    <div style={{ maxWidth: '900px', margin: '3.5rem auto 0' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
          Recent
        </span>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1px',
        background: 'var(--border)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}>
        {sites.map((site) => (
          <Link
            key={site.id}
            href={`/analyze/${site.id}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                background: 'var(--bg-surface)',
                padding: '1.1rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                height: '100%',
                transition: 'background 0.12s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-raised)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  {site.favicon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={site.favicon}
                      alt=""
                      width={16}
                      height={16}
                      style={{ borderRadius: '3px', objectFit: 'contain', flexShrink: 0 }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <Globe size={14} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
                  )}
                  <span style={{
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {site.domain || site.url}
                  </span>
                </div>

                {site.status === 'done' ? (
                  <span className="badge badge-green">Done</span>
                ) : site.status === 'analyzing' ? (
                  <span className="badge badge-blue">
                    <Loader2 size={9} className="animate-spin" />
                    Running
                  </span>
                ) : (
                  <span className="badge badge-amber">Pending</span>
                )}
              </div>

              {/* Title */}
              {site.title && (
                <p style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.4,
                }}>
                  {site.title}
                </p>
              )}

              {/* Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'auto',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border)',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Layers size={11} />
                  <span>{site.page_count || 1} pages</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent)', fontWeight: 500, fontSize: '0.75rem' }}>
                  <span>View report</span>
                  <ArrowRight size={11} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
