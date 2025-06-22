import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MessageSquare, Search, Award } from 'lucide-react';
import { AIChat } from '../components/dashboard/AIChat';
import { StackOverflowSearch } from '../components/dashboard/StackOverflowSearch';
import { CodingProblemComponent } from '../components/dashboard/CodingChallenges/index'
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex justify-between items-start">
        <div className="text-left">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Developer Workspace
          </h1>
          <p className="text-lg text-muted-foreground">
            Your all-in-one coding environment
          </p>
        </div>
        
        <div className='flex gap-2'>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button onClick={() => logout()} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
            Log Out
          </button>
        </div>
      </div>

      {/* --- Main Grid (Layout Modified Here) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* --- Left Column: Coding Challenges --- */}
        <div className="h-full">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Award className="h-6 w-6" />
                Coding Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <CodingProblemComponent isDarkMode={isDarkMode} />
            </CardContent>
          </Card>
        </div>

        {/* --- Right Column Wrapper --- */}
        <div className="flex flex-col gap-6">
          {/* AI Chat Card */}
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageSquare className="h-6 w-6" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <AIChat />
            </CardContent>
          </Card>

          {/* Stack Overflow Card */}
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Search className="h-6 w-6" />
                Stack Overflow Search
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <StackOverflowSearch />
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
};

export default DashboardLayout;