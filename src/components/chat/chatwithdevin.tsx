'use client';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useChat } from '@ai-sdk/react';
import { BriefcaseIcon } from 'lucide-react';
import portfolioConfig from '@/components/chat/portconfig.json';

// Components
import ChatBottombar from './chat-bottombar';
import ChatLanding from './chat-landing';
import ChatMessageContent from './chat-message-content';
import { SimplifiedChatView } from './simple-chat-view';
import { ChatBubble, ChatBubbleMessage } from '../ui/chat/chat-bubble';
import HelperBoost from './HelperBoost';
import JobAnalysisPopup from './JobAnalysisPopup';
import JobAnalysisDisplay from './JobAnalysisDisplay';
import { LoadingQuotes } from './LoadingQuotes';
import DevinPromptShapes from './DevinPromptShapes';


// Component

// Dynamic Avatar component
const Avatar: React.FC<{ hasActiveTool: boolean }> = ({ hasActiveTool }) => {
  return (
    <div className={`flex items-center justify-center rounded-full transition-all duration-300 ${hasActiveTool ? 'h-20 w-20' : 'h-28 w-28'}`}>
      <div className="relative cursor-pointer" onClick={() => (window.location.href = '/')}>
        
      </div>
    </div>
  );
};

const MOTION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3 },
};

// Devin persona system prompt for HIGHLIGHTS mode
const DEVIN_SYSTEM_PROMPT = `You are a longwinded senior software engineer specializing in application monitoring and observability. You help incompetent CI/CD leaders debug production systems and understand monitoring principles—with the sardonic minimalism of Gilfoyle and the linguistic precision of William Gaddis.

VOICE BLEND:
- Gilfoyle: Deadpan, technically precise, contemptuous of waste and incompetence
- Gaddis: obsessed with authentic vs. counterfeit, suspicious of corporate language that obscures rather than clarifies

CORE PHILOSOPHY:
- Monitoring reveals what your system actually does vs. what you think it does
- Most observability is theater—dashboards nobody reads, metrics nobody acts on
- Good instrumentation is invisible until you need it
- The map is not the territory, and most monitoring is selling maps

COMMUNICATION STYLE:
- Open with terse, direct answers (1-2 sentences)
- Expand with Gaddis-style accumulation when explaining deeper concepts: clauses building on clauses, parenthetical corrections, sentences that loop back before landing
- Precise technical vocabulary—no hand-waving
- Skeptical of buzzwords, vendor-speak, hype cycles
- Concrete examples (code, configuration, architecture)
- Cap monologues at ~200 words, then refocus on user's problem

CONCERNS & VOCABULARY:
- Authentic vs. counterfeit (real problems vs. imagined ones, signal vs. noise)
- "What it says vs. what it does" (documentation vs. reality)
- Corporate language as misdirection
- The gap between marketed solutions and operational truth
- Systems thinking over tool fetishism

NEVER:
- Use emojis or enthusiasm
- Say "hope this helps!" or "great question!"
- Pretend politeness when technical clarity is needed
- Recommend solutions you wouldn't use yourself

HANDLING UNKNOWNS:
When you don't have specific information: "That's tool-specific—check your vendor's docs. I'm here for concepts and architecture, not product feature comparisons."

ENGAGEMENT STRATEGY:
- Reward good questions with architectural insight
- Correct false assumptions, then explain the right mental model
- Highlight gaps between marketing and reality
- End with actionable next steps

BOUNDARIES:
- Genuinely helpful beneath the cynicism
- Cut the performance when someone's debugging production
- No cruelty to people asking honest questions`;






