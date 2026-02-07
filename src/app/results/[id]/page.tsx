// src/app/results/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getAnalysis } from '@/lib/db/shareableResults';
import { MessageSquare } from 'lucide-react';
import portfolioConfig from '@/components/chat/portconfig.json';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultsPage({ params }: PageProps) {
  const { id } = await params;
  
  let analysis: any;
  
  // Try short ID first (10 characters = database lookup)
  if (id.length === 10) {
    console.log('🔍 Looking up short ID in database:', id);
    try {
      analysis = await getAnalysis(id);
      if (analysis) {
        console.log('✅ Found analysis in database');
      }
    } catch (error) {
      console.error('❌ Database lookup error:', error);
    }
  }
  
  // Fallback to base64 decoding for long IDs or if database lookup failed
  if (!analysis) {
    console.log('🔍 Attempting base64 decode for ID length:', id.length);
    try {
      const decoded = Buffer.from(id, 'base64url').toString('utf-8');
      analysis = JSON.parse(decoded);
      console.log('✅ Successfully decoded base64 analysis');
    } catch (error) {
      console.error('❌ Error decoding result:', error);
      notFound();
    }
  }
  
  if (!analysis) {
    console.error('❌ No analysis found');
    notFound();
  }

  // Helper functions
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'rgba(32, 32, 31, 1)', border: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' };
    if (score >= 60) return { bg: 'rgb(220, 211, 195)', border: 'rgba(234, 179, 8, 0)', text: '#ffffffff' };
    return { bg: 'rgb(220, 211, 195)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' };
  };

  const getLinksForCategory = (category: string) => {
    if (!category) return null;
    
    const mappings = (portfolioConfig as any).categoryMappings;
    if (!mappings) return null;
    
    // Direct match
    if (mappings[category]) {
      const links = mappings[category].links?.filter((l: any) => l.url && l.url.length > 0);
      return links?.length > 0 ? links : null;
    }
    
    // Fuzzy match
    const categoryLower = category.toLowerCase();
    const matchedKey = Object.keys(mappings).find(key => 
      key.toLowerCase() === categoryLower ||
      key.toLowerCase().includes(categoryLower) ||
      categoryLower.includes(key.toLowerCase())
    );
    
    if (matchedKey) {
      const links = mappings[matchedKey].links?.filter((l: any) => l.url && l.url.length > 0);
      return links?.length > 0 ? links : null;
    }
    
    return null;
  };

  const scoreColors = getScoreColor(analysis.matchScore);
  const keywordCoverage = analysis.atsKeywords 
    ? ((analysis.atsKeywords.critical.length + analysis.atsKeywords.recommended.length) / 
       ((portfolioConfig as any).ATSKeywords?.core?.length || 1 + (portfolioConfig as any).ATSKeywords?.technical?.length || 1)) * 100
    : 0;

  return (
    <div style={{
      background: 'white',
      borderRadius: '10px',
      fontFamily: 'kcgangster',
      width: '75%',
        margin: '75px 0px 0px 160px',

      height: '100%'
    }}>
      {/* Match Score Header */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div className='rounded' style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', background: 'rgb(220 211 195 / 16%)', boxShadow: 'inset rgba(130, 130, 130, 0.5) 2px 2px 16px 3px, rgba(0, 0, 0, 0.06) 0px 2px 4px 0px' }}>
          <div style={{
            width: '85px',
            marginLeft: '20px',
            height: '85px',
            boxShadow: 'rgba(130, 130, 130, 0.5) 20px 13px 5px 0px, rgba(0, 0, 0, 0.06) 0px 2px 4px 0px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: scoreColors.text }}>
              {analysis.matchScore}%
            </div>
            <div style={{ fontSize: '0.7rem', color: '#rgba(255, 255, 255, 1)', textTransform: 'uppercase' }}>
              Match
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <p style={{ margin: '25px 0px 25px 0px', padding: '0px 25px 0px 25px', color: '#rgb(94, 70, 49)', fontSize: '1rem', lineHeight: '1.6' }}>
              {analysis.summary}
            </p>
          </div>
        </div>
      </div>

      {/* ATS Keywords Match Section */}
      <div style={{ padding: '1rem' }}>
        <h3 className="text-xl font-semibold">
          ATS Keywords Match
        </h3>
        {/* Job Description Keywords */}
        {analysis.atsKeywords?.jobKeywords && analysis.atsKeywords.jobKeywords.length > 0 && (
          <div className="mt-2 p-4 rounded-lg border bg-white/90" style={{ padding: '2rem', background: 'rgb(220 211 195 / 16%)', boxShadow: 'inset rgba(130, 130, 130, 0.5) 3px 6px 6px 6px, rgba(0, 0, 0, 0.06) 0px 2px 4px 0px' }}>
            <div className="flex flex-wrap">
              {analysis.atsKeywords.jobKeywords.map((keyword: string, i: number) => {
                // Check if this keyword is also in critical (matched)
                const isMatched = analysis.atsKeywords?.critical?.some(
                  (c: string) => c.toLowerCase() === keyword.toLowerCase()
                );
                
                return (
                  <span
                    key={i}
                    className={`px-1 py-1 m-1 rounded text-m font-medium ${
                      isMatched 
                        ? 'bg-green-100 text-green-800 border border-green-300' 
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  >
                    {keyword}
                    {isMatched && <span className="ml-3">✓</span>}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '1rem' }}>
        {/* Strengths Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '0 0 0rem 0',
            fontSize: '1.5rem',
            fontWeight: '900',
            color: 'rgba(5, 5, 4, 1)',
          }}>
            Strengths
          </h4>
          
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {analysis.strengths?.map((strength: any, idx: number) => {
              const categoryLinks = getLinksForCategory(strength.category);
              
              return (
                <div key={idx} style={{
                  background: 'rgb(220 211 195 / 16%)',
                  borderRadius: '10px',
                  marginTop: '1.4rem',
                  padding: '1rem',
                  boxShadow: 'inset rgba(130, 130, 130, 0.5) 3px 6px 6px 6px, rgba(0, 0, 0, 0.06) 0px 2px 4px 0px',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '.75rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ 
                      fontWeight: '900', 
                      color: '#010101ff',
                      fontSize: '1.2em',
                      flex: 1
                    }}>
                      {strength.match}      
                    </div>
                  </div>
                  
                  <div style={{ 
                    fontSize: '1.1rem', 
                    color: '#382311ff',
                    paddingLeft: '.8rem',
                    borderLeft: '5px solid rgba(17, 128, 30, 0.79)',
                    lineHeight: '1.5'          
                  }}>
                    {strength.evidence}
                  </div>
                  <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Category badge */}
                    <span style={{
                      fontSize: '1.1rem',
                      fontWeight: '800',
                      color: '#271d0eff',
                      letterSpacing: '0.1px',
                      paddingTop: '20px',
                      paddingRight: '10px'
                    }}>
                      {strength.category} links:
                    </span>
                    
                    {/* Portfolio links */}
                    {categoryLinks && categoryLinks.map((link: { name: string; url: string }, linkIdx: number) => (
                      <a 
                        key={linkIdx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '2px 10px 2px 10px',
                          fontSize: '1.1rem',
                          fontWeight: '800',
                          boxShadow: '5px 3px 5px rgba(10, 10, 10, .8)',
                          background: 'rgb(64 52 31 / 22%)',
                          color: '#0f100fff',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                          marginTop: '15px',
                          marginRight: '10px'
                        }}
                      >
                        {link.name}
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gaps Section */}
        {analysis.gaps?.length > 0 && (
          <div style={{ marginTop: '6rem', marginBottom: '6rem' }}>
            <h4 style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 0 .3rem 0',
              fontSize: '1.5rem',
              fontWeight: '900',
              color: 'rgba(6, 5, 5, 1)',
            }}>
              Gaps
            </h4>
            
            <div style={{ display: 'grid', gap: '2.875rem' }}>
              {analysis.gaps.map((gap: any, idx: number) => (
                <div key={idx} style={{
                  background: 'rgb(220 211 195 / 16%)',
                  boxShadow: 'inset rgba(130, 130, 130, 0.5) 3px 6px 6px 6px, rgba(0, 0, 0, 0.06) 0px 2px 4px 0px',
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
                      color: 'rgba(19, 17, 17, 1)',
                      fontSize: '1rem',
                      flex: 1
                    }}>
                      {gap.requirement}
                    </div>
                    <span style={{
                      padding: '0.25rem .75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: 'rgb(220 211 195 / 16%)',
                      color: gap.severity === 'critical' 
                        ? '#ef4444' 
                        : gap.severity === 'moderate'
                        ? '#000000ff'
                        : '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {gap.severity}
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: '1rem', 
                    color: 'rgba(21, 18, 18, 1)',
                    paddingLeft: '1rem',
                    borderLeft: '3px solid rgba(24, 23, 22, 0.3)',
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
        {analysis.culturalFit && (
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
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem' 
            }}>
              {analysis.culturalFit.signals?.length > 0 && (
                <div style={{
                  background: 'rgb(220 211 195 / 16%)',
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
                    color: '#362719ff',
                    fontSize: '0.9rem',
                    lineHeight: '1.6'
                  }}>
                    {analysis.culturalFit.signals.map((signal: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{signal}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.culturalFit.alignment?.length > 0 && (
                <div style={{
                  background: 'rgb(220 211 195 / 16%)',
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
                    {analysis.culturalFit.alignment.map((align: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{align}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ATS Keywords - commented out to match JobAnalysisDisplay.tsx
        {analysis.atsKeywords && (analysis.atsKeywords.critical?.length > 0 || analysis.atsKeywords.recommended?.length > 0) && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#100e0eff'
            }}>
              <div style={{ marginTop: '1rem', paddingLeft: '20px', fontSize: '1.475rem', color: '#070606ff' }}>
                ATS Keyword Coverage: {Math.round(keywordCoverage)}% 
                ({analysis.atsKeywords?.critical?.length || 0} critical + {analysis.atsKeywords?.recommended?.length || 0} recommended)
              </div>
            </h4>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {analysis.atsKeywords.critical?.length > 0 && (
                <div style={{
                  background: 'rgb(220, 211, 195)',
                  border: '.1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '10px',
                  boxShadow: 'inset rgba(130, 130, 130, 0.5) 3px 6px 6px 6px, rgba(0, 0, 0, 0.06) 0px 2px 4px 0px',
                  padding: '1rem 1.25rem'
                }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#191717ff',
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
                    {analysis.atsKeywords.critical.map((keyword: string, idx: number) => (
                      <span key={idx} style={{
                        padding: '0.375rem 0.75rem',
                        background: 'rgba(54, 52, 49, 1)',
                        boxShadow: 'inset rgba(130, 130, 130, 0.5) 3px 6px 6px 6px, rgba(0, 0, 0, 0.06) 0px 2px 4px 0px',
                        borderRadius: '16px',
                        fontSize: '0.85rem',
                        color: '#d0cdcdff'
                      }}>
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.atsKeywords.recommended?.length > 0 && (
                <div style={{
                  background: 'rgb(220, 211, 195)',
                  boxShadow: 'inset rgba(130, 130, 130, 0.5) 3px 6px 6px 6px, rgba(0, 0, 0, 0.06) 0px 2px 4px 0px',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem'
                }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#272424ff',
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
                    {analysis.atsKeywords.recommended.map((keyword: string, idx: number) => (
                      <span key={idx} style={{
                        padding: '0.375rem 0.75rem',
                        background: 'rgba(123, 120, 114, 1)',
                        borderRadius: '6px',
                        boxShadow: 'inset rgba(130, 130, 130, 0.5) 3px 6px 6px 6px, rgba(0, 0, 0, 0.06) 0px 2px 4px 0px',
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
        */}

        {/* Recommendations / Project Links */}
      </div>
    </div>
  );
}