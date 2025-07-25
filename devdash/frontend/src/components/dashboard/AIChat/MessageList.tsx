// components/dashboard/AIChat/MessageList.tsx
import React, { memo, useEffect, useRef } from 'react';
import { ChatMessage } from '../../../types';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export const MessageListComponent: React.FC<MessageListProps> = ({ messages, isLoading }) => {
    // The ref and scroll logic now live inside this component.
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  // This effect will run whenever the `messages` array changes,
  // ensuring we always scroll down when a new message is added.
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4 min-h-0">
      {messages && messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] px-4 py-2 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
            }`}
          >
            <MarkdownRenderer content={message.content}/>
            {message?.timestamp && (
              <p className="text-xs mt-1 opacity-70">
                {new Date(message?.timestamp).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export const MessageList = memo(MessageListComponent)