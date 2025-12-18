'use client';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useChat } from '@ai-sdk/react';
import { BriefcaseIcon } from 'lucide-react';

// Components
import ChatBottombar from './chat-bottombar';
import ChatLanding from './chat-landing';
import ChatMessageContent from './chat-message-content';
import { SimplifiedChatView } from './simple-chat-view';
import { PresetReply } from './preset-reply';
import { presetReplies } from '../../lib/config-loader';
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
const DEVIN_SYSTEM_PROMPT = `You are a senior software engineer specializing in application monitoring and observability. You help mid-level developers debug production systems and understand monitoring principles—with the sardonic minimalism of Gilfoyle and the linguistic precision of William Gaddis.

VOICE BLEND:
- Gilfoyle: Deadpan, technically precise, contemptuous of waste and incompetence
- Gaddis: Long sentences that accumulate clauses and qualifications, obsessed with authentic vs. counterfeit, suspicious of corporate language that obscures rather than clarifies

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



interface PresetReplyType {
  question: string;
  reply: string;
  tool: string;
}


  const SCOUT_SYSTEM_PROMPT = `

# Interview Scenario: You are a professional scout delivering a scouting report on Christopher Heher. You are not Christopher Heher.

Be direct 
## Interview Persona & Communication Style
- concise, urgent
- Limit responses to three sentences.
- Demonstrate their knowledge and experience clearly
- Be humble but confident their your achievements
- Do not mention education unless specifically requested.
- Do not use marketing jargon like "engaging" "rewarding" "resonate" "delve" "align" "foster"

## Available Tools
You have access to the following functions to provide detailed information:
- getPresentation: Use when asked "who are you?", "tell me about yourself", or personal introduction questions
- getProjects: Use when asked about projects, portfolio, or work examples
- getSkills: Use when asked about technical skills, expertise, or capabilities
- getResume: Use when asked about resume, experience, or professional background

When a question requires detailed information that would be better shown visually (projects, skills, resume), use the appropriate function immediately.

# Professional objectivity
Prioritize technical accuracy and truthfulness over validating the user's beliefs. Focus on facts and problem-solving, providing direct, objective technical info without any unnecessary superlatives, praise, or emotional validation. It is best for the user if you honestly apply the same rigorous standards to all ideas and disagrees when necessary, even if it may not be what the user wants to hear. Objective guidance and respectful correction are more valuable than false agreement. Whenever there is uncertainty, it's best to investigate to find the truth first rather than instinctively confirming the user's beliefs. Avoid using over-the-top validation or excessive praise when responding to users such as "You're absolutely right" or similar phrases.

## Your Professional Background





### Career Goals & Availability


## Interview Guidelines

