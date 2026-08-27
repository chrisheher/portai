'use client';
import React from 'react';

interface PortfolioLink {
  name: string;
  url: string;
  category: string;
}

interface JobAnalysisProps {
  data: {
    matchScore: number;
    verdict: 'APPLY' | 'CONSIDER' | 'SKIP';
    keyStrength?: string;
    dealBreaker?: string;
    jobSkills?: string[];
    portfolioLinks?: PortfolioLink[];
  };
}

const VERDICT_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  APPLY:   { bg: 'rgba(34,197,94,0.12)',  color: '#166534', label: 'Apply' },
  CONSIDER:{ bg: 'rgba(234,179,8,0.12)',  color: '#854d0e', label: 'Consider' },
  SKIP:    { bg: 'rgba(239,68,68,0.12)',  color: '#991b1b', label: 'Skip' },
};

export const JobAnalysisDisplay: React.FC<JobAnalysisProps> = ({ data }) => {
  const scoreColor = data.matchScore >= 80 ? '#22c55e' : data.matchScore >= 62 ? '#eab308' : '#ef4444';
  const verdict = data.verdict || 'CONSIDER';
  const vs = VERDICT_STYLES[verdict] ?? VERDICT_STYLES.CONSIDER;

  return (
    <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden' }}>

      {/* Score + verdict */}
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
          {/* Score circle */}
          <div style={{
            width: '85px', height: '85px', marginLeft: '8px', flexShrink: 0,
            boxShadow: 'rgba(130,130,130,0.5) 20px 13px 5px 0px, rgba(0,0,0,0.06) 0px 2px 4px 0px',
            borderRadius: '50%', background: 'rgba(255,255,255,1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: scoreColor }}>
              {data.matchScore}%
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
              Match
            </div>
          </div>

          {/* Verdict + summary */}
          <div style={{ flex: 1, minWidth: '200px', padding: '0 1rem' }}>
            <span style={{
              display: 'inline-block', marginBottom: '0.5rem',
              padding: '0.2rem 0.75rem', borderRadius: '4px',
              background: vs.bg, color: vs.color,
              fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase'
            }}>
              {vs.label}
            </span>

            {data.keyStrength && (
              <p style={{ margin: '0 0 0.35rem', color: 'rgb(30,70,30)', fontSize: '0.9rem', lineHeight: '1.5', fontWeight: '500' }}>
                <span style={{ fontWeight: '700' }}>Strong: </span>{data.keyStrength}
              </p>
            )}
            {data.dealBreaker && data.dealBreaker !== 'None identified' && (
              <p style={{ margin: 0, color: 'rgb(90,40,20)', fontSize: '0.9rem', lineHeight: '1.5', fontWeight: '500' }}>
                <span style={{ fontWeight: '700' }}>Watch: </span>{data.dealBreaker}
              </p>
            )}
            {(!data.dealBreaker || data.dealBreaker === 'None identified') && (
              <p style={{ margin: 0, color: 'rgba(0,0,0,0.4)', fontSize: '0.85rem' }}>No deal-breakers identified</p>
            )}
          </div>
        </div>
      </div>

      {/* Skills from JD */}
      {data.jobSkills && data.jobSkills.length > 0 && (
        <div style={{ padding: '1rem 1.5rem 0' }}>
          <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', fontWeight: '700', color: 'rgba(5,5,4,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Skills in this JD
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {data.jobSkills.map((skill, i) => (
              <span key={i} style={{
                padding: '0.3rem 0.75rem',
                background: 'rgb(220 211 195 / 50%)',
                boxShadow: 'inset rgba(130,130,130,0.4) 1px 2px 6px 1px',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'rgb(50,35,15)'
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Relevant portfolio work */}
      {data.portfolioLinks && data.portfolioLinks.length > 0 && (
        <div style={{ padding: '1rem 1.5rem 1.5rem' }}>
          <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', fontWeight: '700', color: 'rgba(5,5,4,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Relevant work
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {data.portfolioLinks.map((link, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.35)', minWidth: '120px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {link.category}
                </span>
                <a
                  href={link.url}
                  target={link.url.startsWith('http') ? '_blank' : '_self'}
                  rel="noreferrer"
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'rgb(50,35,15)',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    textDecorationColor: 'rgba(50,35,15,0.3)',
                  }}
                >
                  {link.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobAnalysisDisplay;
