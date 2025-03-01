import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Code2, MessageSquare, Search, Award } from 'lucide-react';
import { CodePlayground } from '../components/dashboard/CodePlayground';
import { AIChat } from '../components/dashboard/AIChat';
import { StackOverflowSearch } from '../components/dashboard/StackOverflowSearch';
import { HackerRankProblems } from '../components/dashboard/HackerRank/index'

const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-8 text-left">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Developer Workspace
          </h1>
          <p className="text-lg text-muted-foreground">
            Your all-in-one coding environment
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Code Playground Card */}
          <Card className="min-h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Code2 className="h-6 w-6" />
                Code Playground
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <CodePlayground />
            </CardContent>
          </Card>

          {/* AI Chat Card */}
          <Card className="min-h-[600px] flex flex-col">
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
          <Card className="min-h-[600px] flex flex-col">
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
          {/* HackerRank Challenges Card */}
          <Card className="min-h-[600px] flex flex-col xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Award className="h-6 w-6" />
                HackerRank Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <HackerRankProblems />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;