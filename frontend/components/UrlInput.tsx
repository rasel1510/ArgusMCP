'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, ArrowRight, Loader2, ShieldCheck, Zap } from 'lucide-react';

interface UrlInputProps {
  initialUrl?: string;
}

export default function UrlInput({ initialUrl = '' }: UrlInputProps) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start website analysis');
      }

      // Navigate to the analysis dashboard
      router.push(`/analyze/${data.siteId}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const handleQuickUrl = (quickUrl: string) => {
    setUrl(quickUrl);
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <div
          className="glass-panel animate-pulse-glow"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.5rem 0.6rem 0.5rem 1.25rem',
            borderRadius: '999px',
            backgroundColor: 'rgba(12, 16, 26, 0.85)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            transition: 'all 0.3s ease',
          }}
        >
          <Search size={22} color="#00f0ff" style={{ marginRight: '0.75rem', flexShrink: 0 }} />
          
          <input
            id="website-url-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste any website URL e.g. https://codemypixel.com/"
            disabled={loading}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '1.05rem',
              fontWeight: 500,
              fontFamily: 'inherit',
            }}
          />

          <button
            id="analyze-submit-btn"
            type="submit"
            disabled={loading || !url.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.75rem 1.75rem',
              borderRadius: '999px',
              background: loading
                ? 'rgba(255, 255, 255, 0.1)'
                : 'linear-gradient(135deg, #00f0ff 0%, #8b5cf6 100%)',
              color: loading ? '#94a3b8' : '#07090e',
              fontWeight: 700,
              fontSize: '0.95rem',
              letterSpacing: '0.02em',
              transition: 'all 0.2s ease',
              boxShadow: loading ? 'none' : '0 0 25px rgba(0, 240, 255, 0.4)',
              cursor: loading || !url.trim() ? 'not-allowed' : 'pointer',
              flexShrink: 0,
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin-slow" color="#00f0ff" />
                <span>Crawling...</span>
              </>
            ) : (
              <>
                <span>Analyze with MCP</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          fontSize: '0.9rem',
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      {/* Quick sample link selector */}
      <div style={{
        marginTop: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Try sample:</span>
        {[
          { label: 'codemypixel.com', url: 'https://codemypixel.com/' },
          { label: 'vercel.com', url: 'https://vercel.com' },
          { label: 'github.com', url: 'https://github.com' },
          { label: 'stripe.com', url: 'https://stripe.com' },
        ].map((sample) => (
          <button
            key={sample.url}
            type="button"
            onClick={() => handleQuickUrl(sample.url)}
            style={{
              padding: '4px 12px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              fontSize: '0.78rem',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#00f0ff';
              e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  );
}
