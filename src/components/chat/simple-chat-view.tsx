'use client';

import {
  ChatBubble,
  ChatBubbleMessage,
} from '../ui/chat/chat-bubble';
import { UIMessage } from 'ai';
import { motion } from 'framer-motion';
import ChatMessageContent from './chat-message-content';
import ToolRenderer from './tool-renderer';

interface SimplifiedChatViewProps {
  message: UIMessage;
  isLoading: boolean;
}

const MOTION_CONFIG = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: {
    duration: 0.3,
  },
};

export function SimplifiedChatView({
  message,
  isLoading,
}: SimplifiedChatViewProps) {
  if (message.role !== 'assistant') return null;

  // Extract tool invocations that are in "result" state
  const toolInvocations =
    message.parts
      ?.filter((part) => part.type === 'tool-result')
      .map((part) => part) || [];

  // Only display the first tool (if any)
  const currentTool = toolInvocations.length > 0 ? [toolInvocations[0]] : [];

  // Check if we have meaningful text content
  const textContent = message.parts
    ?.filter((part) => part.type === 'text')
    .map((part) => part.type === 'text' ? part.text : '')
    .join('') || '';
  
  const hasTextContent = textContent.trim().length > 0;
  const hasTools = currentTool.length > 0;
  
  // For text-only responses (like Devin mode), always show text
  // For tool responses, show text if it's substantial (> 50 chars)
  const showTextContent = hasTextContent && (!hasTools || textContent.trim().length > 50);

  console.log('SimplifiedChatView:', { 
    hasTools, 
    hasTextContent, 
    showTextContent,
    textLength: textContent.length 
  });

  return (
    <motion.div {...MOTION_CONFIG} className="flex h-full w-full flex-col px-4">
      {/* Single scrollable container for both tool and text content */}
      <div className="custom-scrollbar flex h-full w-full flex-col overflow-y-auto">
        {/* Tool invocation result - displayed at the top */}
        {hasTools && (
          <div className="mb-4 w-full">
            <ToolRenderer
              toolInvocations={currentTool}
              messageId={message.id || 'current-msg'}
            />
          </div>
        )}

        {/* Text content - always show for text-only responses */}
        {showTextContent && (
          <div className="w-full">
            <ChatBubble variant="received" className="w-full">
              <ChatBubbleMessage className="w-full">
                <ChatMessageContent
                  message={message}
                  isLast={true}
                  isLoading={isLoading}
                  skipToolRendering={true}
                />
              </ChatBubbleMessage>
            </ChatBubble>
          </div>
        )}

        {/* Loading state when no content yet */}
        {!hasTextContent && !hasTools && isLoading && (
          <div className="w-full">
            <ChatBubble variant="received" className="w-full">
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          </div>
        )}

        {/* Add some padding at the bottom for better scrolling experience */}
        <div className="pb-4"></div>
      </div>
    </motion.div>
  );
}