/**
 * Tests for: updateSessionsAfterMessage, the local replacement for reloading the
 * session list after every chat message.
 * Coverage intent: the local result must match what GET /chat/sessions would
 * return, which is newest first, with a preview built from the first message.
 */
import { describe, expect, it } from 'vitest';
import { ChatSessionPreview } from '@/types';
import { updateSessionsAfterMessage } from '../sessionPreviews';

const buildSession = (id: string, preview: string): ChatSessionPreview => ({
  id,
  preview,
  user_id: 1,
  created_at: new Date('2026-01-01'),
  updated_at: new Date('2026-01-01'),
});

const sentAt = new Date('2026-06-01');

describe('updateSessionsAfterMessage', () => {
  it('moves the active session to the top and updates its timestamp', () => {
    const sessions = [buildSession('older', 'Older...'), buildSession('active', 'First...')];

    const updated = updateSessionsAfterMessage(sessions, 'active', 'Hello', sentAt);

    expect(updated.map(session => session.id)).toEqual(['active', 'older']);
    expect(updated[0].updated_at).toEqual(sentAt);
  });

  it('keeps the existing preview, which always shows the first message', () => {
    const sessions = [buildSession('active', 'First message...')];

    const [updated] = updateSessionsAfterMessage(sessions, 'active', 'A later message', sentAt);

    expect(updated.preview).toBe('First message...');
  });

  it.each(['New Conversation', 'Empty conversation'])('replaces the %j placeholder', placeholder => {
    const sessions = [buildSession('active', placeholder)];

    const [updated] = updateSessionsAfterMessage(sessions, 'active', 'x'.repeat(60), sentAt);

    // Same format as the backend: the first 50 characters followed by an ellipsis.
    expect(updated.preview).toBe(`${'x'.repeat(50)}...`);
  });

  it('leaves the list unchanged when the session is not in it', () => {
    const sessions = [buildSession('other', 'Other...')];

    expect(updateSessionsAfterMessage(sessions, 'missing', 'Hello', sentAt)).toEqual(sessions);
  });
});
