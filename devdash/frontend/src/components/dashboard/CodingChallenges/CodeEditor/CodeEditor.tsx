import React from 'react';
import Editor, {DiffEditor, useMonaco, loader} from '@monaco-editor/react'

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  language: string;
  theme: string;
  options: any;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, language, theme, options }) => {
  const handleChange = (value: string | undefined) => {
    onChange(value || '');
  };
  return (
    
    <Editor 
    height = "90vh" 
    language={language} 
    value={code} 
    onChange={handleChange}
    theme = {theme}
    options = {options}
    />

    
    
  );
};