// src/components/JobAnalysisDisplay.tsx
import React from 'react';

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
    }>;
    standoutQualities: string[];
    recommendations: {
      coverLetterFocus: string[];
      skillsToHighlight: string[];
      projectsToFeature: string[];
    };
    summary: string;
    fetchedContent?: string;
  };
}

export const JobAnalysisDisplay: React.FC<JobAnalysisProps> = ({ data }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 border-green-200 bg-green-50';
    if (score >= 60) return 'text-yellow-600 border-yellow-200 bg-yellow-50';
    return 'text-red-600 border-red-200 bg-red-50';
  };

  const scoreClasses = getScoreColor(data.matchScore);

  return (
    <div className="mt-4 rounded-lg border bg-card shadow-lg overflow-hidden">
      {/* Match Score Header */}
      <div className={`p-6 border-b ${scoreClasses}`}>
        <div className="flex items-center gap-6 flex-wrap">
          {/* Circular Progress */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted-foreground opacity-20"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className={data.matchScore >= 80 ? 'text-green-600' : data.matchScore >= 60 ? 'text-yellow-600' : 'text-red-600'}
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - data.matchScore / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <div className="text-2xl font-bold">{data.matchScore}%</div>
              <div className="text-xs text-muted-foreground uppercase">Match</div>
            </div>
          </div>
          
          {/* Summary */}
          <div className="flex-1 min-w-[250px]">
            <h3 className="text-xl font-bold mb-2">Job Match Analysis</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.summary}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Strengths Section */}
        {data.strengths.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-lg font-bold text-green-600 mb-3">
              ✓ Your Strengths ({data.strengths.length})
            </h4>
            
            <div className="space-y-3">
              {data.strengths.map((strength, idx) => (
                <div key={idx} className="rounded-lg border border-green-200 bg-green-50/50 p-4">
                  <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                    <div className="font-semibold text-foreground flex-1">
                      {strength.category}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                      strength.confidence === 'high' 
                        ? 'bg-green-200 text-green-800' 
                        : strength.confidence === 'medium'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      {strength.confidence}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {strength.match}
                  </div>
                  <div className="text-sm text-muted-foreground italic pl-4 border-l-2 border-green-300">
                    💼 {strength.evidence}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gaps Section */}
        {data.gaps.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-lg font-bold text-yellow-600 mb-3">
              Potential Gaps ({data.gaps.length})
            </h4>
            
            <div className="space-y-3">
              {data.gaps.map((gap, idx) => (
                <div key={idx} className="rounded-lg border border-yellow-200 bg-yellow-50/50 p-4">
                  <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                    <div className="font-semibold text-foreground flex-1">
                      {gap.requirement}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                      gap.severity === 'critical' 
                        ? 'bg-red-200 text-red-800' 
                        : gap.severity === 'moderate'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      {gap.severity}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground pl-4 border-l-2 border-yellow-300">
                    💡 {gap.suggestion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standout Qualities */}
        {data.standoutQualities.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-lg font-bold text-purple-600 mb-3">
              ✨ What Makes You Stand Out
            </h4>
            
            <div className="space-y-2">
              {data.standoutQualities.map((quality, idx) => (
                <div key={idx} className="rounded-lg border border-purple-200 bg-purple-50/50 p-3 text-sm text-muted-foreground">
                  ✨ {quality}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <h4 className="flex items-center gap-2 text-lg font-bold text-blue-600 mb-4">
            🎯 Application Strategy
          </h4>
          
          <div className="space-y-4">
            {/* Cover Letter Focus */}
            <div>
              <div className="font-semibold text-foreground mb-2 text-sm">
                📝 Cover Letter Focus:
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {data.recommendations.coverLetterFocus.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
            
            {/* Skills to Highlight */}
            <div>
              <div className="font-semibold text-foreground mb-2 text-sm">
                🎯 Skills to Highlight:
              </div>
              <div className="flex flex-wrap gap-2">
                {data.recommendations.skillsToHighlight.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Projects to Feature */}
            <div>
              <div className="font-semibold text-foreground mb-2 text-sm">
                🚀 Projects to Feature:
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {data.recommendations.projectsToFeature.map((project, idx) => (
                  <li key={idx}>{project}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
