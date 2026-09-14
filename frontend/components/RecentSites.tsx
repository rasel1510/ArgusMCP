'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Globe, Layers, ArrowUpRight, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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
      .then((res) => res.json())
      .then((data) => {
        if (data.sites) setSites(data.sites);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <Loader2 className="animate-spin-slow" size={24} color="#00f0ff" />
      </div>
    );
  }

  if (sites.length === 0) {
    return null;
  }

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '3rem auto 0', padding: '0 1.5rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="#00f0ff" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f3f4f6' }}>
            Recently Analyzed Websites
          </h3>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Stored in MCP Intelligence Knowledge Base
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.25rem',
      }}>
        {sites.map((site) => (
          <Link
            key={site.id}
            href={`/analyze/${site.id}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              className="glass-panel"
              style={{
                padding: '1.25rem',
                borderRadius: '16px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.4)';
                e.currentTarget.style.boxShadow = '0 12px 35px -5px rgba(0, 240, 255, 0.25)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {site.favicon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={site.favicon}
                        alt=""
                        style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Globe size={18} color="#00f0ff" />
                    )}
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f3f4f6' }}>
                      {site.domain || site.url}
                    </span>
                  </div>

                  <div>
                    {site.status === 'done' ? (
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} />
                        Analyzed
                      </span>
                    ) : site.status === 'analyzing' ? (
                      <span className="badge badge-primary">
                        <Loader2 size={12} className="animate-spin-slow" />
                        Analyzing
                      </span>
                    ) : (
                      <span className="badge badge-warning">
                        <AlertCircle size={12} />
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                <p style={{
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                  lineHeight: '1.4',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  marginBottom: '1rem',
                }}>
                  {site.title || 'Analyzing website architecture and metadata...'}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '0.78rem',
                color: '#64748b',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={14} color="#8b5cf6" />
                  <span>{site.page_count || 1} pages crawled</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00f0ff', fontWeight: 600 }}>
                  <span>Inspect MCP</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
