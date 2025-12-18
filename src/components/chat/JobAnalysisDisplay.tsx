// src/components/JobAnalysisDisplay.tsx
import React from 'react';
import { ArrowRight, AlertCircle, TrendingUp, Target, AlertTriangle, Lightbulb, Sparkles, MessageSquare, FileText, Award } from 'lucide-react';

interface JobAnalysisProps {
  data: {
    matchScore: number;
    strengths: Array<{
      category: string;
      match: string;
      evidence: string;
      confidence: 'high' | 'medium' | 'low';
    }>;
    gaps: Array<{
      requirement: string;
      severity: 'critical' | 'moderate' | 'minor';
      suggestion: string;
      transferable?: string;
    }>;
    standoutQualities: string[];
    culturalFit?: {
      signals: string[];
      alignment: string[];
      concerns: string[];
    };
    implicitRequirements?: Array<{
      signal: string;
      interpretation: string;
      candidateAlignment: string;
    }>;
    atsKeywords?: {
      critical: string[];
      recommended: string[];
      phrasingsToUse: string[];
    };
    recommendations: {
      coverLetterFocus: string[];
      skillsToHighlight: string[];
      projectsToFeature: string[];
      narrativeStrategy?: string;
      applicationPriority?: 'high' | 'medium' | 'low';
    };
    redFlags?: string[];
    summary: string;
    fetchedContent?: string;
  };
}