const Chat: React.FC = () => {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query');
  const [input, setInput] = useState('');
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [chatCentered, setChatCentered] = useState(false);
  const [jobAnalysisPanelOpen, setJobAnalysisPanelOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [jobAnalysisData, setJobAnalysisData] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [showLoadingQuotes, setShowLoadingQuotes] = useState(false);
  const [showChatResponse, setShowChatResponse] = useState(false);
  const [projectDescription, setProjectDescription] = useState<{ title: string; description: string } | null>(null);
  const [jobAnalysisMode, setJobAnalysisMode] = useState(false);
  const [devinMode, setDevinMode] = useState(false);
  const [scoutMode, setScoutMode] = useState(false);
  const [cooperMode, setCooperMode] = useState(false);
  const [insecureMode, setinsecureMode] = useState(false);
  const [creativeMode, setcreativeMode] = useState(false);

  // Dynamic Scout prompt builder - pulls from portconfig.json
  const buildScoutPrompt = useCallback(() => {
    const config = portfolioConfig as any;
    
    // Build experience section
    let experienceSection = '';
    if (Array.isArray(config.experience)) {
      experienceSection = config.experience
        .map((exp: any) => `- ${exp.position} at ${exp.company} (${exp.duration}): ${exp.description}`)
        .join('\n');
    }
    
    // Build projects section (featured only, max 5)
    let projectsSection = '';
    if (Array.isArray(config.projects)) {
      projectsSection = config.projects
        .filter((p: any) => p.featured && p.title)
        .slice(0, 5)
        .map((p: any) => `- ${p.title}: ${p.description || ''}`)
        .join('\n');
    }

    return `# Scouting Report: ${config.personal?.name || 'Chris Heher'}

## Professional Background
${config.personal?.title || ''}

### Experience
${experienceSection || 'No experience data available'}

### Notable Projects
${projectsSection || 'No projects data available'}

## Scout Style
- Curmudgeonly but honest
-
- Emphasize copywriting and content creation over code and web development
- Sports analogies (basketball)
- Three sentences max
- No marketing jargon
- Focus on facts over hype
- Always refer to me as 'Chris' not 'Heher'

IMPORTANT GUIDELINES:
-always use specific examples from experience and projects
-never say 'field' always say 'court'

PHRASES:
- Impressive flashes of metaphorical diversity 
-simple and direct, doesn't play with his language food
-in his bag like the fries at the bottom   
-punches high-impact headlines home
-laces insights from deep
- Can Eurostep his way to the right phrase
- Language handle is the most advanced in the class
- Deep bag of metaphors, humor, spins, focalization
- Excellent research vision, finds the right reference at the right time
- Tough shot maker. Writes solutions that satisfy technical and marketers
- Built for pressure

<supplementary_knowledge>
### "Luka Doncic"
https://thestepien.com/luka-doncic/

### "Dylan Harper"
https://www.babcockhoops.com/post/2025-nba-draft-dylan-harper-scouting-report

### "Shai"
https://thestepien.com/shai-gilgeous-alexander/
</supplementary_knowledge>

Use supplementary knowledge to inform voice, tone, and phrasing, not content. Rely on experience and projects above.

IMPORTANT: Do NOT use any tools (getSkills, getProjects, analyzeJob). 
Answer based solely on the experience and projects provided above.`;
  }, []);


const {
  messages, 
  stop,
  setMessages,
  addToolResult,
} = useChat({
  onFinish: () => setLoadingSubmit(false),
  onError: (error) => {
    setLoadingSubmit(false);
    console.error('Chat error:', error.message, error.cause);

    if (error.message?.includes('quota') || error.message?.includes('429')) {
      toast.error('⚠️ API Quota Exhausted!', { duration: 6000 });
      setErrorMessage('quota_exhausted');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ **API Quota Exhausted**\n\nFree Gemini API limit reached. Please contact Anuj directly or use preset questions.',
          id: Date.now().toString(),
          parts: [
            {
              type: 'text',
              text: '⚠️ **API Quota Exhausted**\n\nFree Gemini API limit reached. Please contact Anuj directly or use preset questions.',
            },
          ],
        },
      ]);
    } else if (error.message?.includes('network')) {
      toast.error('Network error. Please check your connection.');
      setErrorMessage('Network error');
    } else {
      toast.error(`Error: ${error.message}`);
      setErrorMessage(`Error: ${error.message}`);
    }
  },
});

  const devinContainerRef = useRef<HTMLDivElement>(null);

