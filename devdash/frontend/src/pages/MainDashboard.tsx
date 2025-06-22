// mkiffer/devdash/DevDash-f5657d44b3ba0d7940a2b0c5813ec776c290147c/devdash/frontend/src/pages/MainDashboard.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { CodingProblemComponent } from '@/components/dashboard/CodingChallenges';
import { AIChat as AIChatComponent } from '@/components/dashboard/AIChat';
import { StackOverflowSearch as StackOverflowSearchComponent } from '@/components/dashboard/StackOverflowSearch';

const MainDashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex flex-col flex-1">
        <header className="p-4 border-b flex justify-between items-center bg-background">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">DevDash</h1>
            <h2 className="text-lg text-muted-foreground hidden md:block">Your all in one training dashboard</h2>
          </div>
          <Button onClick={toggleDarkMode} variant="outline" size="icon">
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </header>
        
        <main className="flex-1 p-4 overflow-auto bg-muted/40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">

            {/* --- Left Column: Coding Problems --- */}
            <div className="h-full min-h-[600px]">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Coding Problems</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                  <CodingProblemComponent isDarkMode={isDarkMode} />
                </CardContent>
              </Card>
            </div>

            {/* --- Right Column Wrapper --- */}
            <div className="flex flex-col gap-4 h-full min-h-[600px]">

              {/* AI Chat Card */}
              <div className="flex-1 min-h-0">
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>AI Assistant</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto">
                    <AIChatComponent/>
                  </CardContent>
                </Card>
              </div>

              {/* Stack Overflow Card */}
              <div className="flex-1 min-h-0">
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>Stack Overflow Search</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto">
                    <StackOverflowSearchComponent />
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainDashboard;