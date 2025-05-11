import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MessageSquare, Search, Award } from 'lucide-react';
import { AIChat } from '../components/dashboard/AIChat';
import { StackOverflowSearch } from '../components/dashboard/StackOverflowSearch';
import { CodingProblemComponent } from '../components/dashboard/CodingChallenges/index'
import { useState, useEffect } from 'react'; // You already have these
import { Moon, Sun } from 'lucide-react'; // Add these for the toggle icons
import { useAuth } from '../contexts/AuthContext';
const DashboardLayout: React.FC = () => {
  // Add this inside your DashboardLayout component, before the return statement
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { logout } = useAuth();
  // Add this effect to apply/remove the dark class
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
            <button onClick={()=> logout()} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
              Log Out
            </button>
          </div>
          
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
        {/* Coding Challenges Card */}
          <Card className="min-h-[600px] flex flex-col xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Award className="h-6 w-6" />
                Coding Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <CodingProblemComponent isDarkMode = {isDarkMode}/>
            </CardContent>
          </Card>
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

  );
};

export default DashboardLayout;