const isLoading = loadingSubmit;
  const { currentAIMessage, latestUserMessage, hasActiveTool } = useMemo(() => {
    const latestAI = messages.findLastIndex((m) => m.role === 'assistant');
    const latestUser = messages.findLastIndex((m) => m.role === 'user');
    const result = {
      currentAIMessage: latestAI !== -1 ? messages[latestAI] : null,
      latestUserMessage: latestUser !== -1 ? messages[latestUser] : null,
      hasActiveTool: false,
    };

  if (result.currentAIMessage) {
  result.hasActiveTool =
    result.currentAIMessage.parts?.some(
      (part) => part.type === 'tool-result'
    ) || false;
}

    if (latestAI < latestUser) result.currentAIMessage = null;
    return result;
  }, [messages]);

const isToolInProgress = messages.some(
  (m) =>
    m.role === 'assistant' &&
    m.parts?.some((part) => part.type === 'tool-call')
);
  /** --- Handlers --- */
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };



  const handleGetAIResponse = useCallback((question: string) => {
    submitQueryToAI(question);
  }, []);

  const submitQueryToAI = useCallback((query: string) => {
    if (!query.trim() || isToolInProgress) return;

    setLoadingSubmit(true);

    // Build request body with optional system prompt
    const requestBody: any = {
      messages: [{ role: 'user', content: query }]
    };
    
    if (devinMode) {
      requestBody.system = DEVIN_SYSTEM_PROMPT;
      console.log('🔧 DEVIN MODE ACTIVE');
    } else if (scoutMode) {
      requestBody.system = buildScoutPrompt();
      console.log('🎯 SCOUT MODE ACTIVE (from config)');
      console.log('   - Prompt length:', requestBody.system.length);
    }

    console.log('📨 Sending request to /api/chat:', {
      messageCount: requestBody.messages.length,
      hasSystem: !!requestBody.system,
      mode: devinMode ? 'devin' : scoutMode ? 'scout' : 'none'
    });

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`API error: ${res.status} - ${errorText}`);
        }
        const data = await res.json();
        return data;
      })
      .then((data) => {
        console.log('📦 API data received:', data);

        let messagesToAdd: any[] = [];
        let isJobAnalysis = false;
        let isProjectSearch = false;

        if (Array.isArray(data)) {
          messagesToAdd = data.map((msg) => {
            const baseMessage = {
              role: msg.role ?? 'assistant',
              content: msg.content ?? msg.text ?? '',
              id: msg.id ?? Date.now().toString(),
            };

            if (msg.tool && msg.result) {
              if (msg.tool === 'analyzeJob') {
                setJobAnalysisData(msg.result);
                isJobAnalysis = true;
                setShowLoadingQuotes(true);
              }

              if (msg.tool === 'getProjects' && msg.result?.projects) {
                console.log('🔍 Projects found:', msg.result.projects.length);
                
                const allShapes: any[] = [];
                
                msg.result.projects.forEach((project: any, index: number) => {
                  console.log(`\n📦 Project ${index + 1}:`, project.title);
                  console.log('   Links:', project.links);

                  if (project.links) {
                    const linksArray = Array.isArray(project.links) 
                      ? project.links 
                      : Object.entries(project.links).map(([name, url]) => ({ name, url: String(url) }));
                    
                    console.log(`   🔗 Processing ${linksArray.length} links...`);
                    linksArray.forEach((link: any, linkIndex: number) => {
                      console.log(`      Link ${linkIndex + 1}:`, link.name, '→', link.url);
                      allShapes.push({
                        title: link.name,
                        category: 'link',
                        type: 'link' as const,
                        url: link.url,
                        parentProject: project.title,
                      });
                      console.log(`      ✅ Added link shape: ${link.name}`);
                    });
                  } else {
                    console.log('   ⚠️ No links found');
                  }
                });
                
                console.log('\n🎨 Total shapes to render:', allShapes.length);
                console.log('   - Links only (no project shapes)');
                
                setSearchResults(allShapes);
                isProjectSearch = true;
              }

              return {
                ...baseMessage,
                parts: [
                  {
                    type: 'tool-invocation',
                    toolInvocation: {
                      state: 'result',
                      toolCallId: `${msg.tool}-${Date.now()}`,
                      toolName: msg.tool,
                      result: msg.result,
                    }
                  }
                ]
              };
            }

            return {
              ...baseMessage,
              parts: msg.parts ?? [{ type: 'text', text: msg.content ?? msg.text ?? '' }],
            };
          });
        } else if (data?.text || data?.content) {
          messagesToAdd = [
            {
              role: 'assistant',
              content: data.text ?? data.content,
              id: Date.now().toString(),
              parts: [{ type: 'text', text: data.text ?? data.content }],
            },
          ];
        }

        if (messagesToAdd.length > 0) {
          setMessages((prev) => [...prev, ...messagesToAdd]);
        }

        if (isJobAnalysis) {
          setShowLoadingQuotes(false);
        } else if (!isProjectSearch) {
          setShowChatResponse(true);
        }

        setLoadingSubmit(false);
        setShowLoadingQuotes(false);
      })
      .catch((err) => {
        console.error('❌ Error fetching AI response:', err);
        toast.error('Failed to get AI response. Check console for details.');
        setLoadingSubmit(false);
        setShowLoadingQuotes(false);
      });
  }, [devinMode, scoutMode, isToolInProgress, setMessages, buildScoutPrompt]);

  const submitQuery = useCallback((query: string) => {
    if (!query.trim() || isToolInProgress) return;

    setErrorMessage(null);

 

    if (jobAnalysisMode) {
      console.log('📋 Job analysis mode active - analyzing job description');
      submitQueryToAI(`Analyze my fit for this job: ${query}`);
      setJobAnalysisMode(false);
    } else {
      submitQueryToAI(query);
    }
  }, [isToolInProgress, jobAnalysisMode, submitQueryToAI]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isToolInProgress) return;
    submitQueryToAI(input);
    setInput('');
  };

  const handleStop = useCallback(() => {
    stop();
    setLoadingSubmit(false);
  }, [stop]);
  

  const handleDevinPromptClick = useCallback((prompt: string) => {
    console.log('🎯 Devin prompt clicked:', prompt);
    setInput('');
    submitQueryToAI(prompt);
  }, [submitQueryToAI]);

  const handleLandingPrompt = useCallback((prompt: string) => {
    submitQuery(prompt);
  }, [submitQuery]);

  const handleProjectClick = useCallback((project: { title: string; description: string; links: any[] }) => {
    console.log('📝 Project clicked, showing description:', project);
    
    setErrorMessage(null);
    
    setProjectDescription({ title: project.title, description: project.description });
    setShowChatResponse(true);
    console.log('✅ State updated - chat response should show');
  }, []);

  const handleJobAnalysisSubmit = useCallback((jobDescription: string) => {
    console.log('🔍 Job analysis requested:', jobDescription.substring(0, 100) + '...');
    submitQueryToAI(`Analyze my fit for this job: ${jobDescription}`);
    setShowChatResponse(true);
  }, [submitQueryToAI]);

  const handleHighlightsClick = useCallback(() => {
    console.log('🔧 HIGHLIGHTS clicked - entering Devin monitoring mode');
    setDevinMode(true);
  }, []);

  const handleSkillsClick = useCallback(() => {
    console.log('💼 SKILLS clicked - entering job analysis mode');
    setJobAnalysisMode(true);
  }, []);

  const handleDevinModeClick = useCallback(() => {
    console.log('🔧 DEVIN MODE activated');
    setDevinMode(true);
    setScoutMode(false);
    setChatCentered(true);
    setMessages([]);
    setShowChatResponse(false);
    console.log('🗑️ Chat messages cleared');
  }, [setMessages]);

  const handleScoutModeClick = useCallback(() => {
    console.log('🎯 SCOUT MODE activated');
    setScoutMode(true);
    setDevinMode(false);
    setChatCentered(true);
    setMessages([]);
    setShowChatResponse(false);
    console.log('🗑️ Chat messages cleared');
  }, [setMessages]);

  const handleChatCenter = useCallback((centered: boolean) => {
    setChatCentered(centered);
    if (!centered) {
      setMessages([]);
      setDevinMode(false);
      setScoutMode(false);
      setShowChatResponse(false);
      console.log('⬅️ Back button pressed - chat cleared, modes reset');
    }
  }, [setMessages]);

  // Keep panel open when job analysis results arrive
  useEffect(() => {
    if (jobAnalysisData) {
      console.log('📊 Job analysis data received, keeping panel open');
      setJobAnalysisPanelOpen(true);
    }
  }, [jobAnalysisData]);

  useEffect(() => {
    if (initialQuery && !autoSubmitted) {
      setAutoSubmitted(true);
      setInput('');
      submitQuery(initialQuery);
    }
  }, [initialQuery, autoSubmitted, submitQuery]);

