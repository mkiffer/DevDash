// components/dashboard/AIChat/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../../../types';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { chatService } from '../../../services/aiChatService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await chatService.getChatHistory();
      console.log('Chat history response:', response);
      if (response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (content: string) => {
    const newUserMessage: ChatMessage = {
      id: messages.length + 1,
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(content);
      console.log('AI response:', response); // Debug log
      
      if (response.data) {
        setMessages(prev => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await chatService.clearHistory();
      setMessages([]);
      toast({
        title: "Success",
        description: "Chat history cleared",
      });
    } catch (error) {
      console.error('Error clearing history:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat history",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end p-2 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearHistory}
          className="text-gray-500 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear History
        </Button>
      </div>
      <MessageList 
        messages={messages} 
        isLoading={isLoading} 
      />
      <div ref={messagesEndRef} />
      <ChatInput 
        onSend={handleSendMessage} 
        disabled={isLoading} 
      />
    </div>
  );
};