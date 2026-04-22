'use client';

import React, { useState, useRef } from 'react';
import JobAnalysisDisplay from '@/components/chat/JobAnalysisDisplay';

type AnalysisState = 'idle' | 'loading' | 'done' | 'error';

export default function AnalyzePage() {
  const [input, setInput] = useState('');
  const [state, setState] = useState<AnalysisState>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const analyze = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setState('loading');
    setResult(null);
    setError('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: trimmed }],
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const msg = Array.isArray(data) ? data[0] : data;
      if (msg?.tool === 'analyzeJob' && msg?.result) {
        setResult(msg.result);
        setState('done');
      } else {
        setError(msg?.content || 'No analysis returned. Paste a job description or URL.');
        setState('error');
      }
    } catch (e: any) {
      setError(e.message || 'Request failed.');
      setState('error');
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) analyze();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'white',
      fontFamily: 'kcgangster, sans-serif',
      padding: '60px 0',
    }}>
      <div style={{ width: '75%', margin: '0 auto', maxWidth: '960px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#1a1a1a', margin: 0 }}>
            Job Analyzer
          </h1>
          <p style={{ color: 'rgba(0,0,0,0.45)', marginTop: '8px', fontSize: '1rem' }}>
            Paste a job URL or description — get a match score, priorities, gaps, and tailored keywords.
          </p>
        </div>

        {/* Input area */}
        <div style={{ marginBottom: '28px' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Paste job URL or full job description here..."
            disabled={state === 'loading'}
            rows={6}
            style={{
              width: '100%',
              padding: '16px 20px',
              fontSize: '1rem',
              lineHeight: '1.6',
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: '10px',
              background: 'rgb(220 211 195 / 20%)',
              boxShadow: 'inset rgba(130, 130, 130, 0.35) 2px 2px 10px 2px',
              resize: 'vertical',
              fontFamily: 'inherit',
              outline: 'none',
              color: '#1a1a1a',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
            <button
              onClick={analyze}
              disabled={state === 'loading' || !input.trim()}
              style={{
                padding: '10px 28px',
                fontSize: '1rem',
                fontWeight: '800',
                background: state === 'loading' ? 'rgba(0,0,0,0.08)' : '#1a1a1a',
                color: state === 'loading' ? 'rgba(0,0,0,0.3)' : 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: state === 'loading' || !input.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: state === 'loading' ? 'none' : '4px 4px 0 rgba(0,0,0,0.15)',
                fontFamily: 'inherit',
              }}
            >
              {state === 'loading' ? 'Analyzing...' : 'Analyze'}
            </button>
            {state !== 'idle' && (
              <button
                onClick={() => { setState('idle'); setResult(null); setError(''); setInput(''); }}
                style={{
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  background: 'transparent',
                  color: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(0,0,0,0.15)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Clear
              </button>
            )}
            <span style={{ fontSize: '0.8rem', color: 'rgba(0,0,0,0.3)', marginLeft: 'auto' }}>
              ⌘ + Enter to submit
            </span>
          </div>
        </div>

        {/* Loading state */}
        {state === 'loading' && (
          <div style={{
            padding: '48px',
            textAlign: 'center',
            background: 'rgb(220 211 195 / 20%)',
            borderRadius: '10px',
            boxShadow: 'inset rgba(130, 130, 130, 0.35) 2px 2px 10px 2px',
            color: 'rgba(0,0,0,0.45)',
            fontSize: '1rem',
          }}>
            Running analysis...
          </div>
        )}

        {/* Error state */}
        {state === 'error' && (
          <div style={{
            padding: '24px',
            background: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '10px',
            color: '#b91c1c',
            fontSize: '0.95rem',
          }}>
            {error}
          </div>
        )}

        {/* Results */}
        {state === 'done' && result && (
          <JobAnalysisDisplay data={result} />
        )}

      </div>
    </div>
  );
}
