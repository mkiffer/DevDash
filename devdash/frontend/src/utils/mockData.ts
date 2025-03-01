import { CodeProblem, ChatMessage, StackOverflowResult } from "../types";

export const mockProblems: CodeProblem[] = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    starterCode: "def solution(nums: list[int], target: int) -> list[int]:\n    # Your code here\n    pass"
  }
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    content: "Hello! How can I help you with your coding today?",
    timestamp: new Date()
  },
  {
    id: 2,
    role: "user",
    content: "Can you help me understand time complexity?",
    timestamp: new Date()
  }
];


export const mockStackOverflowResults: StackOverflowResult[] = [
  {
    question_id: 503093,
    title: "How to center a div horizontally and vertically?",
    body: "I'm trying to center a div both horizontally and vertically within its parent container. I've tried using margin: auto but it only works horizontally...",
    score: 15342,
    answer_count: 42,
    tags: ["html", "css", "flexbox", "centering", "css-layout"],
    link: "https://stackoverflow.com/questions/503093/how-to-center-a-div"
  },
  {
    question_id: 4037212,
    title: "React.useEffect is calling twice on component mount",
    body: "I noticed that my useEffect hook is being called twice when my component mounts. This is causing issues with my API calls...",
    score: 2891,
    answer_count: 16,
    tags: ["javascript", "reactjs", "hooks", "useeffect"],
    link: "https://stackoverflow.com/questions/4037212/react-useeffect-calling-twice"
  },
  {
    question_id: 7157999,
    title: "How to handle Python environment variables in FastAPI?",
    body: "I'm building a FastAPI application and need to manage environment variables securely. What's the best practice for handling .env files?",
    score: 1234,
    answer_count: 8,
    tags: ["python", "fastapi", "environment-variables", "configuration"],
    link: "https://stackoverflow.com/questions/7157999/python-environment-variables-fastapi"
  },
  {
    question_id: 6089972,
    title: "Understanding Tailwind CSS responsive breakpoints",
    body: "I'm new to Tailwind CSS and struggling to understand how the responsive breakpoints work. How do I properly use sm:, md:, and lg: prefixes?",
    score: 892,
    answer_count: 12,
    tags: ["css", "tailwindcss", "responsive-design"],
    link: "https://stackoverflow.com/questions/6089972/tailwind-responsive-breakpoints"
  },
  {
    question_id: 9012385,
    title: "TypeScript interface vs type alias",
    body: "What's the difference between using an interface and a type alias in TypeScript? When should I use one over the other?",
    score: 3456,
    answer_count: 25,
    tags: ["typescript", "interface", "type-system"],
    link: "https://stackoverflow.com/questions/9012385/typescript-interface-vs-type"
  }
];