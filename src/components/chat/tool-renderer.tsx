// src/components/chat/tool-renderer.tsx
import AvailabilityCard from '../AvailabilityCard';
import { Presentation } from '../presentation';
import AllProjects from '../projects/AllProjects';
import Resume from '../resume';
import Skills from '../skills';
import { JobAnalysisDisplay } from './JobAnalysisDisplay';

interface ToolRendererProps {
  toolInvocations: any[];
  messageId: string;
}

export default function ToolRenderer({
  toolInvocations,
  messageId,
}: ToolRendererProps) {
  return (
    <div className="w-full transition-all duration-300">
      {toolInvocations.map((tool) => {
        const { toolCallId, toolName, result } = tool;



        switch (toolName) {
         case 'analyzeJob':
  return (
    <div key={toolCallId} className="w-full overflow-hidden rounded-lg">
      <JobAnalysisDisplay data={result} />
    </div>
  );
         
         case 'getProjects':
            return (
              <div key={toolCallId} className="w-full overflow-hidden rounded-lg">
                <AllProjects />
              </div>
            );

          case 'getPresentation':
            return (
              <div key={toolCallId} className="w-full overflow-hidden rounded-lg">
                <Presentation />
              </div>
            );



     

          case 'getSkills':
            return (
              <div key={toolCallId} className="w-full rounded-lg">
                <Skills />
              </div>
            );

   

          default:
            return (
              <div key={toolCallId} className="bg-secondary/10 w-full rounded-lg p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-medium">{toolName}</h3>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-100">
                    Tool Result
                  </span>
                </div>
                <div className="mt-2">
                  {typeof result === 'object' ? (
                    <pre className="bg-secondary/20 overflow-x-auto rounded p-3 text-sm">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  ) : (
                    <p>{String(result)}</p>
                  )}
                </div>
              </div>
            );
        }
      })}
    </div>
  );
}
