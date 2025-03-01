// services/aiChatService.ts
import { ChatMessage, APIResponse } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1/chat';

export const chatService = {
  async sendMessage(message: string): Promise<APIResponse<ChatMessage>> {
    try {
      // Adding trailing slash to prevent redirect
      const response = await fetch(`${API_BASE_URL}/`, {
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
      console.log('Raw response data:', data); // Debug log

      // Handle the case where data might be null
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
      const response = await fetch(`${API_BASE_URL}/history`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data: data.data.messages || [],
        status: response.status,
      };
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  },

  async clearHistory(): Promise<APIResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/clear`, {
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