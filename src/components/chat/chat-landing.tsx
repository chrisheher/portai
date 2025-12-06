'use client';

import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
import { AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { data } from '@/components/projects/ConfigData';
import { getConfig } from '@/lib/config-loader';
import { JobAnalysisDisplay } from '@/components/chat/JobAnalysisDisplay';

const TumblingShapes = dynamic(() => import('./TumblingShapes'), { ssr: false });

// ✅ Memoized wrapper to prevent re-renders
const MemoizedTumblingShapes = memo(({ 
  shapeKey, 
  projects, 
  onShapeClick 
}: { 
  shapeKey: number; 
  projects: any[]; 
  onShapeClick: (item: any) => void;
}) => {
  console.log('🎨 TumblingShapes rendering with key:', shapeKey);
  return (
    <TumblingShapes 
      key={shapeKey}
      projects={projects}
      onShapeClick={onShapeClick}
    />
  );
}, (prevProps, nextProps) => {
  return prevProps.shapeKey === nextProps.shapeKey;
});

MemoizedTumblingShapes.displayName = 'MemoizedTumblingShapes';

interface ChatLandingProps {
  submitQuery: (query: string) => void;
  handlePresetReply: (question: string, reply: string, tool: string) => void;
  onSendPrompt: (prompt: string) => void;
  onProjectClick?: (project: { title: string; description: string; links: any[] }) => void;
  hasMessages?: boolean;
  searchResults?: any[] | null;
  jobAnalysisData?: any | null;
  children?: React.ReactNode;
}

const ChatLanding: React.FC<ChatLandingProps> = ({ 
  submitQuery,
  handlePresetReply,
  onSendPrompt,
  onProjectClick,
  hasMessages = false,
  searchResults = null,
  jobAnalysisData = null,
  children 
}) => {
  const [showJobAnalysis, setShowJobAnalysis] = useState(false);
  const [shapeKey, setShapeKey] = useState(0);

  // Get configuration
  const config = getConfig();

  const allProjects = useMemo(() => data.map((project: any) => ({
    title: project.title,
    category: project.category,
    src: project.src,
    content: project.content,
    type: 'project' as const,
    shape: project.shape, // ✅ Include shape property from JSON
  })), []);

  const leftQuestions = useMemo(() => [
    {
      text: '.me',
      subQuestions: [
        { label: 'top projects', path: '/me/projects', category: 'question', prompt: 'Show me your top projects' },
        { label: 'Which project are you most proud of?', path: '/me/proud', category: 'question', prompt: 'Which project are you most proud of?' },
        { label: 'What kind of?', path: '/me/specialization', category: 'question', prompt: 'What kind of work do you specialize in?' },
      ],
    },
    {
      text: '.value',
      subQuestions: [
        { label: 'Walk me through your professional experience', path: '/value/experience', category: 'question', prompt: 'Walk me through your professional experience' },
        { label: 'versus AI', path: '/value/challenge', category: 'question', prompt: 'versus AI' },
        { label: 'What are your technical skills?', path: '/value/skills', category: 'question', prompt: 'What are your technical skills?' },
      ],
    },
  ], []);

  const questionShapes = useMemo(() => leftQuestions.flatMap(section => 
    section.subQuestions.map(q => ({
      title: q.label,
      category: 'question',
      type: 'question' as const,
      prompt: q.prompt,
    }))
  ), [leftQuestions]);

  const allTumblingItems = useMemo(() => 
    [...allProjects, ...questionShapes], 
    [allProjects, questionShapes]
  );

  const [displayedItems, setDisplayedItems] = useState<any[]>(() => {
    const projects = data.map((project: any) => ({
      title: project.title,
      category: project.category,
      src: project.src,
      content: project.content,
      type: 'project' as const,
      shape: project.shape, // ✅ Include shape property from JSON
    }));

    const questions = [
      {
        text: '.me',
        subQuestions: [
          { label: 'top projects', path: '/me/projects', category: 'question', prompt: 'Show me your top projects' },
          { label: 'Which project?', path: '/me/proud', category: 'question', prompt: 'Which project are you most proud of?' },
          { label: 'specialize in?', path: '/me/specialization', category: 'question', prompt: 'What kind of work do you specialize in?' },
        ],
      },
      {
        text: '.value',
        subQuestions: [
          { label: 'professional', path: '/value/experience', category: 'question', prompt: 'Walk me through your professional experience' },
          { label: 'versus AI', path: '/value/challenge', category: 'question', prompt: 'versus AI' },
          { label: 'technical skills?', path: '/value/skills', category: 'question', prompt: 'What are your technical skills?' },
        ],
      },
    ].flatMap(section => 
      section.subQuestions.map(q => ({
        title: q.label,
        category: 'question',
        type: 'question' as const,
        prompt: q.prompt,
      }))
    );

    return [...projects, ...questions];
  });

  const searchResultsRef = useRef(searchResults);
  
  useEffect(() => {
    if (searchResultsRef.current !== searchResults && searchResults && searchResults.length > 0) {
      console.log('🪣 NEW BUCKET TOSS!');
      setDisplayedItems(searchResults);
      setShapeKey(prev => prev + 1);
      searchResultsRef.current = searchResults;
    }
  }, [searchResults]);

  // Show job analysis modal when data arrives
  useEffect(() => {
    if (jobAnalysisData) {
      setShowJobAnalysis(true);
    }
  }, [jobAnalysisData]);

const handleShapeClick = useMemo(() => (item: any) => {
    if (item.type === 'project') {
      console.log('🎯 Project clicked:', item.title);
      
      // Get links directly from config
      const projectData = config.projects.find(p => p.title === item.title);
      
      console.log('📂 Found project data:', projectData);
      console.log('🔗 Links raw:', projectData?.links);
      
      if (projectData && projectData.links) {
        // Ensure links is an object before converting
        let linksArray: any[] = [];
        
        if (typeof projectData.links === 'object' && !Array.isArray(projectData.links)) {
          linksArray = Object.entries(projectData.links).map(([name, url]) => {
            console.log(`   Converting link: ${name} → ${url}`);
            return {
              title: name,
              category: 'link',
              type: 'link' as const,
              url: String(url)
            };
          });
        } else if (Array.isArray(projectData.links)) {
          // Already an array
          console.log('✅ Links already array:', projectData.links);
          linksArray = projectData.links.map(link => ({
            title: link.name,
            category: 'link',
            type: 'link' as const,
            url: link.url
          }));
        } else {
          console.warn('⚠️ Links is not an object or array:', typeof projectData.links);
        }
        
        console.log('✅ Final links array:', linksArray);
        
        // Notify parent component about project click
        if (onProjectClick) {
          onProjectClick({
            title: projectData.title,
            description: projectData.description,
            links: linksArray
          });
        }
        
        // Update displayed items to show links as tumbling shapes
        setDisplayedItems(linksArray);
        setShapeKey(prev => prev + 1);
      } else {
        console.warn('⚠️ No project data or links found');
      }
    } else if (item.type === 'link') {
      // ✅ Open link in new tab
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else if (item.type === 'question') {
      onSendPrompt(item.prompt);
    }
  }, [config.projects, onSendPrompt, onProjectClick]);

  const handleJobAnalysisClose = () => {
    setShowJobAnalysis(false);
  };

  useEffect(() => {
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <>
      {/* TUMBLING SHAPES - Always visible in background */}
      <div className="fixed inset-0 z-10 bg-[#d4c4b0] pointer-events-none">
        <div className="pointer-events-auto">
          {displayedItems.length > 0 && (
            <MemoizedTumblingShapes 
              shapeKey={shapeKey}
              projects={displayedItems}
              onShapeClick={handleShapeClick}
            />
          )}
        </div>
      </div>

      {/* JOB ANALYSIS MODAL */}
      <AnimatePresence>
        {showJobAnalysis && jobAnalysisData && (
          <JobAnalysisModal
            data={jobAnalysisData}
            onClose={handleJobAnalysisClose}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// Job Analysis Modal Component
function JobAnalysisModal({ data, onClose }: { data: any; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] h-screen overflow-auto">
      <div
        className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-lg"
        onClick={onClose}
      />
      <div
        className="relative z-[210] mx-auto my-8 h-fit max-w-5xl rounded-2xl bg-white font-sans dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="sticky top-4 z-[220] flex justify-end px-8 pt-8 md:px-14 md:pt-8">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/90 shadow-md dark:bg-white/90"
            onClick={onClose}
          >
            <svg className="h-6 w-6 text-neutral-100 dark:text-neutral-900" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Header */}
        <div className="relative px-8 pt-2 pb-0 md:px-14">
          <div>
            <p className="text-base font-medium text-black dark:text-white">
              Job Analysis
            </p>
            <p className="mt-4 text-2xl font-semibold text-neutral-700 md:text-5xl dark:text-white">
              {data.jobTitle || 'Position Analysis'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pt-8 pb-14 md:px-14">
          <JobAnalysisDisplay data={data} />
        </div>
      </div>
    </div>
  );
}

export default ChatLanding;