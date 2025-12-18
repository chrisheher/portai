'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useChat } from '@ai-sdk/react';

// Components
import ChatBottombar from '@/components/chat/chat-bottombar';
import ChatLanding from '@/components/chat/chat-landing';
import ChatMessageContent from '@/components/chat/chat-message-content';
import { SimplifiedChatView } from '@/components/chat/simple-chat-view';
import { PresetReply } from '@/components/chat/preset-reply';
import { presetReplies } from '@/lib/config-loader';
import { ChatBubble, ChatBubbleMessage } from '@/components/ui/chat/chat-bubble';
import HelperBoost from './HelperBoost';
import { JobAnalysisDisplay } from '@/components/chat/JobAnalysisDisplay';
import { LoadingQuotes } from '@/components/chat/LoadingQuotes';

// Dynamic Avatar component
const Avatar: React.FC<{ hasActiveTool: boolean }> = ({ hasActiveTool }) => {
  return (
    <div className={`flex items-center justify-center rounded-full transition-all duration-300 ${hasActiveTool ? 'h-20 w-20' : 'h-28 w-28'}`}>
      <div className="relative cursor-pointer" onClick={() => (window.location.href = '/')}>
        
      </div>
    </div>
  );
};

// Client-only wrapper
const ClientOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  if (!hasMounted) return null;
  return <>{children}</>;
};

const MOTION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3 },
};

interface PresetReplyType {
  question: string;
  reply: string;
  tool: string;
}

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

  const handlePresetReply = (question: string, reply: string, tool: string) => {
    setPresetReply({ question, reply, tool });
    setLoadingSubmit(false);
  };

  const handleGetAIResponse = (question: string) => {
    setPresetReply(null);
    submitQueryToAI(question);
  };

  const submitQuery = (query: string) => {
    if (!query.trim() || isToolInProgress) return;

    setErrorMessage(null);

    if (presetReplies[query]) {
      const preset = presetReplies[query];
      setPresetReply({ question: query, reply: preset.reply, tool: preset.tool });
      setLoadingSubmit(false);
      return;
    }

    submitQueryToAI(query);
  };

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

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: query }] }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`API error:`);
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

        if (!isJobAnalysis && !isProjectSearch) {
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

  const handleStop = () => {
    stop();
    setLoadingSubmit(false);
  };

  const handleLandingPrompt = (prompt: string) => {
    submitQuery(prompt);
  };

  const handleProjectClick = (project: { title: string; description: string; links: any[] }) => {
    console.log('📝 Project clicked, showing description:', project);
    console.log('  Title:', project.title);
    console.log('  Description:', project.description);
    
    setPresetReply(null);
    setErrorMessage(null);
    
    setProjectDescription({ title: project.title, description: project.description });
    setShowChatResponse(true);
    console.log('✅ State updated - chat response should show');
  };

  const handleJobAnalysisSubmit = (jobDescription: string) => {
    console.log('🔍 Job analysis requested:', jobDescription.substring(0, 100) + '...');
    submitQueryToAI(`Analyze my fit for this job: ${jobDescription}`);
    setShowChatResponse(true);
  };

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
    

      {/* Chat Response Layer */}
      {showChatResponse && hasMessages && (
        <div className="fixed inset-0 z-30 overflow-y-auto pointer-events-none">
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
                            <p className="text-sm text-amber-800 dark:text-amber-200">{errorMessage}</p>
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



      {/* Bottom Bar - UPDATED WITH CENTERING */}
      <ClientOnly>
        <div className={`fixed pb-4 pt-2 z-[500] transition-all duration-700 ease-in-out ${
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
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.
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
      </ClientOnly>
    </>
  );
};

export default Chat;