// src/components/chat/JobAnalysisDisplay.tsx
import React from 'react';
import { ArrowRight, AlertCircle, TrendingUp, Target, AlertTriangle, Lightbulb, Sparkles, MessageSquare, FileText, Award } from 'lucide-react';
import portfolioConfig from './portconfig.json';  // ADD THIS LINE

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
    if (score >= 60) return { bg: 'rgba(234, 179, 8, 0)', border: 'rgba(234, 179, 8, 0)', text: '#ffffffff' };
    return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' };
  };

  const getPriorityColor = (priority?: string) => {
    if (priority === 'high') return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' };
    if (priority === 'medium') return { bg: 'rgba(234, 179, 8, 0.1)', text: '#edededff' };
    return { bg: 'rgba(148, 163, 184, 0.1)', text: '#ffffffff' };
  };

  const scoreColors = getScoreColor(data.matchScore);
  const priorityColors = getPriorityColor(data.recommendations.applicationPriority);
 const keywordCoverage = data.atsKeywords 
  ? ((data.atsKeywords.critical.length + data.atsKeywords.recommended.length) / 
     (portfolioConfig.ATSKeywords.core.length + portfolioConfig.ATSKeywords.technical.length)) * 100
  : 0;

// Then display it:


  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.27)',
      borderRadius: '16px',
      border: '1px solid rgba(192, 178, 178, 0.1)',
      overflow: 'hidden',
      marginTop: '.1rem'
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
            width: '95px',
            height: '95px',
            borderRadius: '50%',
            background: 'rgba(9, 7, 23, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: scoreColors.text }}>
              {data.matchScore}%
            </div>
            <div style={{ fontSize: '0.7rem', color: '#ffffffff', textTransform: 'uppercase' }}>
              Match
            </div>
          </div>
         
          
          {/* Summary */}
          <div style={{ flex: 1, minWidth: '250px' }}>
       
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
        
            Strongest fits 
          </h4>
          
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {data.strengths.map((strength, idx) => (
              <div key={idx} style={{
                background: 'rgba(9, 7, 23, 0.25)',
                border: '1px solid rgba(190, 190, 190, 0)',
                borderRadius: '10px',
                padding: '1rem',
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
                 <div style={{ 
  display: 'flex',
  alignItems: 'center',  // or 'baseline' or 'flex-end'
  gap: '0.05rem'  // space between them
}}>
  <div style={{ 
    fontSize: '0.55rem',
    color: '#86efac',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    fontWeight: '600'
  }}>
 
  </div>
  <div style={{ 
    fontWeight: '600', 
    color: '#f1f5f9',
    fontSize: '1rem',
    flex: 1
  }}>
    {strength.match}
  </div>
</div>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '16px',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    background: strength.confidence === 'high' 
                      ? 'rgba(34, 197, 94, 0.2)' 
                      : strength.confidence === 'medium'
                      ? 'rgba(234, 179, 8, 0.01)'
                      : 'rgba(148, 163, 184, 0.2)',
                    color: strength.confidence === 'high' 
                      ? '#22c55e' 
                      : strength.confidence === 'medium'
                      ? '#eab308'
                      : '#94a3b8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                  {strength.category}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '.9rem', 
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
                      color: 'rgba(255, 255, 255, 1)',
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
                        : 'rgba(255, 255, 255, 0.2)',
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
                    color: 'rgba(255, 255, 255, 1',
                    paddingLeft: '1rem',
                    borderLeft: '3px solid rgba(245, 158, 11, 0.3)',
                    lineHeight: '1.5',
                    marginBottom: gap.transferable ? '0.75rem' : 0
                  }}>
                     {gap.suggestion}
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
    
    {/* Changed from 'grid' to horizontal layout */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1rem' 
    }}>
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
            You want
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
            I've got
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

   
    
  
      
    </div>
  </div>
)}

        {/* Implicit Requirements - Reading Between the Lines */}
    
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
             
           <div style={{ marginTop: '1rem', fontSize: '1.475rem', color: '#ffffffff' }}>
  ATS Keyword Coverage: {Math.round(keywordCoverage)}% 
  ({data.atsKeywords?.critical.length || 0} critical + {data.atsKeywords?.recommended.length || 0} recommended)
</div>
            </h4>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {data.atsKeywords.critical.length > 0 && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.01)',
                  border: '.1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem'
                }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#fbfbfbff',
                    marginBottom: '0.625rem',
                    fontSize: '1.475rem'
                  }}>
                Hard skills
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {data.atsKeywords.critical.map((keyword, idx) => (
                      <span key={idx} style={{
                        padding: '0.375rem 0.75rem',
                        background: 'rgba(211, 189, 189, 0.15)',
                        border: '1px solid rgba(223, 192, 192, 0.3)',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: '#d0cdcdff',
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
                  background: 'rgba(228, 228, 237, 0.05)',
                  border: '.5px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem'
                }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#cfcfcfff',
                    marginBottom: '0.625rem',
                    fontSize: '1.475rem'
                  }}>
                  Soft skills
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {data.atsKeywords.recommended.map((keyword, idx) => (
                      <span key={idx} style={{
                        padding: '0.375rem 0.75rem',
                        background: 'rgba(195, 196, 236, 0.15)',
                        border: '1px solid rgba(214, 215, 234, 0.3)',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: '#d9dceaff',
                        fontFamily: 'monospace'
                      }}>
                        {keyword}
                      </span>
                    ))}
                  </div>
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
        Projects and accomplishments
          </h4>
          
          <div style={{ display: 'grid', gap: '1.25rem' }}>
          
            
 
            
            {/* Projects to Feature */}
            <div>
              <div style={{ 
                fontWeight: '600', 
                color: '#f1f5f9',
                marginBottom: '0.625rem',
                fontSize: '0.95rem'
              }}>
            
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