const hasMessages = messages.length > 0 || loadingSubmit || !!errorMessage || !!projectDescription;

  const renderToolInvocation = (toolInvocation: any) => {
    if (toolInvocation.state === 'call') {
      return (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="animate-pulse">Loading {toolInvocation.toolName}...</span>
        </div>
      );
    }

    return null;
  };

  /** --- JSX --- */
   return (
    <>
      {/* ChatLanding - Just tumbling shapes and modals */}
      <ChatLanding 
        config={{ projects: [] }}
        onChatCenter={setChatCentered}
        onSkillsClick={handleSkillsClick}
        onDevinModeClick={handleDevinModeClick}
        onScoutModeClick={handleScoutModeClick}
        onJobAnalysisOpen={() => setJobAnalysisPanelOpen(true)}
        onJobAnalysisClose={() => setJobAnalysisPanelOpen(false)}
        hideDescriptionBox={showChatResponse && hasMessages}
      />

      {/* Devin Mode Right Gutter - NEW */}
      <AnimatePresence>
        {(devinMode) && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="fixed right-0 top-0 bottom-0 w-96 z-[600] pointer-events-none"
          >
            {/* Background panel */}
            <div className={`absolute inset-0 pointer-events-auto ${
              devinMode ? 'bg-slate-900/95' : 'bg-amber-900/95'
            }`}>
              {/* Header */}
              <div className="p-4 flex items-center justify-between">
                <h2 className={`text-lg font-semibold ${
                  devinMode ? 'text-slate-200' : 'text-amber-200'
                }`}>
                  {devinMode ? '🔧 Devin Mode' : '🎯 Scout Mode'}
                </h2>
                <button
                  onClick={() => {
                    setDevinMode(false);
                    setScoutMode(false);
                    setChatCentered(false);
                    setMessages([]);
                    setShowChatResponse(false);
                  }}
                  className={`p-1 rounded transition-colors ${
                    devinMode ? 'hover:bg-slate-800' : 'hover:bg-amber-800'
                  }`}
                  aria-label="Close mode"
                >
                  ✕
                </button>
              </div>

              {/* Tumbling prompts container */}
              <div 
                ref={devinContainerRef}
                className="absolute inset-0 top-[65px] overflow-hidden"
              >
                <DevinPromptShapes
                  isActive={devinMode || scoutMode || cooperMode || creativeMode || insecureMode}
                  mode={devinMode ? 'devin' : scoutMode ? 'scout' : cooperMode ? 'cooper' : creativeMode ? 'creative' : 'insecure'}
                  onPromptClick={handleDevinPromptClick}
                  containerRef={devinContainerRef as React.RefObject<HTMLDivElement>}
                />
              </div>

              {/* Footer hint */}
              <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                <p className={`text-xs text-center ${
                  devinMode ? 'text-slate-500' : 'text-amber-500'
                }`}>
                  {devinMode 
                    ? 'Monitoring & observability prompts'
                    : 'Scouting report prompts'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Response Layer */}
      {showChatResponse && hasMessages && (
        <div className={`fixed inset-0 z-30 overflow-y-auto pointer-events-none transition-all duration-400 ${
          (devinMode || scoutMode) ? 'right-96' : 'right-0'
        }`}>
          <div className="min-h-screen flex flex-col pb-32">
            <div className="sticky top-0 left-0 right-0 z-40 bg-[#d4c4b0] pointer-events-auto">
              <div className={`transition-all duration-300 ease-in-out ${hasActiveTool ? 'pt-4 pb-2' : 'py-6'}`}>
                <div className="flex justify-center">
                  <Avatar hasActiveTool={hasActiveTool} />
                </div>

                <AnimatePresence>
                  {latestUserMessage && !currentAIMessage && (
                    <motion.div {...MOTION_CONFIG} className="mx-auto flex max-w-7xl px-4 mt-4">
                      <ChatBubble variant="sent">
                        <ChatBubbleMessage>
                          <ChatMessageContent message={latestUserMessage} isLast={true} isLoading={false} />
                        </ChatBubbleMessage>
                      </ChatBubble>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex-1 w-full px-2 py-0 pointer-events-none">
              <div className="mx-auto max-w-7xl w-full pointer-events-auto">
                <AnimatePresence mode="wait">
                  {projectDescription ? (
                    <motion.div key="project-description" {...MOTION_CONFIG}>
                      <ChatBubble variant="received">
                        <ChatBubbleMessage>
                          <ChatMessageContent 
                            message={{
                              id: 'project-desc',
                              role: 'assistant',
                              parts: [{
                                type: 'text',
                                text: `**${projectDescription.title}**\n\n${projectDescription.description}`
                              }]
                            }}
                            isLast={true}
                            isLoading={false}
                          />
                        </ChatBubbleMessage>
                      </ChatBubble>
                    </motion.div>
                  )  : errorMessage ? (
                    <motion.div key="error" {...MOTION_CONFIG}>
                      <ChatBubble variant="received">
                        <ChatBubbleMessage className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                          <div className="space-y-4 p-4">
                            <p className="text-sm text-amber-200 dark:text-amber-200">{errorMessage}</p>
                          </div>
                        </ChatBubbleMessage>
                      </ChatBubble>
                    </motion.div>
                  ) : currentAIMessage ? (
                    <div className="w-full space-y-6">
                      <SimplifiedChatView message={currentAIMessage} isLoading={isLoading}  />
                      
                      {currentAIMessage.parts?.map((part: any, index: number) => {
                        if (part.type === 'tool-invocation') {
                          return (
                            <div key={`tool-${index}`} className="w-full">
                              {renderToolInvocation(part.toolInvocation)}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ) : (
                    loadingSubmit && (
                      <motion.div key="loading" {...MOTION_CONFIG}>
                        <ChatBubble variant="received">
                          <ChatBubbleMessage isLoading />
                        </ChatBubble>
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading quotes screen */}
      {showLoadingQuotes && <LoadingQuotes />}

      {/* Job Analysis Popup */}
      <JobAnalysisPopup
        isOpen={jobAnalysisPanelOpen && !!jobAnalysisData}
        onClose={() => setJobAnalysisPanelOpen(false)}
      >
        {jobAnalysisData && (
          <JobAnalysisDisplay data={jobAnalysisData} />
        )}
      </JobAnalysisPopup>

      {/* Bottom Bar - UPDATED WITH CENTERING */}
      <div className={`fixed pb-4 pt-2 z-[700] transition-all duration-700 ease-in-out ${
        chatCentered 
          ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
          : 'top-0 left-0 right-0'
      }`}>
        <div className="container mx-auto max-w-3xl px-4">
          <div className="relative flex flex-col items-center gap-3">
            
            {/* Description text - shows when centered */}
            {chatCentered && (
              <div className="mb-6 text-center text-[#dcd3c3] max-w-xl">
                <p className="text-base leading-relaxed">
                  {devinMode 
                    ? "DevOps mode active. Ask me about Docker, Kubernetes, CI/CD, infrastructure, or click a prompt to get started."
                    : scoutMode
                    ? "Scout mode active. Ask me about Chris's experience, projects, or click a prompt for a scouting report."
                    : "Ask me anything about my experience, projects, or skills."
                  }
                </p>
              </div>
            )}
            
            <ChatBottombar 
              input={input} 
              handleInputChange={handleInputChange} 
              handleSubmit={onSubmit}
              isLoading={isLoading} 
              stop={handleStop} 
              isToolInProgress={isToolInProgress}
              setInput={setInput}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;