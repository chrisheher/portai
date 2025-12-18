/*"use client";
import { Card, Carousel } from "@/components/projects/apple-cards-carousel";
import { data } from "@/components/projects/ConfigData";
import TumblingShapes from "@/components/chat/TumblingShapes";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

interface AllProjectsProps {
  data?: {
    projects?: any[];
    summary?: string;
    category?: string;
  };
}
interface Project {
  title: string;
  category?: string;
  src?: string;
  content?: React.ReactNode;
  type?: 'project' | 'question';
  prompt?: string;
  // Add any other properties your Project has
}

export default function AllProjects({ data: toolData }: AllProjectsProps) {
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);

  // Use filtered projects from tool if available, otherwise use all projects
  const projectsToDisplay = toolData?.projects 
    ? toolData.projects.map((project: any) => {
const fullProject = data.find((p: any) => p.title === project.title);
        
        if (fullProject) {
          return fullProject;
        }
        
        const linksArray = project.links || [];
        
        return {
          category: project.category,
          title: project.title,
          src: project.src || '/placeholder.jpg',
          content: (
            <div className="p-4">
              <p className="mb-4">{project.description}</p>
              {project.techStack && project.techStack.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech: string, i: number) => (
                      <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {linksArray.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Links</h4>
                  <div className="flex flex-wrap gap-2">
                    {linksArray.map((link: any, i: number) => (
                      <a
                        key={i}
                        href={link.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {link.name || 'Link'}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ),
        };
      })
    : data;

const cards = projectsToDisplay.map((card: any, index: number) => (  <Card key={card.src || card.title} card={card} index={index} layout={true} />
  ));

  const projectCount = projectsToDisplay.length;
  const headerText = toolData?.summary 
    ? `${toolData.summary}` 
    : "My Projects";

  const isSearchResult = Boolean(toolData?.projects);

const handleShapeClick = (item: Project) => {
  const projectTitle = item.title;
const index = projectsToDisplay.findIndex((p: any) => p.title === projectTitle);  if (index !== -1) {
    setSelectedProjectIndex(index);
  }
};

  const handleCardClose = () => {
    setSelectedProjectIndex(null);
  };

  return (
    <div className="w-full h-screen pt-8">
      {!isSearchResult && (
        <>
          <h2 className="max-w-7xl mx-auto text-xl md:text-3xl font-bold text-neutral-800 dark:text-neutral-200 font-sans mb-2">
            {headerText}
          </h2>
          <Carousel items={cards} />
        </>
      )}
      
      {isSearchResult && (
        <div className="w-full h-screen relative">
          <div className="absolute top-2 left-0 right-0 z-10 text-center">
            <h2 className="text-xl md:text-3xl font-bold text-neutral-800 dark:text-neutral-200 font-sans mb-2">
              {headerText}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Showing {projectCount} of {data.length} total projects
            </p>
          </div>
          
          <TumblingShapes 
            projects={projectsToDisplay} 
            filterCategory={toolData?.category}
            onShapeClick={handleShapeClick}
          />

       
          <AnimatePresence>
            {selectedProjectIndex !== null && (
              <CardModal
                card={projectsToDisplay[selectedProjectIndex]}
                onClose={handleCardClose}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Separate card modal component
function CardModal({ card, onClose }: { card: any; onClose: () => void }) {
  const containerRef = useState<HTMLDivElement>(null);

  useState(() => {
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
  });

  return (
    <div className="fixed inset-0 z-[100] h-screen overflow-auto">
      <div
        className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-lg"
        onClick={onClose}
      />
      <div
        className="relative z-[110] mx-auto my-8 h-fit max-w-3xl rounded-2xl bg-white font-sans dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="sticky top-4 z-[120] flex justify-end px-8 pt-8 md:px-14 md:pt-8">
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

   
        <div className="relative px-8 pt-2 pb-0 md:px-14">
          <div>
            <p className="text-base font-medium text-black dark:text-white">
              {card.category}
            </p>
            <p className="mt-4 text-2xl font-semibold text-neutral-700 md:text-5xl dark:text-white">
              {card.title}
            </p>
          </div>
        </div>


        <div className="px-8 pt-8 pb-14 md:px-14">{card.content}</div>
      </div>
    </div>
  );
}*/