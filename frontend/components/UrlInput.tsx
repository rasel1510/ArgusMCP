'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Loader2 } from 'lucide-react';

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
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      router.push(`/analyze/${data.siteId}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Try again.');
      setLoading(false);
    }
  };

  const samples = [
    { label: 'vercel.com', url: 'https://vercel.com' },
    { label: 'github.com', url: 'https://github.com' },
    { label: 'stripe.com', url: 'https://stripe.com' },
    { label: 'linear.app', url: 'https://linear.app' },
  ];

  return (
    <div style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-surface)',
          border: `1px solid ${loading ? 'var(--border-focus)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '6px 6px 6px 1rem',
          transition: 'border-color 0.15s',
          boxShadow: loading ? '0 0 0 3px var(--accent-glow)' : 'none',
        }}
          onFocus={() => { }}
        >
          <Search
            size={16}
            color="var(--text-tertiary)"
            style={{ marginRight: '0.6rem', flexShrink: 0 }}
          />

          <input
            id="website-url-input"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL — e.g. https://example.com and ask any question about this in chat"
            disabled={loading}
            autoComplete="off"
            spellCheck={false}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              minWidth: 0,
            }}
          />

          <button
            id="analyze-submit-btn"
            type="submit"
            disabled={loading || !url.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.55rem 1.1rem',
              borderRadius: '10px',
              background: loading || !url.trim()
                ? 'rgba(255,255,255,0.05)'
                : 'var(--accent)',
              color: loading || !url.trim() ? 'var(--text-tertiary)' : '#fff',
              fontWeight: 600,
              fontSize: '0.85rem',
              letterSpacing: '-0.01em',
              transition: 'all 0.15s',
              cursor: loading || !url.trim() ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Analyzing…</span>
              </>
            ) : (
              <>
                <span>Analyze</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.6rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--red-dim)',
          border: '1px solid rgba(231, 76, 60, 0.25)',
          color: '#f97068',
          fontSize: '0.83rem',
        }}>
          {error}
        </div>
      )}

      {/* Samples */}
      <div style={{
        marginTop: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Try:</span>
        {samples.map((s) => (
          <button
            key={s.url}
            type="button"
            onClick={() => setUrl(s.url)}
            style={{
              padding: '2px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              transition: 'all 0.12s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
