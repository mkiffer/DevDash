
export interface CodeProblem {
    id: number;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    description: string;
    examples: Array<{
      input: string;
      output: string;
      explanation: string;
    }>;
    starterCode: string;
  }
  
  export interface ChatMessage {
    id: number;
    role: 'assistant' | 'user';
    content: string;
    timestamp?: Date;
  }
  
  export interface StackOverflowResult {
    question_id: number;
    title: string;
    body: string
    score: number;
    answer_count: number;
    tags?: string[];
    link: string;
  }
  
  // API Response Types
  export interface APIResponse<T> {
    data: T;
    status: number;
    message?: string;
  }
  
  // Component Props Types
  export interface PanelProps {
    className?: string;
    children?: React.ReactNode;
  }
  
  export interface CodeEditorProps {
    code: string;
    onChange: (value: string) => void;
    language?: string;
  }
  
  export interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
  }
  
  export interface SearchBarProps {
    onSearch: (query: string) => void;
    isLoading?: boolean;
  }

  export interface APIResponse<T = any> {
    data: T;
    status: number;
    message?: string;
  }
  

  // Chat session preview for the session list
  export interface ChatSessionPreview {
    id: string;
    created_at: Date;
    updated_at: Date;
    preview: string;
  }
  
  // Full chat session with messages
  export interface ChatSession {
    id: string;
    created_at: Date;
    updated_at: Date;
    preview: string;
    messages: ChatMessage[];
  }
  
  // Props for the chat input component
  export interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
  }
  
  // Props for the session list component
  export interface SessionListProps {
    sessions: ChatSessionPreview[];
    activeSessionId: string | null;
    onSelectSession: (sessionId: string) => void;
    onCreateSession: () => void;
    onDeleteSession: (sessionId: string) => void;
  }

  export interface User {
      username: string;
      email: string;
  }
  
  export interface LoginRequest {
      username: string;
      password: string;
  }
  
  export interface RegisterRequest{
      email: string;
      username: string;
      password: string;
  }