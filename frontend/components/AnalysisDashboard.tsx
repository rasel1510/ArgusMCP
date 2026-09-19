'use client';

import React, { useState } from 'react';
import {
  Globe,
  Layers,
  Cpu,
  Search,
  Image as ImageIcon,
  Link as LinkIcon,
  Mail,
  Share2,
  FileText,
  ExternalLink,
  CheckCircle2,
  Clock,
  MessageSquare,
} from 'lucide-react';
import ChatInterface from './ChatInterface';
import ReactMarkdown from 'react-markdown';

interface AnalysisDashboardProps {
  site: Record<string, any>;
  analysis: Record<string, any> | null;
  pages: Record<string, any>[];
}

type TabType = 'assistant' | 'overview' | 'tech' | 'seo' | 'links' | 'images' | 'pages' | 'contact';

export default function AnalysisDashboard({ site, analysis, pages }: AnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const seo         = analysis?.seo         || {};
  const techStack   = analysis?.techStack   || {};
  const performance = analysis?.performance || {};
  const links       = analysis?.links       || { internal: [], external: [] };
  const images      = analysis?.images      || [];
  const contactInfo = analysis?.contactInfo || { emails: [], phones: [], socials: [] };

  const techCount  = Object.values(techStack).reduce((acc: number, arr: any) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
  const totalLinks = (links.internal?.length || 0) + (links.external?.length || 0);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview',  label: 'Overview',              icon: <FileText size={13} /> },
    { id: 'tech',      label: `Tech (${techCount})`,   icon: <Cpu size={13} /> },
    { id: 'seo',       label: 'SEO',                   icon: <Search size={13} /> },
    { id: 'links',     label: `Links (${totalLinks})`, icon: <LinkIcon size={13} /> },
    { id: 'images',    label: `Images (${images.length})`, icon: <ImageIcon size={13} /> },
    { id: 'pages',     label: `Pages (${pages.length})`, icon: <Layers size={13} /> },
    { id: 'contact',   label: 'Contact',               icon: <Mail size={13} /> },
    { id: 'assistant', label: 'Assistant',             icon: <MessageSquare size={13} /> },
  ];

  /* ── Shared sub-section header ────────────────────────────── */
  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
      {children}
    </div>
  );

  return (
    <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '1.5rem' }}>

      {/* ── Site header ──────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
          <div style={{
            width: '40px', height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
          }}>
            {site.favicon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={site.favicon} alt="" width={24} height={24} style={{ objectFit: 'contain' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <Globe size={20} color="var(--text-tertiary)" />
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {site.title || site.domain || site.url}
              </h1>
              {site.status === 'done' ? (
                <span className="badge badge-green"><CheckCircle2 size={9} /> Analyzed</span>
              ) : (
                <span className="badge badge-blue">Processing</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '0.78rem', color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
              <a href={site.url} target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent)' }}>
                {site.url} <ExternalLink size={10} />
              </a>
              <span>·</span>
              <span>{site.page_count || pages.length} pages crawled</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Metrics row ──────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1px',
        background: 'var(--border)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginBottom: '1.25rem',
      }}>
        {[
          { label: 'Load time',    value: performance.loadMs ? `${(performance.loadMs / 1000).toFixed(2)}s` : '—',   sub: 'DOMContentLoaded' },
          { label: 'Technologies', value: techCount > 0 ? techCount : '—',                                            sub: 'Detected' },
          { label: 'Pages',        value: pages.length || 1,                                                          sub: 'Crawled' },
          { label: 'Links',        value: totalLinks || '—',                                                          sub: `${links.internal?.length || 0} int · ${links.external?.length || 0} ext` },
          { label: 'Images',       value: images.length || '—',                                                       sub: `${seo.imagesWithAlt || 0} with alt` },
        ].map((m, i) => (
          <div key={i} style={{ background: 'var(--bg-surface)', padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>{m.label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{m.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        gap: '2px',
        marginBottom: '1.25rem',
        overflowX: 'auto',
        paddingBottom: '2px',
      }}>
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '0.45rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                background: active ? 'var(--bg-raised)' : 'transparent',
                border: active ? '1px solid var(--border)' : '1px solid transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                fontWeight: active ? 600 : 400,
                fontSize: '0.82rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.12s',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-tertiary)'; }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Panes ────────────────────────────────────────── */}
      <div className="animate-fade-up" key={activeTab}>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <SectionLabel>Summary</SectionLabel>
            {analysis?.summary ? (
              <div className="prose" style={{ fontSize: '0.88rem' }}>
                <ReactMarkdown>{analysis.summary}</ReactMarkdown>
              </div>
            ) : (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                Summary not yet available. Switch to the Assistant tab to ask questions.
              </p>
            )}
          </div>
        )}

        {/* Tech Stack */}
        {activeTab === 'tech' && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <SectionLabel>Detected Technologies</SectionLabel>
            {Object.keys(techStack).length === 0 ? (
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No frameworks detected in page headers.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {Object.entries(techStack).map(([category, items]: [string, any]) => (
                  <div key={category}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                      {category}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {Array.isArray(items) && items.map((tech: string, i: number) => (
                        <span key={i} style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-raised)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-primary)',
                          fontSize: '0.82rem',
                          fontWeight: 500,
                        }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SEO */}
        {activeTab === 'seo' && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <SectionLabel>SEO & Metadata</SectionLabel>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.25rem' }}>
              {[
                { label: 'Title',            val: seo.title || '—' },
                { label: 'Description',      val: seo.description || '—' },
                { label: 'Canonical',        val: seo.canonical || '—' },
                { label: 'Robots',           val: seo.robots || 'index, follow' },
                { label: 'OG Title',         val: seo.ogTitle || '—' },
                { label: 'OG Type',          val: seo.ogType || '—' },
                { label: 'Twitter Card',     val: seo.twitterCard || '—' },
                { label: 'Viewport',         val: seo.viewport || '—' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'var(--bg-surface)', padding: '0.85rem 1rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '3px' }}>{item.label}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500, wordBreak: 'break-word' }}>{item.val}</div>
                </div>
              ))}
            </div>

            {/* Headings */}
            <SectionLabel>Heading Structure</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { label: 'H1', items: seo.h1s },
                { label: 'H2', items: seo.h2s?.slice(0, 10) },
              ].map(({ label, items }) => (
                <div key={label} style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '0.6rem' }}>
                    {label} ({items?.length || 0})
                  </div>
                  {items && items.length > 0 ? (
                    <ul style={{ paddingLeft: '1.1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      {items.map((h: string, i: number) => <li key={i} style={{ marginBottom: '3px' }}>{h}</li>)}
                    </ul>
                  ) : (
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>None found</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {activeTab === 'links' && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <SectionLabel>Links — {totalLinks} total</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
              {[
                { label: 'Internal', items: links.internal, color: 'var(--accent)' },
                { label: 'External', items: links.external, color: 'var(--text-secondary)' },
              ].map(({ label, items, color }) => (
                <div key={label}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '0.6rem' }}>
                    {label} ({items?.length || 0})
                  </div>
                  <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {items?.map((l: any, i: number) => (
                      <div key={i} style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-raised)', border: '1px solid var(--border)', fontSize: '0.78rem' }}>
                        <a href={l.href} target="_blank" rel="noreferrer" style={{ color, wordBreak: 'break-all' }}>
                          {l.text && <strong style={{ color: 'var(--text-primary)' }}>{l.text} — </strong>}
                          {l.href}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Images */}
        {activeTab === 'images' && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <SectionLabel>Images — {images.length}</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {images.map((img: any, i: number) => (
                <div key={i} style={{ background: 'var(--bg-raised)' }}>
                  <div style={{ height: '120px', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={img.alt || ''}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <div style={{ padding: '8px 10px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {img.alt || '(no alt)'}
                    </div>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                      {img.src}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pages */}
        {activeTab === 'pages' && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <SectionLabel>Crawled pages — {pages.length}</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {pages.map((p, i) => (
                <div key={p.id || i} style={{ background: 'var(--bg-raised)', padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {p.title || p.url}
                    </span>
                    <span className="badge badge-green">HTTP {p.status_code || 200}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginBottom: p.excerpt ? '6px' : 0, wordBreak: 'break-all' }}>
                    {p.url}
                  </div>
                  {p.excerpt && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                      {p.excerpt}…
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {activeTab === 'contact' && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <SectionLabel>Contact & Socials</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  <Mail size={14} color="var(--text-tertiary)" />
                  Emails ({contactInfo.emails?.length || 0})
                </div>
                {contactInfo.emails?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {contactInfo.emails.map((e: string, i: number) => (
                      <a key={i} href={`mailto:${e}`} style={{ fontSize: '0.84rem', color: 'var(--accent)' }}>{e}</a>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>None found</span>
                )}
              </div>

              <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  <Share2 size={14} color="var(--text-tertiary)" />
                  Social profiles ({contactInfo.socials?.length || 0})
                </div>
                {contactInfo.socials?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {contactInfo.socials.map((s: any, i: number) => (
                      <a key={i} href={s.url} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)', minWidth: '70px' }}>{s.platform}</strong>
                        <span style={{ color: 'var(--accent)' }}>{s.url}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>None found</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Assistant */}
        {activeTab === 'assistant' && (
          <ChatInterface siteId={site.id} siteTitle={site.title} domain={site.domain} />
        )}
      </div>
    </div>
  );
}
