// src/components/chat/JobAnalysisDisplay.tsx
'use client';
import React, { useState } from 'react';

interface JobAnalysisProps {
  data: {
    matchScore: number;
    resume: string;
    jobPhrases?: string[];
    matchSummary?: string;
  };
}

export const JobAnalysisDisplay: React.FC<JobAnalysisProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const copyResume = () => {
    if (!data.resume) return;
    navigator.clipboard.writeText(data.resume).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#ef4444';
  };

  const scoreColor = getScoreColor(data.matchScore);

  return (
    <div style={{ background: 'white', borderRadius: '10px', height: '100%' }}>

      {/* Score */}
      <div style={{ padding: '1rem', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <div className="rounded" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          background: 'rgb(220 211 195 / 35%)',
          boxShadow: 'inset rgba(130,130,130,0.5) 2px 2px 16px 3px, rgba(0,0,0,0.06) 0px 2px 4px 0px',
          padding: '1rem'
        }}>
          <div style={{
            width: '85px',
            height: '85px',
            marginLeft: '8px',
            flexShrink: 0,
            boxShadow: 'rgba(130,130,130,0.5) 20px 13px 5px 0px, rgba(0,0,0,0.06) 0px 2px 4px 0px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: scoreColor }}>
              {data.matchScore}%
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
              Match
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '200px', padding: '0 1rem' }}>
            {data.matchSummary ? (
              <p style={{ margin: 0, color: 'rgb(50,35,15)', fontSize: '1rem', lineHeight: '1.7', fontWeight: '450' }}>
                {data.matchSummary}
              </p>
            ) : (
              <p style={{ margin: 0, color: 'rgb(60,45,30)', fontSize: '1rem', lineHeight: '1.6', fontWeight: '450' }}>
                Tailored resume generated below.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Phrases pulled from job description */}
      {data.jobPhrases && data.jobPhrases.length > 0 && (
        <div style={{ padding: '1rem 1.5rem 0' }}>
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: '700', color: 'rgba(5,5,4,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Phrases pulled from job description
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
            {data.jobPhrases.map((phrase, i) => (
              <span key={i} style={{
                padding: '0.3rem 0.75rem',
                background: 'rgb(220 211 195 / 50%)',
                boxShadow: 'inset rgba(130,130,130,0.4) 1px 2px 6px 1px',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'rgb(50,35,15)'
              }}>
                {phrase}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Resume */}
      {data.resume && (
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: 'rgba(5,5,4,1)' }}>
              Tailored Resume
            </h4>
            <button
              onClick={copyResume}
              style={{
                padding: '6px 16px',
                fontSize: '0.85rem',
                fontWeight: '700',
                background: copied ? 'rgba(17,128,30,0.15)' : 'rgb(202 202 202 / 22%)',
                border: `1px solid ${copied ? 'rgba(17,128,30,0.4)' : 'rgba(100,100,100,0.2)'}`,
                borderRadius: '4px',
                color: copied ? '#1a4a1e' : '#0f100fff',
                cursor: 'pointer',
                boxShadow: '2px 2px 5px rgba(10,10,10,0.15)',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div style={{
            background: 'rgb(220 211 195 / 35%)',
            borderRadius: '10px',
            padding: '1.5rem 2rem',
            boxShadow: 'inset rgba(130,130,130,0.5) 3px 6px 6px 6px, rgba(0,0,0,0.06) 0px 2px 4px 0px',
            whiteSpace: 'pre-line',
            fontSize: '0.95rem',
            lineHeight: '1.7',
            color: 'rgb(0,0,0)',
            fontFamily: 'kcgangster, monospace'
          }}>
            {data.resume}
          </div>
        </div>
      )}

      {!data.resume && (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'rgb(100,80,60)' }}>
          Resume generation failed — please try again.
        </div>
      )}
    </div>
  );
};

export default JobAnalysisDisplay;
