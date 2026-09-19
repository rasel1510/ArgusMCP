'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Activity } from 'lucide-react';

export default function Navbar() {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      backgroundColor: 'rgba(10, 11, 15, 0.88)',
      borderBottom: '1px solid var(--border)',
      padding: '0 1.5rem',
      height: '52px',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '7px',
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Globe size={15} color="#0a0b0f" strokeWidth={2.5} />
          </div>
          <span style={{
            fontWeight: 700,
            fontSize: '0.95rem',
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}>
            ArgusMCP
          </span>
        </Link>

        {/* Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: 'var(--text-tertiary)',
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--green)',
            display: 'inline-block',
          }} className="animate-pulse-dot" />
          <span>Online</span>
        </div>
      </div>
    </header>
  );
}