export const JobAnalysisDisplay: React.FC<JobAnalysisProps> = ({ data }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' };
    if (score >= 60) return { bg: 'rgba(234, 179, 8, 0.1)', border: 'rgba(234, 179, 8, 0.3)', text: '#eab308' };
    return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' };
  };

  const getPriorityColor = (priority?: string) => {
    if (priority === 'high') return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' };
    if (priority === 'medium') return { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308' };
    return { bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8' };
  };

  const scoreColors = getScoreColor(data.matchScore);
  const priorityColors = getPriorityColor(data.recommendations.applicationPriority);

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
      marginTop: '1rem'
    }}>
      {/* Match Score Header */}
      <div style={{
        background: `linear-gradient(135deg, ${scoreColors.bg} 0%, transparent 100%)`,
        padding: '2rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Circular Progress */}
          <div style={{
            width: '85px',
            height: '85px',
            borderRadius: '50%',
            background: '#0a0a0f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: scoreColors.text }}>
              {data.matchScore}%
            </div>
            <div style={{ fontSize: '0.7rem', color: '#8b8b8bff', textTransform: 'uppercase' }}>
              Match
            </div>
          </div>
          
          {/* Summary */}
          <div style={{ flex: 1, minWidth: '250px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '1.5rem', 
                fontWeight: '700',
                color: '#f1f5f9'
              }}>
                Job Match Analysis
              </h3>
              {data.recommendations.applicationPriority && (
                <span style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  background: priorityColors.bg,
                  color: priorityColors.text,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {data.recommendations.applicationPriority} priority
                </span>
              )}
            </div>
            <p style={{ 
              margin: 0, 
              color: '#fdfdfdff',
              fontSize: '1rem',
              lineHeight: '1.6'
            }}>
              {data.summary}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: '2rem' }}>
        {/* Narrative Strategy - appears first if present */}
        {data.recommendations.narrativeStrategy && (
          <div style={{
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h4 style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 0 0.875rem 0',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#c4b5fd'
            }}>
              <Sparkles size={20} />
              Strategic narrative
            </h4>
            <p style={{
              margin: 0,
              color: '#e9d5ff',
              fontSize: '1rem',
              lineHeight: '1.6',
              fontStyle: 'italic'
            }}>
              {data.recommendations.narrativeStrategy}
            </p>
          </div>
        )}

        {/* Red Flags - prominent if present */}
        {data.redFlags && data.redFlags.length > 0 && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h4 style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#fca5a5'
            }}>
              <AlertTriangle size={20} />
              Red flags to consider
            </h4>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {data.redFlags.map((flag, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  gap: '0.75rem',
                  color: '#fecaca',
                  fontSize: '0.95rem',
                  lineHeight: '1.5'
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '0 0 1rem 0',
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#dbdbdbff'
          }}>
            <TrendingUp size={20} />
            Strongest fits 
          </h4>
          
          <div style={{ display: 'grid', gap: '0.875rem' }}>
            {data.strengths.map((strength, idx) => (
              <div key={idx} style={{
                background: 'rgba(34, 197, 94, 0.05)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '12px',
                padding: '1.25rem',
                transition: 'all 0.2s ease'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <div>
                    <div style={{ 
                      fontSize: '0.75rem',
                      color: '#86efac',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '0.375rem',
                      fontWeight: '600'
                    }}>
                      {strength.category}
                    </div>
                    <div style={{ 
                      fontWeight: '600', 
                      color: '#f1f5f9',
                      fontSize: '1rem',
                      flex: 1
                    }}>
                      You're looking for {strength.match.charAt(0).toLowerCase() + strength.match.slice(1)}
                    </div>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: strength.confidence === 'high' 
                      ? 'rgba(34, 197, 94, 0.2)' 
                      : strength.confidence === 'medium'
                      ? 'rgba(234, 179, 8, 0.2)'
                      : 'rgba(148, 163, 184, 0.2)',
                    color: strength.confidence === 'high' 
                      ? '#22c55e' 
                      : strength.confidence === 'medium'
                      ? '#eab308'
                      : '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {strength.confidence}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '1rem', 
                  color: '#d2d8e0ff',
                  paddingLeft: '0rem',
                  lineHeight: '1.5'
                }}>
                  I have {strength.evidence.charAt(0).toLowerCase() + strength.evidence.slice(1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Standout Qualities */}
        {data.standoutQualities.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#fdfdfdff'
            }}>
              <Award size={20} />
              Standout qualities
            </h4>
            
            <div style={{ display: 'grid', gap: '0.625rem' }}>
              {data.standoutQualities.map((quality, idx) => (
                <div key={idx} style={{
                  background: 'rgba(139, 92, 246, 0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                  color: '#cbd5e1',
                  fontSize: '0.95rem',
                  lineHeight: '1.5'
                }}>
                  ✨ {quality}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gaps Section */}
        {data.gaps.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#f59e0b'
            }}>
              <AlertCircle size={20} />
              Fuzzy on
            </h4>
            
            <div style={{ display: 'grid', gap: '0.875rem' }}>
              {data.gaps.map((gap, idx) => (
                <div key={idx} style={{
                  background: 'rgba(245, 158, 11, 0.05)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '12px',
                  padding: '1.25rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ 
                      fontWeight: '600', 
                      color: '#f1f5f9',
                      fontSize: '1rem',
                      flex: 1
                    }}>
                      {gap.requirement}
                    </div>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: gap.severity === 'critical' 
                        ? 'rgba(239, 68, 68, 0.2)' 
                        : gap.severity === 'moderate'
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(148, 163, 184, 0.2)',
                      color: gap.severity === 'critical' 
                        ? '#ef4444' 
                        : gap.severity === 'moderate'
                        ? '#f59e0b'
                        : '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {gap.severity}
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#cbd5e1',
                    paddingLeft: '1rem',
                    borderLeft: '3px solid rgba(245, 158, 11, 0.3)',
                    lineHeight: '1.5',
                    marginBottom: gap.transferable ? '0.75rem' : 0
                  }}>
                    Chris should → {gap.suggestion}
                  </div>
                  {gap.transferable && (
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#94a3b8',
                      paddingLeft: '1rem',
                      borderLeft: '3px solid rgba(34, 197, 94, 0.3)',
                      lineHeight: '1.5',
                      fontStyle: 'italic'
                    }}>
                      💡 Transferable: {gap.transferable}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cultural Fit Analysis */}
        {data.culturalFit && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#dbdbdbff'
            }}>
              <MessageSquare size={20} />
              Cultural fit signals
            </h4>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {/* Signals from posting */}
              {data.culturalFit.signals.length > 0 && (
                <div style={{
                  background: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem'
                }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#c7d2fe',
                    marginBottom: '0.625rem',
                    fontSize: '0.875rem'
                  }}>
                    What they're signaling
                  </div>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '1.5rem',
                    color: '#cbd5e1',
                    fontSize: '0.9rem',
                    lineHeight: '1.6'
                  }}>
                    {data.culturalFit.signals.map((signal, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{signal}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alignment */}
              {data.culturalFit.alignment.length > 0 && (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.05)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem'
                }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#86efac',
                    marginBottom: '0.625rem',
                    fontSize: '0.875rem'
                  }}>
                    How Chris aligns
                  </div>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '1.5rem',
                    color: '#cbd5e1',
                    fontSize: '0.9rem',
                    lineHeight: '1.6'
                  }}>
                    {data.culturalFit.alignment.map((align, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{align}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Concerns */}
              {data.culturalFit.concerns.length > 0 && (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.05)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem'
                }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#fcd34d',
                    marginBottom: '0.625rem',
                    fontSize: '0.875rem'
                  }}>
                    Potential friction points
                  </div>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '1.5rem',
                    color: '#cbd5e1',
                    fontSize: '0.9rem',
                    lineHeight: '1.6'
                  }}>
                    {data.culturalFit.concerns.map((concern, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{concern}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Implicit Requirements - Reading Between the Lines */}
        {data.implicitRequirements && data.implicitRequirements.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#dbdbdbff'
            }}>
              <Lightbulb size={20} />
              Reading between the lines
            </h4>
            
            <div style={{ display: 'grid', gap: '0.875rem' }}>
              {data.implicitRequirements.map((req, idx) => (
                <div key={idx} style={{
                  background: 'rgba(168, 85, 247, 0.05)',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  borderRadius: '12px',
                  padding: '1.25rem'
                }}>
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#d8b4fe',
                    marginBottom: '0.5rem',
                    fontStyle: 'italic'
                  }}>
                    They say: "{req.signal}"
                  </div>
                  <div style={{
                    fontSize: '0.95rem',
                    color: '#e9d5ff',
                    marginBottom: '0.75rem',
                    fontWeight: '500'
                  }}>
                    → They mean: {req.interpretation}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#cbd5e1',
                    paddingLeft: '1rem',
                    borderLeft: '3px solid rgba(168, 85, 247, 0.3)',
                    lineHeight: '1.5'
                  }}>
                    Chris's fit: {req.candidateAlignment}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ATS Keywords */}
        {data.atsKeywords && (data.atsKeywords.critical.length > 0 || data.atsKeywords.recommended.length > 0) && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#dbdbdbff'
            }}>
              <FileText size={20} />
              ATS optimization keywords
            </h4>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {data.atsKeywords.critical.length > 0 && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem'
                }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#fca5a5',
                    marginBottom: '0.625rem',
                    fontSize: '0.875rem'
                  }}>
                    Critical (must include)
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {data.atsKeywords.critical.map((keyword, idx) => (
                      <span key={idx} style={{
                        padding: '0.375rem 0.75rem',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: '#fecaca',
                        fontFamily: 'monospace'
                      }}>
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.atsKeywords.recommended.length > 0 && (
                <div style={{
                  background: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem'
                }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#c7d2fe',
                    marginBottom: '0.625rem',
                    fontSize: '0.875rem'
                  }}>
                    Recommended (helpful boost)
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {data.atsKeywords.recommended.map((keyword, idx) => (
                      <span key={idx} style={{
                        padding: '0.375rem 0.75rem',
                        background: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: '#c7d2fe',
                        fontFamily: 'monospace'
                      }}>
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.atsKeywords.phrasingsToUse.length > 0 && (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.05)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem'
                }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#86efac',
                    marginBottom: '0.625rem',
                    fontSize: '0.875rem'
                  }}>
                    Exact phrasings to mirror
                  </div>
                  <ul style={{ 
                    margin: 0, 
                    paddingLeft: '1.5rem',
                    color: '#cbd5e1',
                    fontSize: '0.85rem',
                    lineHeight: '1.6'
                  }}>
                    {data.atsKeywords.phrasingsToUse.map((phrase, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem', fontFamily: 'monospace' }}>{phrase}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.05)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h4 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '0 0 1.25rem 0',
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#f6f6f6ff'
          }}>
            <Target size={20} />
            Let's talk alignment
          </h4>
          
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {/* Cover Letter Focus */}
            <div>
              <div style={{ 
                fontWeight: '600', 
                color: '#f1f5f9',
                marginBottom: '0.625rem',
                fontSize: '0.95rem'
              }}>
                What's his deal?
              </div>
              <ul style={{ 
                margin: 0, 
                paddingLeft: '1.5rem',
                color: '#cbd5e1',
                fontSize: '0.9rem',
                lineHeight: '1.6'
              }}>
                {data.recommendations.coverLetterFocus.map((point, idx) => (
                  <li key={idx} style={{ marginBottom: '0.375rem' }}>{point}</li>
                ))}
              </ul>
            </div>
            
            {/* Skills to Highlight */}
            {data.recommendations.skillsToHighlight && data.recommendations.skillsToHighlight.length > 0 && (
              <div>
                <div style={{ 
                  fontWeight: '600', 
                  color: '#f1f5f9',
                  marginBottom: '0.625rem',
                  fontSize: '0.95rem'
                }}>
                  Lead with these skills
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  {data.recommendations.skillsToHighlight.map((skill, idx) => (
                    <span key={idx} style={{
                      padding: '0.5rem 0.875rem',
                      background: 'rgba(99, 102, 241, 0.15)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      color: '#c7d2fe'
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Projects to Feature */}
            <div>
              <div style={{ 
                fontWeight: '600', 
                color: '#f1f5f9',
                marginBottom: '0.625rem',
                fontSize: '0.95rem'
              }}>
                Ask about
              </div>
              <ul style={{ 
                margin: 0, 
                paddingLeft: '1.5rem',
                color: '#cbd5e1',
                fontSize: '0.9rem',
                lineHeight: '1.6'
              }}>
                {data.recommendations.projectsToFeature.map((project, idx) => (
                  <li key={idx} style={{ marginBottom: '0.375rem' }}>{project}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobAnalysisDisplay;