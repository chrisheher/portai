// src/app/results/[id]/page.tsx
interface StrengthItem {
  match: string;
  evidence: string;
}

interface WeaknessItem {
  match: string;
  evidence: string;
}

interface GapItem {
  requirement: string;
  suggestion: string;
}

interface ATSKeywords {
  critical?: string[];
  recommended?: string[];
}

interface Recommendations {
  skillsToHighlight?: string[];
  projectsToFeature?: string[];
}

interface Analysis {
  matchScore: number;
  summary: string;
  strengths: StrengthItem[];
  weaknesses?: WeaknessItem[];
  gaps?: GapItem[];
  atsKeywords?: ATSKeywords;
  recommendations?: Recommendations;
}

export default async function ResultsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const decoded = Buffer.from(id, 'base64url').toString();
  const analysis: Analysis = JSON.parse(decoded);
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <a 
          href="https://onlychr.is" 
          className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to onlychr.is
        </a>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Job Analysis Results</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Match Score</h2>
          <div className="text-4xl font-bold text-blue-600">
            {analysis.matchScore}%
          </div>
        </div>
        <p className="text-gray-700">{analysis.summary}</p>
      </div>

      {(analysis.strengths?.length ?? 0) > 0 && (
        <div className="bg-green-50 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Strengths</h2>
          <ul className="space-y-3">
            {analysis.strengths?.map((strength: StrengthItem, idx: number) => (
              <li key={idx} className="border-l-4 border-green-500 pl-4">
                <div className="font-medium">{strength.match}</div>
                <div className="text-sm text-gray-600">{strength.evidence}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(analysis.gaps?.length ?? 0) > 0 && (
        <div className="bg-yellow-50 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Gaps</h2>
          <ul className="space-y-3">
            {analysis.gaps?.map((gap: GapItem, idx: number) => (
              <li key={idx} className="border-l-4 border-yellow-500 pl-4">
                <div className="font-medium">{gap.requirement}</div>
                <div className="text-sm text-gray-600">{gap.suggestion}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.atsKeywords && (
        <div className="bg-blue-50 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">ATS Keywords</h2>
          <div className="mb-3">
            <h3 className="font-medium mb-2">Critical:</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.atsKeywords.critical?.map((kw: string, idx: number) => (
                <span key={idx} className="bg-blue-200 px-3 py-1 rounded-full text-sm">
                  {kw}
                </span>
              ))}
            </div>
          </div>
          {(analysis.atsKeywords.recommended?.length ?? 0) > 0 && (
            <div>
              <h3 className="font-medium mb-2">Recommended:</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.atsKeywords.recommended?.map((kw: string, idx: number) => (
                  <span key={idx} className="bg-blue-100 px-3 py-1 rounded-full text-sm">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {analysis.recommendations && (
        <div className="bg-purple-50 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
          
          {(analysis.recommendations.skillsToHighlight?.length ?? 0) > 0 && (
            <div className="mb-3">
              <h3 className="font-medium mb-2">Skills to Highlight:</h3>
              <ul className="list-disc list-inside text-gray-700">
                {analysis.recommendations.skillsToHighlight?.map((skill: string, idx: number) => (
                  <li key={idx}>{skill}</li>
                ))}
              </ul>
            </div>
          )}

          {(analysis.recommendations.projectsToFeature?.length ?? 0) > 0 && (
            <div className="mb-3">
              <h3 className="font-medium mb-2">Projects to Feature:</h3>
              <ul className="list-disc list-inside text-gray-700">
                {analysis.recommendations.projectsToFeature?.map((project: string, idx: number) => (
                  <li key={idx}>{project}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}