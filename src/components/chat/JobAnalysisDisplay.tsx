'use client';
import React from 'react';

interface ResumeEntry {
  competency: string;
  title: string;
  blurb: string;
  url?: string;
}

interface FitSection {
  jobTitle: string;
  company: string;
  competencies: string[];
  projects: ResumeEntry[];
}

interface ExperienceRole {
  title: string;
  company: string;
  duration: string;
  industryLabel?: string;
  industry?: string;
  outputs?: string[];
  projects: ResumeEntry[];
}

interface JobAnalysisProps {
  data: {
    matchScore: number;
    verdict?: string;
    topCompetencies?: string[];
    jobSkills?: string[];
    fit?: FitSection;
    experience?: ExperienceRole[];
    unattributed?: ResumeEntry[];
  };
}

const sectionHeading: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: '400',
  color: 'rgb(30,20,10)',
  borderBottom: '1px solid rgba(0,0,0,0.6)',
  margin: '0 0 0.6rem',
  paddingBottom: '0.1rem',
};

// "A, B, and C"
const joinList = (items: string[]) =>
  items.length <= 2 ? items.join(' and ') : `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;

// One "Competency | blurb" line, as on the resume.
const Entry: React.FC<{ entry: ResumeEntry }> = ({ entry }) => (
  <p style={{ margin: '0 0 0.6rem 1rem', fontSize: '0.85rem', lineHeight: '1.5', color: 'rgb(40,28,12)' }}>
    <strong>{entry.competency} |</strong> {entry.blurb || entry.title}
    {entry.url && (
      <>
        {' '}
        <a href={entry.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.45)', whiteSpace: 'nowrap' }}>
          View →
        </a>
      </>
    )}
  </p>
);

export const JobAnalysisDisplay: React.FC<JobAnalysisProps> = ({ data }) => {
  const scoreColor = data.matchScore >= 80 ? '#22c55e' : data.matchScore >= 62 ? '#eab308' : '#ef4444';

  return (
    <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', padding: '1rem' }}>

      {/* Score */}
      <div className="rounded" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        background: 'rgb(220 211 195 / 35%)',
        boxShadow: 'inset rgba(130,130,130,0.5) 2px 2px 16px 3px, rgba(0,0,0,0.06) 0px 2px 4px 0px',
        padding: '1rem',
        marginBottom: (data.fit || data.topCompetencies?.length || data.jobSkills?.length) ? '1rem' : 0,
      }}>
        <div style={{
          width: '85px', height: '85px', marginLeft: '8px', flexShrink: 0,
          boxShadow: 'rgba(130,130,130,0.5) 20px 13px 5px 0px',
          borderRadius: '50%', background: 'rgba(255,255,255,1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: scoreColor }}>
            {data.matchScore}%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600' }}>
            Match
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '160px' }}>
          {data.topCompetencies && data.topCompetencies.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {data.topCompetencies.map((c, i) => (
                <span key={i} style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.6rem',
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(130,100,60,0.2)',
                  borderRadius: '999px',
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  color: 'rgb(80,55,20)',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                }}>
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(0,0,0,0.45)', lineHeight: '1.5' }}>
              Relevant work from the portfolio
            </p>
          )}
        </div>
      </div>

      {/* Top terms from the job description itself, not matched against the portfolio */}
      {data.jobSkills && data.jobSkills.length > 0 && (
        <div style={{ marginBottom: data.fit ? '1.5rem' : 0 }}>
          <div style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '600', marginBottom: '0.5rem' }}>
            Top Terms From This Job
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {data.jobSkills.map((term, i) => (
              <span key={i} style={{
                display: 'inline-block',
                padding: '0.25rem 0.6rem',
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: '500',
                color: 'rgba(0,0,0,0.65)',
              }}>
                {term}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Fit: the role's 3 core competencies, one project each */}
      {data.fit && data.fit.projects.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={sectionHeading}>fit</h3>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', lineHeight: '1.5', color: 'rgb(40,28,12)' }}>
            These projects align best with the core responsibilities of{' '}
            {data.fit.company ? `${data.fit.company}'s ` : 'this '}
            {data.fit.jobTitle || 'role'}{data.fit.jobTitle ? ' position' : ''}:{' '}
            <strong>{joinList(data.fit.competencies)}.</strong>
          </p>
          {data.fit.projects.map((entry, i) => <Entry key={i} entry={entry} />)}
        </div>
      )}

      {/* Experience: each resume role with 2–3 of its own projects */}
      {data.experience && data.experience.length > 0 && (
        <div>
          <h3 style={sectionHeading}>experience</h3>
          {data.experience.map((role, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}>
                <span style={{ fontSize: '1.15rem', color: 'rgb(30,20,10)' }}>
                  {role.title.toLowerCase()}{role.company !== 'Independent' ? `, ${role.company}` : ''}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.55)', flexShrink: 0 }}>{role.duration}</span>
              </div>
              {role.industry && (
                <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'rgba(0,0,0,0.65)' }}>
                  <strong>{role.industryLabel || 'industry'} |</strong> {role.industry}
                </div>
              )}
              {role.outputs && role.outputs.length > 0 && (
                <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'rgba(0,0,0,0.65)', marginBottom: '0.5rem' }}>
                  <strong>outputs |</strong> {role.outputs.join(', ')}
                </div>
              )}
              {role.projects.map((entry, j) => <Entry key={j} entry={entry} />)}
            </div>
          ))}
        </div>
      )}

      {/* Relevant projects that aren't tied to a role in the experience section */}
      {data.unattributed && data.unattributed.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          <h3 style={sectionHeading}>unattributed but still relevant</h3>
          {data.unattributed.map((entry, i) => <Entry key={i} entry={entry} />)}
        </div>
      )}
    </div>
  );
};

export default JobAnalysisDisplay;
