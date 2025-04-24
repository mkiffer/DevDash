// services/aiChatService.ts
import { ChatMessage, APIResponse, ChatSession } from '../types';
import { API_BASE_URL } from './apiConfig';
import { apiRequest } from './apiService';

export const chatService = {
  // Session management
  async createSession(): Promise<APIResponse<{ session_id: string }>> {
    try {
      
      const data = await apiRequest<any>('/chat/sessions', 'POST');
      console.log('Session created successfully:', data);
      
      return {
        data: data.data,
        status: 200,
      };
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  },

  async listSessions(): Promise<APIResponse<ChatSession[]>> {
    try {
      const data = await apiRequest<any>('/chat/sessions');

      return {
        data: data.data.sessions || [],
        status: 200,
      };

    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      throw error;
    }
  },

  async getSession(sessionId: string): Promise<APIResponse<{session: ChatSession}>> {
    try {
      const data = await apiRequest<any>(`/chat/sessions/${sessionId}`);
      return {
        data: data.data,
        status: 200,
      };
    } catch (error) {
      console.error(`Error fetching session ${sessionId}:`, error);
      throw error;
    }
  },

  async deleteSession(sessionId: string): Promise<APIResponse<any>> {
    try {
      const data = await apiRequest<any>(`/chat/sessions/${sessionId}`, 'DELETE');
      return {
        data: data.data,
        status: 200,
      };

    } catch (error) {
      console.error(`Error deleting session ${sessionId}:`, error);
      throw error;
    }
  },

  // Message handling within sessions
  async sendMessageToSession(sessionId: string, message: string): Promise<APIResponse<ChatMessage>> {
    
    try {
      const data = await apiRequest<any>(
        `/chat/sessions/${sessionId}/messages/`, 
        'POST',
        {message: message}
      );
      return {
        data: data.data.message,
        status: 200,
      };

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
}