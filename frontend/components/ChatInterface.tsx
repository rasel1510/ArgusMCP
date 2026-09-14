'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Terminal,
  Loader2,
  ChevronDown,
  ChevronRight,
  Code2,
  CheckCircle2,
  AlertCircle
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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your **MCP Website Intelligence Assistant** for **${siteTitle || domain || 'this website'}**.\n\nAll scraped pages, SEO meta-data, tech signatures, performance metrics, links, and text content are loaded into my **Model Context Protocol (MCP) tool set**.\n\nAsk me anything or pick one of the suggested actions below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const toggleToolExpand = (id: string) => {
    setExpandedTools((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
      // Build conversation history for context
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          query: text.trim(),
          history,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process MCP query');
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.answer,
        executedTools: data.executedTools || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Error communicating with MCP agent:** ${err.message || 'Unknown error'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'What is the tech stack of this site?',
    'Summarize this website and its core business',
    'Audit the SEO strengths and issues',
    'What are the performance metrics and load times?',
    'List all contact information and social profiles',
    'What internal and external links are present?',
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '720px',
      backgroundColor: 'rgba(11, 14, 22, 0.95)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)',
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(16, 20, 31, 0.8)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #00f0ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Bot size={18} color="#07090e" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f3f4f6' }}>
              MCP Tool Query Agent
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Direct access to all 9 MCP web intelligence tools
            </div>
          </div>
        </div>

        <div className="glass-pill" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          fontSize: '0.75rem',
          color: '#a78bfa',
        }}>
          <Terminal size={12} />
          <span>Tools Loaded</span>
        </div>
      </div>

      {/* Messages list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '12px',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: msg.role === 'user' ? '80%' : '90%',
            }}
          >
            {msg.role === 'assistant' && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
              }}>
                <Bot size={18} color="#a78bfa" />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              {/* Executed Tools Badge Container */}
              {msg.executedTools && msg.executedTools.length > 0 && (
                <div style={{
                  marginBottom: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ⚡ MCP Tools Executed ({msg.executedTools.length}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {msg.executedTools.map((t, tIdx) => {
                      const toolKey = `${idx}-${tIdx}`;
                      const isExpanded = !!expandedTools[toolKey];
                      return (
                        <div key={tIdx} style={{ display: 'flex', flexDirection: 'column' }}>
                          <button
                            type="button"
                            onClick={() => toggleToolExpand(toolKey)}
                            className="tool-call-pill"
                            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Code2 size={12} color="#00f0ff" />
                            <span>{t.tool}</span>
                            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          </button>

                          {isExpanded && (
                            <div style={{
                              marginTop: '4px',
                              padding: '8px',
                              backgroundColor: 'rgba(0, 0, 0, 0.5)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontFamily: 'var(--font-mono)',
                              maxHeight: '160px',
                              overflowY: 'auto',
                              color: '#cbd5e1',
                              whiteSpace: 'pre-wrap',
                            }}>
                              <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Args: {JSON.stringify(t.args)}</div>
                              <div style={{ color: '#34d399' }}>Result: {JSON.stringify(t.result, null, 2)}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Message bubble */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  backgroundColor: msg.role === 'user'
                    ? 'rgba(0, 240, 255, 0.12)'
                    : 'rgba(255, 255, 255, 0.04)',
                  border: msg.role === 'user'
                    ? '1px solid rgba(0, 240, 255, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#f3f4f6',
                  fontSize: '0.92rem',
                  lineHeight: '1.6',
                  boxShadow: msg.role === 'user' ? '0 0 20px rgba(0, 240, 255, 0.1)' : 'none',
                }}
              >
                {msg.role === 'user' ? (
                  <div>{msg.content}</div>
                ) : (
                  <div className="prose prose-invert" style={{ fontSize: '0.92rem' }}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>

              <div style={{
                fontSize: '0.7rem',
                color: '#64748b',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                padding: '0 4px',
              }}>
                {msg.timestamp}
              </div>
            </div>

            {msg.role === 'user' && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 240, 255, 0.2)',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
              }}>
                <User size={18} color="#00f0ff" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Bot size={18} color="#a78bfa" />
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.75rem 1.25rem',
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#a78bfa',
              fontSize: '0.85rem',
            }}>
              <Loader2 size={16} className="animate-spin-slow" />
              <span>Querying MCP tools & synthesizing intelligence...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion pills */}
      <div style={{
        padding: '0.5rem 1.5rem',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        backgroundColor: 'rgba(11, 14, 22, 0.8)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            type="button"
            disabled={loading}
            onClick={() => handleSend(s)}
            style={{
              padding: '4px 12px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              fontSize: '0.78rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.4)';
              e.currentTarget.style.color = '#00f0ff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#cbd5e1';
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(16, 20, 31, 0.95)',
      }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: 'flex', gap: '10px' }}
        >
          <input
            id="mcp-query-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about this website, request actions, or query MCP tools..."
            disabled={loading}
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '0.75rem 1.25rem',
              color: '#ffffff',
              fontSize: '0.95rem',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            id="mcp-send-btn"
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              background: loading || !input.trim()
                ? 'rgba(255, 255, 255, 0.08)'
                : 'linear-gradient(135deg, #00f0ff 0%, #8b5cf6 100%)',
              color: loading || !input.trim() ? '#64748b' : '#07090e',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
