// src/components/shared/MarkdownRenderer.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{
          // This custom renderer targets <pre> elements (code blocks)
          pre: ({ node, ...props }) => (
            <pre
              {...props}
              // This class makes the code block scrollable horizontally
              // and adds some nice styling.
              className="overflow-x-auto bg-gray-800 text-white p-3 rounded-md"
            />
          ),
          // This part handles inline `code` snippets
          code: ({ node, ...props }) => (
            <code 
              {...props} 
              // Give inline code a slightly different background
              className="dark:bg-gray-700 rounded px-1 py-0.5"
            />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};