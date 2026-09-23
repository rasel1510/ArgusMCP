'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import UrlInput from '../components/UrlInput';
import RecentSites from '../components/RecentSites';
import { Search, Cpu, Link as LinkIcon, BarChart2 } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <Search size={16} color="var(--accent)" />,
      title: 'Full-page crawl',
      desc: 'Extracts text, DOM structure, links, media, and response headers from every internal page.',
    },
    {
      icon: <Cpu size={16} color="var(--accent)" />,
      title: 'Tech stack detection',
      desc: 'Identifies frameworks, CMS platforms, CDNs, analytics, and payment integrations.',
    },
    {
      icon: <Search size={16} color="var(--accent)" />,
      title: 'SEO audit',
      desc: 'Reviews titles, meta descriptions, Open Graph tags, heading structure, and robots directives.',
    },
    {
      icon: <LinkIcon size={16} color="var(--accent)" />,
      title: 'Link & asset map',
      desc: 'Lists all internal and external links, images, and contact details found across pages.',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '4rem 1.5rem 5rem' }}>

        {/* Hero */}
        <section style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.4rem)',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            lineHeight: 1.15,
            color: 'var(--text-primary)',
            marginBottom: '0.6rem',
          }}>
            ArgusMCP
          </h1>
          <p style={{
            fontSize: '1.05rem',
            fontWeight: 500,
            color: 'var(--accent)',
            marginBottom: '0.6rem',
          }}>
            An Agentic Web Intelligence via the Model Context Protocol
          </p>


          <UrlInput />
        </section>

        {/* Features */}
        <section style={{ maxWidth: '900px', margin: '4.5rem auto 0' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1px',
            background: 'var(--border)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}>
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  padding: '1.5rem',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.25rem',
                }}>
                  {f.icon}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  {f.title}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent */}
        <RecentSites />
      </main>

      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '1.25rem 1.5rem',
        textAlign: 'center',
        color: 'var(--text-tertiary)',
        fontSize: '0.78rem',
      }}>
        ArgusMCP — Autonomous Web Intelligence
      </footer>
    </div>
  );
}
