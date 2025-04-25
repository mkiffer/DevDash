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

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSessionPreview[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSessions, setShowSessions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isInitialMount = useRef(true);
  const isCreatingSession = useRef(false);


  // Load sessions when component mounts
  useEffect(() => {
    console.log("AI chat component mounted");
    if (isInitialMount.current){
      isInitialMount.current = false;
      loadSessions();

    }

    return () => console.log("Chat componenet unmounted?")
  }, []);

  // Load messages when active session changes
  useEffect(() => {
    if (activeSessionId) {
      loadSessionMessages(activeSessionId);
    } else {
      setMessages([]);
    }
  }, [activeSessionId]);

  const loadSessions = async () => {
    if (isLoading) return;

    console.log('Loading sessions...');
    setIsLoading(true);

    try {
      
      const response = await chatService.listSessions();
      setSessions(response.data);
      //only set active session if we dont have one and theres data
      if (response.data.length > 0 && !activeSessionId) {
        setActiveSessionId(response.data[0].id);
      } else if (response.data.length === 0 && !activeSessionId && !isCreatingSession.current){
        createInitialSession();
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load chat sessions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createInitialSession = async () => {
    if (isCreatingSession.current) return;
  
    isCreatingSession.current = true;
    try {
      const response = await chatService.createSession();
      const newSessionId = response.data.session_id;
      
      // Set the ID without triggering loadSessions again
      setActiveSessionId(newSessionId);
      
      // Update the sessions list with the new session
      setSessions(prev => [{
        id: newSessionId,
        created_at: new Date(),
        updated_at: new Date(),
        preview: "New conversation"
      }, ...prev]);
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      isCreatingSession.current = false;
    }
  };

  const loadSessionMessages = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const response = await chatService.getSession(sessionId);
      if (response.data && response.data.session) {
        setMessages(response.data.session.messages || []);
      }
    } catch (error) {
      console.error(`Error loading messages for session ${sessionId}:`, error);
      toast({
        title: "Error",
        description: "Failed to load chat messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if(isLoading || isCreatingSession.current) return;

    isCreatingSession.current = true;
    setIsLoading(true);

    try {
      const response = await chatService.createSession();
      const newSessionId = response.data.session_id;
      
      //First update session list
      setSessions(prev => [{
        id: newSessionId,
        created_at: new Date(),
        updated_at: new Date(),
        preview: "New Conversation"
      }, ...prev]);

      
      
      // Set the new session as active
      setActiveSessionId(newSessionId);
      setMessages([]);
    } catch (error) {
      console.error('Error creating new session:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      isCreatingSession.current = false;
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to delete this chat session?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      await chatService.deleteSession(sessionId);
      
      // Refresh the session list
      const response = await chatService.listSessions();
      setSessions(response.data);
      
      // If the active session was deleted, set active to the first available or null
      if (activeSessionId === sessionId) {
        if (response.data.length > 0) {
          setActiveSessionId(response.data[0].id);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
      
      toast({
        title: "Success",
        description: "Chat session deleted",
      });
    } catch (error) {
      console.error(`Error deleting session ${sessionId}:`, error);
      toast({
        title: "Error",
        description: "Failed to delete chat session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to send a message to a specific session
  const sendMessageToSession = async (sessionId: string, content: string) => {
    const newUserMessage: ChatMessage = {
      id: Math.max(0, ...messages.map(m => m.id || 0)) + 1,
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await chatService.sendMessageToSession(sessionId, content);
      
      if (response.data) {
        setMessages(prev => [...prev, response.data]);
      }
      
      // Refresh sessions to update previews
      const sessionsResponse = await chatService.listSessions();
      setSessions(sessionsResponse.data);
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

  const handleSendMessage = async (content: string) => {
    // If no active session, create one first
    if (!activeSessionId) {
      try {
        setIsLoading(true);
        // Create a new session
        const response = await chatService.createSession();
        const newSessionId = response.data.session_id;
        
        // Set as active session
        setActiveSessionId(newSessionId);
        console.log("msg content: " + content)
        // Continue with sending the message using the new session ID
        await sendMessageToSession(newSessionId, content);
        return;
      } catch (error) {
        console.error('Error creating session for message:', error);
        toast({
          title: "Error",
          description: "Failed to create chat session",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    } else {
      // If we have an active session, send the message to it
      await sendMessageToSession(activeSessionId, content);
    }
  };

  const toggleSessionPanel = () => {
    setShowSessions(!showSessions);
  };

  return (
    <div className="flex h-full">
      {/* Session List Panel - conditionally shown */}
      {showSessions && (
        <div className="w-64 h-full">
          <SessionList
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={setActiveSessionId}
            onCreateSession={handleCreateSession}
            onDeleteSession={handleDeleteSession}
          />
        </div>
      )}
      
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col h-full">
        <div className="border-b p-2 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleSessionPanel}
            className="mr-2"
          >
            {showSessions ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
          </Button>
          
          <span className="text-sm font-medium flex-1">
            {activeSessionId ? 'Chat Session' : 'No Active Session'}
          </span>
          
          {activeSessionId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCreateSession()}
              className="text-blue-500"
            >
              New Chat
            </Button>
          )}
        </div>
        
        <MessageList 
          messages={messages} 
          isLoading={isLoading} 
        />
        <div ref={messagesEndRef} />
        <ChatInput 
          onSend={handleSendMessage} 
          disabled={isLoading || !activeSessionId} 
        />
      </div>
    </div>
  );
};