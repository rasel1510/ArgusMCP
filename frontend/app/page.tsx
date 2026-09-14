'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import UrlInput from '../components/UrlInput';
import RecentSites from '../components/RecentSites';
import { Sparkles, Bot, Shield, Zap, Search, Code, Cpu, Database, Network } from 'lucide-react';

export default function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flex: 1, padding: '3.5rem 1.5rem 5rem' }}>
        {/* Hero Section */}
        <section style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          {/* Top pill */}
          <div
            className="glass-pill"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 18px',
              fontSize: '0.82rem',
              color: '#00f0ff',
              marginBottom: '1.75rem',
            }}
          >
            <Sparkles size={16} />
            <span>Autonomous Web Analysis via Model Context Protocol</span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '1.5rem',
            }}
          >
            Turn Any Website Into An{' '}
            <span className="gradient-text-accent">MCP Intelligence Engine</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
              color: '#94a3b8',
              maxWidth: '720px',
              margin: '0 auto 2.75rem',
              lineHeight: 1.6,
            }}
          >
            Input any URL (like <code style={{ color: '#00f0ff', background: 'rgba(0,240,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>https://codemypixel.com/</code>).
            Our headless agent crawls the full architecture, builds structured tools, and lets you query, inspect, or execute actions with AI.
          </p>

          {/* URL Input Form */}
          <UrlInput />
        </section>

        {/* Feature Grid */}
        <section style={{ maxWidth: '1200px', margin: '5rem auto 0' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {[
              {
                icon: <Search size={22} color="#00f0ff" />,
                title: 'Deep Architecture Crawl',
                desc: 'Scrapes full text, DOM tree, links, media, and response headers across internal pages.',
                badge: 'Playwright Headless',
              },
              {
                icon: <Cpu size={22} color="#8b5cf6" />,
                title: 'Tech Stack Fingerprinting',
                desc: 'Detects 60+ frameworks, CMS engines, analytics pixels, CDNs, UI kits, and payment gateways.',
                badge: 'Signatures Engine',
              },
              {
                icon: <Database size={22} color="#10b981" />,
                title: 'MCP Tool Protocol',
                desc: 'Exposes scraped intelligence directly as callable MCP tools for Claude & OpenRouter agents.',
                badge: '9 Standard Tools',
              },
              {
                icon: <Bot size={22} color="#ec4899" />,
                title: 'Autonomous AI Q&A',
                desc: 'Ask questions or perform actions in natural language; AI dynamically executes relevant MCP tools.',
                badge: 'Claude 3.5 Sonnet',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="glass-panel"
                style={{
                  padding: '1.75rem',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.25s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0px)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {f.icon}
                  </div>
                  <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>{f.badge}</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f3f4f6' }}>{f.title}</h3>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recently Analyzed Section */}
        <RecentSites />
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '0.85rem',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>MCP Web Analyzer • Model Context Protocol System</div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>Next.js 14</span>
            <span>•</span>
            <span>OpenRouter AI</span>
            <span>•</span>
            <span>TypeScript</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
