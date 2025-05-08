// components/dashboard/HackerRank/hackerRankUtils.ts

/**
 * Get starter code based on selected language
 */
export const getStarterCode = (language: string, challengeName?: string, exampleInput?:string): string => {
    const functionName = challengeName 
      ? challengeName.toLowerCase().replace(/[^a-z0-9]/g, '_')
      : 'solution';
    const Input = exampleInput ? exampleInput : 'input'
    
    switch (language) {
      case 'javascript':
        return `// Write your solution for ${challengeName || 'this challenge'}\nfunction ${functionName}(input) {\n  // Your code here\n}\n`;
      case 'python':
        return `# Write your solution for ${challengeName || 'this challenge'}\ndef ${functionName}(${Input}):\n    # Your code here\n    pass\n`;
      case 'java':
        return `// Write your solution for ${challengeName || 'this challenge'}\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}\n`;
      case 'cpp':
        return `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution for ${challengeName || 'this challenge'}\n    return 0;\n}\n`;
      case 'csharp':
        return `using System;\n\nclass Solution {\n    static void Main(string[] args) {\n        // Write your solution for ${challengeName || 'this challenge'}\n    }\n}\n`;
      default:
        return `// Write your solution for ${challengeName || 'this challenge'}`;
    }
  };
  
  /**
   * Language options for the dropdown
   */
  export const LANGUAGE_OPTIONS = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' }
  ];
  
  /**
   * Difficulty options for the dropdown
   */
  export const DIFFICULTY_OPTIONS = [
    { value: 'any', label: 'Any Difficulty' },
    { value: 'Easy', label: 'Easy' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Hard', label: 'Hard' }
  ];
  
  /**
   * Map difficulty levels to colors
   */
  export const DIFFICULTY_COLOR_MAP = {
    'easy': 'bg-green-100 text-green-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'hard': 'bg-red-100 text-red-800'
  };