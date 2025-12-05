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
  transition: { duration: 0.3, ease: 'easeOut' },
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [jobAnalysisData, setJobAnalysisData] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [showLoadingQuotes, setShowLoadingQuotes] = useState(false);
  const [showChatResponse, setShowChatResponse] = useState(false);

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
          (part) => part.type === 'tool-invocation' && part.toolInvocation?.state === 'result'
        ) || false;
    }

    if (latestAI < latestUser) result.currentAIMessage = null;
    return result;
  }, [messages]);

  const isToolInProgress = messages.some(
    (m) =>
      m.role === 'assistant' &&
      m.parts?.some((part) => part.type === 'tool-invocation' && part.toolInvocation?.state !== 'result')
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
    const isLikelyJobAnalysis = query.includes('http') || 
                                query.includes('job') || 
                                query.includes('position') ||
                                query.includes('role') ||
                                query.length > 200; // Long text pastes
    
    if (isLikelyJobAnalysis) {
      setShowLoadingQuotes(true);
    }
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

        let messagesToAdd = [];
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
              }

              if (msg.tool === 'getProjects' && msg.result?.projects) {
                console.log('🔍 Projects found:', msg.result.projects.length);
                
                // Transform projects AND their links into shapes
                const allShapes: any[] = [];
                
                msg.result.projects.forEach((project: any, index: number) => {
                  console.log(`\n📦 Project ${index + 1}:`, project.title);
                  console.log('   Links:', project.links);
                  
                  // Add the main project shape
                  allShapes.push({
                    title: project.title,
                    category: project.category,
                    type: 'project' as const,
                    src: project.links?.[0]?.url || '',
                    content: project.description,
                  });
                  console.log('   ✅ Added project shape');

                  // Add link shapes for each project link
                  if (project.links && Array.isArray(project.links)) {
                    console.log(`   🔗 Processing ${project.links.length} links...`);
                    project.links.forEach((link: any, linkIndex: number) => {
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
                    console.log('   ⚠️ No links array found');
                  }
                });
                
                console.log('\n🎨 Total shapes to render:', allShapes.length);
                console.log('   - Projects:', allShapes.filter(s => s.type === 'project').length);
                console.log('   - Links:', allShapes.filter(s => s.type === 'link').length);
                
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

  useEffect(() => {
    if (initialQuery && !autoSubmitted) {
      setAutoSubmitted(true);
      setInput('');
      submitQuery(initialQuery);
    }
  }, [initialQuery, autoSubmitted]);

  const hasMessages = messages.length > 0 || loadingSubmit || presetReply || errorMessage;

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
        submitQuery={submitQuery} 
        handlePresetReply={handlePresetReply}
        onSendPrompt={handleLandingPrompt}
        hasMessages={hasMessages}
        searchResults={searchResults}
        jobAnalysisData={jobAnalysisData}
      />

      {/* Chat Response Layer - Transparent to clicks except content */}
      {showChatResponse && hasMessages && (
        <div className="fixed inset-0 z-30 overflow-y-auto pointer-events-none">
          <div className="min-h-screen flex flex-col pb-32">
            {/* Avatar Header */}
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

            {/* Chat messages area */}
            <div className="flex-1 w-full px-2 py-0 pointer-events-none">
              <div className="mx-auto max-w-7xl w-full pointer-events-auto">
                <AnimatePresence mode="wait">
                  {presetReply ? (
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
                      <SimplifiedChatView message={currentAIMessage} isLoading={isLoading} addToolResult={addToolResult} />
                      
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

      {/* Bottom Bar */}
      <ClientOnly>
        <div className="fixed top-0 left-0 right-0 z-[500] pb-4 pt-2">
          <div className="container mx-auto max-w-3xl px-4">
            <div className="relative flex flex-col items-center gap-3">
              <HelperBoost submitQuery={submitQuery} setInput={setInput} handlePresetReply={handlePresetReply} />
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