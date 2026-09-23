'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  User,
  Loader2,
  ChevronDown,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ToolExecution {
  tool: string;
  args: any;
  result: any;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  executedTools?: ToolExecution[];
  timestamp: string;
}

interface ChatInterfaceProps {
  siteId: string;
  siteTitle?: string;
  domain?: string;
}

export default function ChatInterface({ siteId, siteTitle, domain }: ChatInterfaceProps) {
  const siteName = siteTitle || domain || 'this website';

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `I have full access to the crawled data for **${siteName}** — pages, SEO metadata, tech stack, performance, links, and images.\n\nAsk me anything about the site.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleTool = (id: string) =>
    setExpandedTools((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, query: text.trim(), history }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          executedTools: data.executedTools || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err.message || 'Unknown error'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'What tech stack is this site using?',
    'Summarize what this site does',
    'Audit the SEO',
    'List all contact info and socials',
    'What are the load times?',
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '680px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '0.875rem 1.25rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--bg-raised)',
        flexShrink: 0,
      }}>
        <MessageSquare size={15} color="var(--text-secondary)" />
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
          Assistant
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          {siteName}
        </span>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className="animate-fade-up"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
              gap: '4px',
              maxWidth: '88%',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {/* Tool executions */}
            {msg.executedTools && msg.executedTools.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
                {msg.executedTools.map((t, tIdx) => {
                  const key = `${idx}-${tIdx}`;
                  const open = !!expandedTools[key];
                  return (
                    <div key={tIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button
                        type="button"
                        className="tool-pill"
                        onClick={() => toggleTool(key)}
                      >
                        {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                        {t.tool}
                      </button>
                      {open && (
                        <div style={{
                          background: 'var(--bg-raised)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.6rem',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          maxHeight: '140px',
                          overflowY: 'auto',
                          color: 'var(--text-secondary)',
                          whiteSpace: 'pre-wrap',
                        }}>
                          <div style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                            args: {JSON.stringify(t.args)}
                          </div>
                          <div>{JSON.stringify(t.result, null, 2)}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bubble */}
            <div style={{
              padding: '0.7rem 1rem',
              borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
              background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-raised)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
              color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
              fontSize: '0.87rem',
              lineHeight: 1.6,
            }}>
              {msg.role === 'user' ? (
                <span>{msg.content}</span>
              ) : (
                <div className="prose" style={{ fontSize: '0.87rem' }}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
            </div>

            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', padding: '0 4px' }}>
              {msg.timestamp}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>
            <Loader2 size={13} className="animate-spin" />
            <span>Thinking…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      <div style={{
        padding: '0.5rem 1.25rem',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-raised)',
        flexShrink: 0,
      }}>
        {suggestions.map((s, i) => (
          <button
            key={i}
            type="button"
            disabled={loading}
            onClick={() => handleSend(s)}
            style={{
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.12s',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.borderColor = 'var(--border-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: '0.75rem 1.25rem',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        flexShrink: 0,
      }}>
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <input
            id="assistant-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this website…"
            disabled={loading}
            autoFocus
            style={{
              flex: 1,
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.6rem 0.9rem',
              color: 'var(--text-primary)',
              fontSize: '0.87rem',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'border-color 0.12s',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />
          <button
            id="assistant-send-btn"
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              padding: '0.6rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              background: loading || !input.trim() ? 'var(--bg-raised)' : 'var(--accent)',
              color: loading || !input.trim() ? 'var(--text-tertiary)' : '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.12s',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              border: '1px solid var(--border)',
            }}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
