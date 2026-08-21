'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { askSystemPrompt } from '@/lib/config-loader';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_PROMPTS = [
  "Why would a hiring manager take a chance on someone who writes novels AND developer docs?",
  "What makes Chris different from every other content strategist with a Sentry case study?",
  "Tell me something about Chris that his resume can't tell me.",
  "Why should an engineering team care about content strategy?",
  "What's the riskiest thing Chris has done professionally?",
  "How does someone who writes fiction write better technical content?",
];

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current && messages.length > 0) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (query: string) => {
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: query }],
          system: askSystemPrompt,
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);

      const data = await res.json();

      let text = '';
      if (Array.isArray(data)) {
        text = data[0]?.content ?? '';
      } else {
        text = data?.content ?? data?.text ?? '';
      }

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content: text },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Something went wrong. Try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const reset = () => {
    setMessages([]);
    setInput('');
    inputRef.current?.focus();
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#5e4631]/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-[#5e4631] text-lg font-medium tracking-tight">Chris Heher</h1>
          <p className="text-[#5e4631]/50 text-xs mt-0.5">
            author · copywriter · content strategist · devrel
          </p>
        </div>
        {!isEmpty && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-xs text-[#5e4631]/50 hover:text-[#5e4631] transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            reset
          </button>
        )}
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {isEmpty ? (
          <div className="max-w-2xl mx-auto">
            <p className="text-[#5e4631]/40 text-sm mb-8 leading-relaxed">
              You&apos;re talking to Byron Chianti — a character from <em>The Floating Studio</em> who has opinions about Chris&apos;s work and isn&apos;t shy about sharing them.
            </p>
            <div className="grid gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left px-4 py-3 rounded-lg border border-[#5e4631]/12 bg-white hover:border-[#5e4631]/30 hover:bg-[#5e4631]/5 transition-all text-sm text-[#5e4631]/70 hover:text-[#5e4631]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={
                  msg.role === 'user'
                    ? 'flex justify-end'
                    : 'flex justify-start'
                }
              >
                {msg.role === 'user' ? (
                  <div className="bg-[#1d1102] text-[#dcd3c3] rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] text-sm leading-relaxed">
                    {msg.content}
                  </div>
                ) : (
                  <div className="text-[#3a2a1a] text-sm leading-relaxed max-w-[88%] whitespace-pre-wrap">
                    {msg.content}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-1 items-center py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5e4631]/30 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5e4631]/30 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5e4631]/30 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[#5e4631]/10 px-6 py-4 bg-[#faf8f5]">
        <form onSubmit={onSubmit} className="max-w-2xl mx-auto">
          <div className="flex rounded-full border border-[#5e4631]/20 bg-white shadow-sm focus-within:border-[#5e4631]/40 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLoading ? 'Thinking...' : 'Ask something…'}
              disabled={isLoading}
              className="flex-1 bg-transparent px-5 py-3.5 text-sm text-[#3a2a1a] placeholder:text-[#5e4631]/30 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex items-center justify-center rounded-full bg-[#3a2a1a] m-1 px-4 text-white disabled:opacity-30 transition-opacity hover:bg-[#5e4631]"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
