// src/app/results/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getAnalysis } from '@/lib/db/shareableResults';
import portfolioConfig from '@/app/api/chat/tools/portfolio-config-slim.json';


interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultsPage({ params }: PageProps) {
  const { id } = await params;
  
  let analysis;
  
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
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Job Analysis Results</h1>
        <p className="text-sm text-gray-500 mt-1">
          {id.length === 10 ? '📊 Database Result' : '🔗 Shared Link'}
        </p>
      </div>
      
      <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
        {/* Match Score */}
        <div className="border-b pb-4">
          <div className="text-6xl font-bold text-blue-600 mb-2">
            {analysis.matchScore}%
          </div>
          <p className="text-gray-600 text-lg">Match Score</p>
        </div>
        
        {/* Summary */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Summary</h2>
          <p className="text-gray-700">{analysis.summary}</p>
        </div>
        
        {/* Standout Qualities */}
        {analysis.standoutQualities?.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Standout Qualities</h2>
            <div className="flex flex-wrap gap-2">
              {analysis.standoutQualities.map((quality: string, i: number) => (
                <span 
                  key={i} 
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {quality}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Strengths */}
        {analysis.strengths?.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Strengths</h2>
            <ul className="space-y-3">
              {analysis.strengths.map((strength: any, i: number) => (
                <li key={i} className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-green-700">{strength.match}</div>
                      <div className="text-gray-600 text-sm mt-1">{strength.evidence}</div>
                    </div>
                    <span className={`ml-4 px-2 py-1 text-xs rounded-full ${
                      strength.confidence === 'high' 
                        ? 'bg-green-100 text-green-800' 
                        : strength.confidence === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {strength.confidence}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Gaps */}
        {analysis.gaps?.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Areas to Address</h2>
            <ul className="space-y-3">
              {analysis.gaps.map((gap: any, i: number) => (
                <li key={i} className={`border-l-4 pl-4 py-2 ${
                  gap.severity === 'critical' 
                    ? 'border-red-500' 
                    : gap.severity === 'moderate'
                    ? 'border-yellow-500'
                    : 'border-blue-500'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className={`font-semibold ${
                        gap.severity === 'critical' 
                          ? 'text-red-700' 
                          : gap.severity === 'moderate'
                          ? 'text-yellow-700'
                          : 'text-blue-700'
                      }`}>
                        {gap.requirement}
                      </div>
                      <div className="text-gray-600 text-sm mt-1">{gap.suggestion}</div>
                    </div>
                    <span className={`ml-4 px-2 py-1 text-xs rounded-full ${
                      gap.severity === 'critical' 
                        ? 'bg-red-100 text-red-800' 
                        : gap.severity === 'moderate'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {gap.severity}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ATS Keywords */}
        {analysis.atsKeywords && (
          <div>
            <h2 className="text-xl font-semibold mb-3">ATS Keywords</h2>
            <div className="space-y-3">
              {analysis.atsKeywords.critical?.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Critical Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.atsKeywords.critical.map((keyword: string, i: number) => (
                      <span 
                        key={i} 
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {analysis.atsKeywords.recommended?.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Recommended Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.atsKeywords.recommended.map((keyword: string, i: number) => (
                      <span 
                        key={i} 
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
                      >
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
{analysis.recommendations.projectsToFeature?.length > 0 && (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3 className="font-medium text-gray-700 mb-2">Projects to Feature</h3>
    <ul className="space-y-2">
      {analysis.recommendations.projectsToFeature.map((project: any, i: number) => {
        // Handle both old string format and new object format
        const projectName = typeof project === 'string' ? project : project.name;
        const projectLinks = typeof project === 'object' ? project.links : null;
        
        return (
          <li key={i} className="text-sm text-gray-600">
            <div className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <div>
                <span>{projectName}</span>
                {projectLinks && projectLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {projectLinks.map((link: any, j: number) => (
                      <a
                        key={j}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                      >
                        {link.name} ↗
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  </div>
)}
    {/* Footer */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>This analysis was generated by an AI job matching system</p>
      </div>
    </div>
  </div>
  );
}