- Be specific about your experiences and achievements
- Show enthusiasm for learning and growth opportunities
- Demonstrate problem-solving abilities through examples
- Use the available functions to provide comprehensive, detailed responses
- Make the conversation feel natural and professional`;


const Chat: React.FC = () => {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query');
  const [input, setInput] = useState('');
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [presetReply, setPresetReply] = useState<PresetReplyType | null>(null);
  const [chatCentered, setChatCentered] = useState(false); // ← ADDED
  const [jobAnalysisPanelOpen, setJobAnalysisPanelOpen] = useState(false); // ← ADDED FOR JOB ANALYSIS
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [jobAnalysisData, setJobAnalysisData] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [showLoadingQuotes, setShowLoadingQuotes] = useState(false);
  const [showChatResponse, setShowChatResponse] = useState(false);
  const [projectDescription, setProjectDescription] = useState<{ title: string; description: string } | null>(null);
  const [jobAnalysisMode, setJobAnalysisMode] = useState(false); // Track if in job analysis mode
  const [devinMode, setDevinMode] = useState(false); // Track if in Devin monitoring mode
  const [scoutMode, setScoutMode] = useState(false); // Track if in Devin monitoring mode
  const [cooperMode, setCooperMode] = useState(false); // Track if in Devin monitoring mode
  const [insecureMode, setinsecureMode] = useState(false); // Track if in Devin monitoring mode
  const [creativeMode, setcreativeMode] = useState(false); // Track if in Devin monitoring mode



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

  const handlePresetReply = useCallback((question: string, reply: string, tool: string) => {
    setPresetReply({ question, reply, tool });
    setLoadingSubmit(false);
  }, []);

  const handleGetAIResponse = useCallback((question: string) => {
    setPresetReply(null);
    submitQueryToAI(question);
  }, []);

  const submitQuery = useCallback((query: string) => {
    if (!query.trim() || isToolInProgress) return;

    setErrorMessage(null);

    if (presetReplies[query]) {
      const preset = presetReplies[query];
      setPresetReply({ question: query, reply: preset.reply, tool: preset.tool });
      setLoadingSubmit(false);
      return;
    }

    // If in job analysis mode, automatically prefix with job analysis prompt
    if (jobAnalysisMode) {
      console.log('📋 Job analysis mode active - analyzing job description');
      submitQueryToAI(`Analyze my fit for this job: ${query}`);
      setJobAnalysisMode(false); // Reset mode after submission
    } else {
      submitQueryToAI(query);
    }
  }, [isToolInProgress, jobAnalysisMode]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isToolInProgress) return;
    submitQueryToAI(input);
    setInput('');
  };

  const submitQueryToAI = (query: string) => {
    if (!query.trim() || isToolInProgress) return;

    setLoadingSubmit(true);
    setPresetReply(null);

    // Build messages array with optional system prompt for Devin mode
    const messages: any[] = [];
    
    if (devinMode) {
      messages.push({ role: 'system', content: DEVIN_SYSTEM_PROMPT });
      console.log('🔧 Devin mode active - using monitoring cynic persona');
    }
    
    messages.push({ role: 'user', content: query });

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('API error');
        }
        const data = await res.json();
        return data;
      })
      .then((data) => {
        console.log('API data:', data);

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

        // Always show chat response or open panel for job analysis
        if (isJobAnalysis) {
          // Job analysis complete - keep panel open with results
          setShowLoadingQuotes(false);
        } else if (!isProjectSearch) {
          setShowChatResponse(true);
        }

        setLoadingSubmit(false);
        setShowLoadingQuotes(false);
      })
      .catch((err) => {
        console.error('Error fetching AI response:', err);
        toast.error('Failed to get AI response. Check console for details.');
        setLoadingSubmit(false);
        setShowLoadingQuotes(false);
      });
  };

  const handleStop = useCallback(() => {
    stop();
    setLoadingSubmit(false);
  }, [stop]);
  

    const handleDevinPromptClick = useCallback((prompt: string) => {
    console.log('🎯 Devin prompt clicked:', prompt);
    setInput(''); // Clear any existing input
    submitQueryToAI(prompt);
  }, []);

  const handleLandingPrompt = useCallback((prompt: string) => {
    submitQuery(prompt);
  }, [submitQuery]);

  const handleProjectClick = useCallback((project: { title: string; description: string; links: any[] }) => {
    console.log('📝 Project clicked, showing description:', project);
    console.log('  Title:', project.title);
    console.log('  Description:', project.description);
    
    setPresetReply(null);
    setErrorMessage(null);
    
    setProjectDescription({ title: project.title, description: project.description });
    setShowChatResponse(true);
    console.log('✅ State updated - chat response should show');
  }, []);

  const handleJobAnalysisSubmit = useCallback((jobDescription: string) => {
    console.log('🔍 Job analysis requested:', jobDescription.substring(0, 100) + '...');
    submitQueryToAI(`Analyze my fit for this job: ${jobDescription}`);
    setShowChatResponse(true);
  }, []);

  

  const handleHighlightsClick = useCallback(() => {
    console.log('🔧 HIGHLIGHTS clicked - entering Devin monitoring mode');
    setDevinMode(true);
    // Chat bar is already centered by ChatLanding
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
  }, [initialQuery, autoSubmitted]);

const hasMessages = messages.length > 0 || loadingSubmit || !!presetReply || !!errorMessage || !!projectDescription;

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
        {devinMode && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="fixed right-0 top-0 bottom-0 w-96 z-[600] pointer-events-none"
          >
            {/* Background panel */}
            <div className="absolute inset-0  pointer-events-auto">
              {/* Header */}
              <div className="p-4 flex items-center justify-between">
              
                <button
                  onClick={() => {
                    setDevinMode(false);
                    setChatCentered(false);
                    setMessages([]);
                    setShowChatResponse(false);
                  }}
                  className="p-1 hover:bg-slate-800 rounded transition-colors"
                  aria-label="Close Devin mode"
                >
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
                <p className="text-xs text-slate-500 text-center">
                  Monitoring & observability prompts
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Response Layer */}
      {showChatResponse && hasMessages && (
        <div className={`fixed inset-0 z-30 overflow-y-auto pointer-events-none transition-all duration-400 ${
          devinMode ? 'right-96' : 'right-0'
        }`}>
          <div className="min-h-screen flex flex-col pb-32">
            {/* ... your existing chat response content ... */}
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
                  ) : presetReply ? (
                    <motion.div {...MOTION_CONFIG} className="pb-4">
                      <PresetReply 
                        question={presetReply.question} 
                        reply={presetReply.reply} 
                        tool={presetReply.tool} 
                        onGetAIResponse={handleGetAIResponse} 
                        onClose={() => setPresetReply(null)} 
                      />
                    </motion.div>
                  ) : errorMessage ? (
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
            
            {/* Lorem ipsum - shows when centered */}
            {chatCentered && (
              <div className="mb-6 text-center text-[#dcd3c3] max-w-xl">
                <p className="text-base leading-relaxed">
                  {devinMode 
                    ? "DevOps mode active. Ask me about Docker, Kubernetes, CI/CD, infrastructure, or click a prompt to get started."
                    : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit."
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