/**
 * Tests for: AIChat's request behaviour after sending a message.
 * Mocked: the chat service. Child components are real so the send path is exercised.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { chatService } from '@/services/aiChatService';
import { AIChat } from '../index';

vi.mock('@/services/aiChatService', () => ({
  chatService: {
    listSessions: vi.fn(),
    getSession: vi.fn(),
    sendMessageToSession: vi.fn(),
    createSession: vi.fn(),
    deleteSession: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.mocked(chatService.listSessions).mockResolvedValue({
    data: { sessions: [{
      id: 'session-1', user_id: 1, created_at: new Date(), updated_at: new Date(), preview: 'New Conversation',
    }] },
    status: 200,
  } as never);
  vi.mocked(chatService.getSession).mockResolvedValue({
    data: { session: { messages: [] } }, status: 200,
  } as never);
  vi.mocked(chatService.sendMessageToSession).mockResolvedValue({
    data: {
      user_message: { id: 1, role: 'user', content: 'Hello there', timestamp: new Date() },
      ai_response: { id: 2, role: 'assistant', content: 'Hi back', timestamp: new Date() },
    },
    status: 200,
  } as never);
});

describe('AIChat', () => {
  it('updates the session preview after sending without reloading the session list', async () => {
    render(<AIChat />);
    await waitFor(() => expect(chatService.getSession).toHaveBeenCalled());
    const messageInput = screen.getByPlaceholderText('Type your message...');
    await waitFor(() => expect(messageInput).toBeEnabled());

    fireEvent.change(messageInput, { target: { value: 'Hello there' } });
    fireEvent.keyDown(messageInput, { key: 'Enter' });

    await screen.findByText('Hi back');
    expect(await screen.findByText('Hello there...')).toBeInTheDocument();
    // Only the initial load: a reload here would add about 2 s after each message.
    expect(chatService.listSessions).toHaveBeenCalledTimes(1);
  });
});
