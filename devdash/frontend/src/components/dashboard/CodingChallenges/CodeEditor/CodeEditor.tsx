// mkiffer/devdash/DevDash-481fb7860a2af2f6654500d4175c6f63f23cc3a7/devdash/frontend/src/components/dashboard/CodingChallenges/CodeEditor/CodeEditor.tsx
import React from 'react';
import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: string;
  isDarkMode: boolean;
  options: any;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, language, isDarkMode, options }) => {
  const handleChange = (value: string | undefined) => {
    onChange(value || '');
  };
  return (
    <Editor
      height="100%"
      language={language}
      value={code}
      onChange={handleChange}
      theme={isDarkMode ? 'vs-dark' : 'light'}
      options={options}
    />
  );
};