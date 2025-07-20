// components/dashboard/AIChat/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatSessionPreview } from '../../../types';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { SessionList } from './SessionList';
import { chatService } from '../../../services/aiChatService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSessionPreview[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSessions, setShowSessions] = useState(true);
  const { toast } = useToast();

  const isInitialMount = useRef(true);


  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadSessions();
    }
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      loadSessionMessages(activeSessionId);
    } else {
      setMessages([]);
    }
  }, [activeSessionId]);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const response = await chatService.listSessions();
      const sessionsList = response.data?.sessions || [];
      setSessions(sessionsList);
      
      if (sessionsList.length > 0 && !activeSessionId) {
        setActiveSessionId(sessionsList[0].id);
      } else if (sessionsList.length === 0) {
        handleCreateSession(); 
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({ title: "Error", description: "Failed to load chat sessions", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessionMessages = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const response = await chatService.getSession(sessionId);
      setMessages(response.data.session?.messages || []);
    } catch (error) {
      console.error(`Error loading messages for session ${sessionId}:`, error);
      toast({ title: "Error", description: "Failed to load chat messages", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateSession = async () => {
    setIsLoading(true);
    try {
      const response = await chatService.createSession();
      const sessionData = response.data;
      
      // Create a preview for the new session to add to the list
      const newSessionPreview: ChatSessionPreview = {
        id: sessionData.session_id,
        user_id: sessionData.user_id, 
        created_at: new Date(sessionData.created_at), 
        updated_at: new Date(sessionData.created_at),
        preview: "New Conversation" 
      };
      
      setSessions(prev => [newSessionPreview, ...prev]);
      setActiveSessionId(newSessionPreview.id);
      setMessages([]);

    } catch (error) {
      console.error('Error creating new session:', error);
      toast({ title: "Error", description: "Failed to create new chat session", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to delete this chat session?')) {
      return;
    }
    setIsLoading(true);
    try {
      await chatService.deleteSession(sessionId);
      toast({ title: "Success", description: "Chat session deleted" });
      
      // After deleting, reload the session list
      const response = await chatService.listSessions();
      const sessionsList = response.data?.sessions || [];
      setSessions(sessionsList);
      
      if (activeSessionId === sessionId) {
        setActiveSessionId(sessionsList.length > 0 ? sessionsList[0].id : null);
      }
    } catch (error) {
      console.error(`Error deleting session ${sessionId}:`, error);
      toast({ title: "Error", description: "Failed to delete chat session", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeSessionId) return;
    
    const optimisticMessage: ChatMessage = {
      id: Math.random(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setIsLoading(true);

    try {
      const response = await chatService.sendMessageToSession(activeSessionId, content);
      const { user_message, ai_response } = response.data;
      
      // Replace optimistic message with server-confirmed messages
      setMessages(prev => [
        ...prev.filter(m => m.id !== optimisticMessage.id),
        user_message,
        ai_response
      ]);
      
      // Refresh session list to update the preview text
      const sessionsResponse = await chatService.listSessions();
      setSessions(sessionsResponse.data?.sessions || []);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
      // Roll back optimistic update
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSessionPanel = () => setShowSessions(!showSessions);

  return (
    <div className="flex h-full overflow-hidden">
      {showSessions && (
        <div className="w-50 border-r flex flex-col flex-shrink-0">
          <SessionList
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={setActiveSessionId}
            onCreateSession={handleCreateSession}
            onDeleteSession={handleDeleteSession}
          />
        </div>
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b p-2 flex items-center justify-between flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={toggleSessionPanel} className="mr-2">
            {showSessions ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </Button>
          <span className="text-sm font-medium flex-1">
            {activeSessionId ? 'Chat Session' : 'No Active Session'}
          </span>
          <Button variant="ghost" size="sm" onClick={handleCreateSession} className="text-blue-500">
            New Chat
          </Button>
        </div>
        
        <MessageList messages={messages} isLoading={isLoading} />
        
        <div className="flex-shrink-0">
            <ChatInput onSend={handleSendMessage} disabled={isLoading || !activeSessionId} />
        </div>
      </div>
    </div>
  );
};
