// components/dashboard/AIChat/SessionList.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { SessionListProps } from '../../../types';
import { formatDistanceToNow } from 'date-fns';

export const SessionList: React.FC<SessionListProps> = ({ 
  sessions, 
  activeSessionId, 
  onSelectSession, 
  onCreateSession,
  onDeleteSession
}) => {
  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-2 border-b flex justify-between items-center">
        <h3 className="text-sm font-medium">Chat Sessions</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateSession}
          title="Start new chat"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {sessions?.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No chat sessions yet.
            <br />
            Click the + to create one.
          </div>
        ) : (
          <ul className="divide-y">
            {sessions?.map((session) => (
              <li key={session.id} className="relative">
                <button
                  onClick={() => onSelectSession(session.id)}
                  className={`w-full text-left p-3 hover:bg-gray-100 dark:bg-gray-800 transition-colors ${
                    activeSessionId === session.id ? 'bg-blue-50 dark:bg-gray-700' : ''
                  }`}
                >
                  <div className="text-sm font-medium truncate">{session.preview}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="absolute right-2 top-3 text-gray-400 hover:text-red-500"
                  title="Delete session"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};