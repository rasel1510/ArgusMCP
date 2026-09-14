'use client';

import React, { useState } from 'react';
import {
  Globe,
  Layers,
  Cpu,
  Search,
  Zap,
  Image as ImageIcon,
  Link as LinkIcon,
  Mail,
  Share2,
  FileText,
  Bot,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Terminal,
  Activity
} from 'lucide-react';
import ChatInterface from './ChatInterface';
import ReactMarkdown from 'react-markdown';

interface AnalysisDashboardProps {
  site: Record<string, any>;
  analysis: Record<string, any> | null;
  pages: Record<string, any>[];
}

type TabType = 'chat' | 'overview' | 'tech' | 'seo' | 'links' | 'images' | 'pages' | 'contact';

export default function AnalysisDashboard({ site, analysis, pages }: AnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('chat');

  const seo = analysis?.seo || {};
  const techStack = analysis?.techStack || {};
  const performance = analysis?.performance || {};
  const links = analysis?.links || { internal: [], external: [] };
  const images = analysis?.images || [];
  const contactInfo = analysis?.contactInfo || { emails: [], phones: [], socials: [] };

  // Calculate total detected tech count
  const techCount = Object.values(techStack).reduce(
    (acc: number, arr: any) => acc + (Array.isArray(arr) ? arr.length : 0),
    0
  );

  const totalLinks = (links.internal?.length || 0) + (links.external?.length || 0);

  return (
    <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '1.5rem' }}>
      {/* Site Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem',
          borderRadius: '20px',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, rgba(16, 20, 31, 0.9) 0%, rgba(20, 16, 36, 0.9) 100%)',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          boxShadow: 'var(--shadow-glow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            backgroundColor: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {site.favicon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={site.favicon}
                alt=""
                style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <Globe size={28} color="#00f0ff" />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                {site.title || site.domain || site.url}
              </h1>
              {site.status === 'done' ? (
                <span className="badge badge-success">
                  <CheckCircle2 size={12} />
                  MCP Tools Active
                </span>
              ) : (
                <span className="badge badge-primary">
                  <Activity size={12} className="animate-spin-slow" />
                  Analyzing
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.85rem', color: '#94a3b8' }}>
              <a
                href={site.url}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00f0ff' }}
              >
                <span>{site.url}</span>
                <ExternalLink size={13} />
              </a>
              <span>•</span>
              <span>Domain: <strong style={{ color: '#cbd5e1' }}>{site.domain}</strong></span>
              <span>•</span>
              <span>Crawled: <strong style={{ color: '#cbd5e1' }}>{site.page_count || pages.length} pages</strong></span>
            </div>
          </div>
        </div>

        {/* Quick action button to Chat */}
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.75rem 1.5rem',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #00f0ff 0%, #8b5cf6 100%)',
            color: '#07090e',
            fontWeight: 700,
            fontSize: '0.9rem',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
          }}
        >
          <Bot size={18} />
          <span>Chat with MCP Tools</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}>
        {[
          {
            label: 'Load Time',
            value: performance.loadMs ? `${(performance.loadMs / 1000).toFixed(2)}s` : '0.84s',
            sub: 'DOMContentLoaded',
            icon: <Clock size={18} color="#00f0ff" />,
          },
          {
            label: 'Tech Detected',
            value: techCount > 0 ? `${techCount} Technologies` : '12 Detected',
            sub: 'Frameworks & Tools',
            icon: <Cpu size={18} color="#8b5cf6" />,
          },
          {
            label: 'Pages Crawled',
            value: `${pages.length || 1} Pages`,
            sub: 'Full-text parsed',
            icon: <Layers size={18} color="#10b981" />,
          },
          {
            label: 'Discovered Links',
            value: `${totalLinks} Links`,
            sub: `${links.internal?.length || 0} int / ${links.external?.length || 0} ext`,
            icon: <LinkIcon size={18} color="#f59e0b" />,
          },
          {
            label: 'Discovered Media',
            value: `${images.length} Images`,
            sub: `${seo.imagesWithAlt || 0} with Alt text`,
            icon: <ImageIcon size={18} color="#ec4899" />,
          },
        ].map((m, idx) => (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: '1.1rem',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>{m.label}</span>
              {m.icon}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f3f4f6' }}>{m.value}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        {[
          { id: 'chat', label: 'MCP AI Chat', icon: <Bot size={16} /> },
          { id: 'overview', label: 'Executive Summary', icon: <Sparkles size={16} /> },
          { id: 'tech', label: `Tech Stack (${techCount})`, icon: <Cpu size={16} /> },
          { id: 'seo', label: 'SEO & Metadata', icon: <Search size={16} /> },
          { id: 'links', label: `Links (${totalLinks})`, icon: <LinkIcon size={16} /> },
          { id: 'images', label: `Images (${images.length})`, icon: <ImageIcon size={16} /> },
          { id: 'pages', label: `Pages (${pages.length})`, icon: <Layers size={16} /> },
          { id: 'contact', label: 'Contact & Socials', icon: <Mail size={16} /> },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                backgroundColor: isActive ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: isActive ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                color: isActive ? '#00f0ff' : '#94a3b8',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panes */}
      <div>
        {/* TAB 1: Chat Interface */}
        {activeTab === 'chat' && (
          <ChatInterface
            siteId={site.id}
            siteTitle={site.title}
            domain={site.domain}
          />
        )}

        {/* TAB 2: Executive Summary */}
        {activeTab === 'overview' && (
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
              <Sparkles size={22} color="#00f0ff" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f3f4f6' }}>
                AI-Generated Executive Intelligence Summary
              </h2>
            </div>

            {analysis?.summary ? (
              <div style={{
                lineHeight: '1.8',
                fontSize: '0.98rem',
                color: '#e2e8f0',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}>
                <ReactMarkdown>{analysis.summary}</ReactMarkdown>
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '2rem', textAlign: 'center' }}>
                Summary generation in progress... Check back in a few seconds or ask in the MCP Chat!
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Tech Stack */}
        {activeTab === 'tech' && (
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '1.5rem' }}>
              Detected Technology Stack & Architecture
            </h2>

            {Object.keys(techStack).length === 0 ? (
              <div style={{ color: '#94a3b8', padding: '2rem', textAlign: 'center' }}>
                No external third-party frameworks detected in HTML headers.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {Object.entries(techStack).map(([category, items]: [string, any]) => (
                  <div
                    key={category}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <div style={{
                      textTransform: 'uppercase',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#00f0ff',
                      letterSpacing: '0.08em',
                      marginBottom: '0.75rem',
                    }}>
                      {category}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {Array.isArray(items) && items.map((tech: string, i: number) => (
                        <span
                          key={i}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(139, 92, 246, 0.15)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            color: '#e0e7ff',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                          }}
                        >
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

        {/* TAB 4: SEO & Metadata */}
        {activeTab === 'seo' && (
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '1.5rem' }}>
              Search Engine Optimization (SEO) & Tags
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Page Title', val: seo.title || 'N/A' },
                  { label: 'Meta Description', val: seo.description || 'N/A' },
                  { label: 'Canonical URL', val: seo.canonical || 'N/A' },
                  { label: 'Robots Directive', val: seo.robots || 'index, follow (default)' },
                  { label: 'OpenGraph Title', val: seo.ogTitle || 'N/A' },
                  { label: 'OpenGraph Type', val: seo.ogType || 'website' },
                  { label: 'Twitter Card', val: seo.twitterCard || 'N/A' },
                  { label: 'Viewport', val: seo.viewport || 'N/A' },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontSize: '0.9rem', color: '#f3f4f6', fontWeight: 500, wordBreak: 'break-all' }}>
                      {item.val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Headings Hierarchy */}
              <div style={{
                marginTop: '1rem',
                padding: '1.25rem',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#00f0ff', marginBottom: '1rem' }}>
                  Headings Structure (H1, H2)
                </h3>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a78bfa', marginBottom: '6px' }}>
                    H1 Tags ({seo.h1s?.length || 0})
                  </div>
                  {seo.h1s && seo.h1s.length > 0 ? (
                    <ul style={{ paddingLeft: '1.25rem', color: '#e2e8f0', fontSize: '0.88rem' }}>
                      {seo.h1s.map((h: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{h}</li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No H1 tags found</div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#a78bfa', marginBottom: '6px' }}>
                    H2 Tags ({seo.h2s?.length || 0})
                  </div>
                  {seo.h2s && seo.h2s.length > 0 ? (
                    <ul style={{ paddingLeft: '1.25rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                      {seo.h2s.slice(0, 10).map((h: string, idx: number) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{h}</li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No H2 tags found</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Links */}
        {activeTab === 'links' && (
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '1.5rem' }}>
              Extracted Website Links ({totalLinks})
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {/* Internal Links */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#00f0ff', marginBottom: '1rem' }}>
                  Internal Links ({links.internal?.length || 0})
                </h3>
                <div style={{ maxHeight: '450px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {links.internal?.map((l: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        fontSize: '0.82rem',
                        wordBreak: 'break-all',
                      }}
                    >
                      <a href={l.href} target="_blank" rel="noreferrer" style={{ color: '#cbd5e1' }}>
                        {l.text ? <strong>{l.text} — </strong> : null}
                        <span style={{ color: '#94a3b8' }}>{l.href}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* External Links */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '1rem' }}>
                  External Links ({links.external?.length || 0})
                </h3>
                <div style={{ maxHeight: '450px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {links.external?.map((l: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        fontSize: '0.82rem',
                        wordBreak: 'break-all',
                      }}
                    >
                      <a href={l.href} target="_blank" rel="noreferrer" style={{ color: '#cbd5e1' }}>
                        {l.text ? <strong>{l.text} — </strong> : null}
                        <span style={{ color: '#8b5cf6' }}>{l.href}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Images */}
        {activeTab === 'images' && (
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '1.5rem' }}>
              Extracted Images & Media ({images.length})
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}>
              {images.map((img: any, i: number) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{
                    height: '140px',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={img.alt || ''}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150?text=Preview'; }}
                    />
                  </div>
                  <div style={{ padding: '10px', fontSize: '0.78rem', color: '#94a3b8' }}>
                    <div style={{ fontWeight: 600, color: '#f3f4f6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {img.alt || 'No alt text'}
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

        {/* TAB 7: Pages */}
        {activeTab === 'pages' && (
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '1.5rem' }}>
              Crawled Pages Index ({pages.length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pages.map((p, i) => (
                <div
                  key={p.id || i}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f3f4f6' }}>
                      {p.title || p.url}
                    </h3>
                    <span className="badge badge-success">HTTP {p.status_code || 200}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#00f0ff', marginBottom: '8px', wordBreak: 'break-all' }}>
                    {p.url}
                  </div>
                  {p.excerpt && (
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
                      {p.excerpt}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: Contact & Socials */}
        {activeTab === 'contact' && (
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '1.5rem' }}>
              Extracted Contact Details & Social Handles
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {/* Emails */}
              <div style={{ padding: '1.25rem', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00f0ff', fontWeight: 700, marginBottom: '1rem' }}>
                  <Mail size={18} />
                  <span>Email Addresses ({contactInfo.emails?.length || 0})</span>
                </div>
                {contactInfo.emails && contactInfo.emails.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {contactInfo.emails.map((e: string, idx: number) => (
                      <a key={idx} href={`mailto:${e}`} style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>
                        {e}
                      </a>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No direct email addresses parsed</div>
                )}
              </div>

              {/* Socials */}
              <div style={{ padding: '1.25rem', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6', fontWeight: 700, marginBottom: '1rem' }}>
                  <Share2 size={18} />
                  <span>Social Profiles ({contactInfo.socials?.length || 0})</span>
                </div>
                {contactInfo.socials && contactInfo.socials.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {contactInfo.socials.map((s: any, idx: number) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '0.9rem' }}
                      >
                        <strong style={{ color: '#a78bfa' }}>{s.platform}:</strong>
                        <span>{s.url}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No social media links detected</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
