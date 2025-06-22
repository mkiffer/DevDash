// src/components/shared/MarkdownRenderer.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {

  return (
    <div className="prose dark:prose-invert max-w-none break-words">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};