'use client';
import { useState } from 'react';

export default function ResumeSection({ resume }: { resume: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(resume).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={copy}
      style={{
        padding: '6px 16px',
        fontSize: '0.85rem',
        fontWeight: '700',
        background: copied ? 'rgba(17, 128, 30, 0.15)' : 'rgb(202 202 202 / 22%)',
        border: `1px solid ${copied ? 'rgba(17, 128, 30, 0.4)' : 'rgba(100,100,100,0.2)'}`,
        borderRadius: '4px',
        color: copied ? '#1a4a1e' : '#0f100fff',
        cursor: 'pointer',
        boxShadow: '2px 2px 5px rgba(10,10,10,0.15)',
        transition: 'all 0.2s ease',
        fontFamily: 'kcgangster, monospace'
      }}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
