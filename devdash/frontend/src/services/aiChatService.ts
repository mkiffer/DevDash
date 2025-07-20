// services/aiChatService.ts
import { ChatMessage, APIResponse, ChatSession } from '../types';
import { API_BASE_URL } from './apiConfig';
import { apiRequest } from './apiService';

import {
  CreateSessionPayload,
  SendMessagePayload,
  ChatSessionPreview
} from '../types';

export const chatService = {
    /**
   * Creates a new chat session.
   */
  createSession(): Promise<APIResponse<CreateSessionPayload>> {
    return apiRequest('/chat/sessions', 'POST');
  },

  /**
   * Retrieves a list of all chat sessions with previews.
   */
  listSessions(): Promise<APIResponse<{ sessions: ChatSessionPreview[] }>> {
    return apiRequest('/chat/sessions', 'GET');
  },

  /**
   * Retrieves a single, full chat session including all its messages.
   */
  getSession(sessionId: string): Promise<APIResponse<{ session: ChatSession }>> {
    return apiRequest(`/chat/sessions/${sessionId}`, 'GET');
  },

  /**
   * Deletes a specific chat session.
   */
  deleteSession(sessionId: string): Promise<APIResponse<null>> {
    return apiRequest(`/chat/sessions/${sessionId}`, 'DELETE');
  },

  /**
   * Sends a message to a specific session and gets the AI's response.
   */
  sendMessageToSession(sessionId: string, message: string): Promise<APIResponse<SendMessagePayload>> {
    return apiRequest(`/chat/sessions/${sessionId}/messages`, 'POST', { message });
  },
}