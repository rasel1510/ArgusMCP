'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Cpu, Sparkles, Terminal } from 'lucide-react';

export default function Navbar() {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(16px)',
      backgroundColor: 'rgba(7, 9, 14, 0.8)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '0.875rem 1.5rem',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00f0ff 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)',
          }}>
            <Globe size={22} color="#07090e" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', color: '#fff' }}>
                MCP<span style={{ color: '#00f0ff' }}>Web</span>Analyzer
              </span>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                v1.0
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Model Context Protocol Intelligence</div>
          </div>
        </Link>

        {/* Status Indicators & Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="glass-pill" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            fontSize: '0.8rem',
            color: '#10b981',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }} />
            <span style={{ color: '#94a3b8' }}>MCP Server:</span>
            <strong style={{ color: '#f3f4f6' }}>Active</strong>
          </div>

          <div className="glass-pill" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            fontSize: '0.8rem',
            color: '#a78bfa',
          }}>
            <Sparkles size={14} color="#a78bfa" />
            <span>OpenRouter Claude 3.5</span>
          </div>
        </div>
      </div>
    </header>
  );
}
