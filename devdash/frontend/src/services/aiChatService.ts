// services/aiChatService.ts
import { ChatMessage, APIResponse, ChatSession } from '../types';
import { API_BASE_URL } from './apiConfig';

export const chatService = {
  // Session management
  async createSession(): Promise<APIResponse<{ session_id: string }>> {
    try {
      console.log('Creating new session at URL:', `${API_BASE_URL}/chat/sessions`);
      
      const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Log response details for debugging
      console.log('Session creation response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Session created successfully:', data);
      
      return {
        data: data.data,
        status: response.status,
      };
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  },

  async listSessions(): Promise<APIResponse<ChatSession[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data: data.data.sessions || [],
        status: response.status,
      };
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      throw error;
    }
  },

  async getSession(sessionId: string): Promise<APIResponse<{session: ChatSession}>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data: data.data,
        status: response.status,
      };
    } catch (error) {
      console.error(`Error fetching session ${sessionId}:`, error);
      throw error;
    }
  },

  async deleteSession(sessionId: string): Promise<APIResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data: data.data,
        status: response.status,
      };
    } catch (error) {
      console.error(`Error deleting session ${sessionId}:`, error);
      throw error;
    }
  },

  // Message handling within sessions
  async sendMessageToSession(sessionId: string, message: string): Promise<APIResponse<ChatMessage>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId, message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data?.data?.message) {
        throw new Error('Invalid response format from server');
      }

      return {
        data: data.data.message,
        status: response.status,
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Backward compatibility methods
  async sendMessage(message: string): Promise<APIResponse<ChatMessage>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data?.data?.message) {
        throw new Error('Invalid response format from server');
      }

      return {
        data: data.data.message,
        status: response.status,
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async getChatHistory(): Promise<APIResponse<ChatMessage[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/history`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data: data.data.session.messages || [],
        status: response.status,
      };
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  },

  async clearHistory(): Promise<APIResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/clear`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data: data.data,
        status: response.status,
      };
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  }
};