import { ChatSessionPreview } from '../../../types';

const PREVIEW_LENGTH = 50;
// 'New Conversation' is set locally for a new session, and 'Empty conversation'
// comes from the backend for a session with no messages.
const PLACEHOLDER_PREVIEWS = ['New Conversation', 'Empty conversation'];

/**
 * Applies a sent message to the session list without asking the backend for it
 * again. The result mirrors GET /chat/sessions: most recently updated first, with
 * a preview taken from the session's first message.
 */
export const updateSessionsAfterMessage = (
  sessions: ChatSessionPreview[],
  sessionId: string,
  messageContent: string,
  sentAt: Date
): ChatSessionPreview[] => {
  const activeSession = sessions.find(session => session.id === sessionId);
  if (!activeSession) return sessions;

  const isFirstMessage = PLACEHOLDER_PREVIEWS.includes(activeSession.preview);
  const updatedSession: ChatSessionPreview = {
    ...activeSession,
    updated_at: sentAt,
    preview: isFirstMessage
      ? `${messageContent.slice(0, PREVIEW_LENGTH)}...`
      : activeSession.preview,
  };

  return [updatedSession, ...sessions.filter(session => session.id !== sessionId)];
};
