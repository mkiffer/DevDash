import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from "lucide-react";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  onSearch,
  isLoading
}) => {
  // Local state to track input value
  const [inputValue, setInputValue] = useState(query);

  // Update local state when prop changes
  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only trigger search if there's actual input
    if (inputValue.trim()) {
      onSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onQueryChange(newValue);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4 p-[1-px]">
      <div className="flex-1 relative overflow-visible">
        <Input 
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Search Stack Overflow..."
          className="pr-10 w-full z-10"
          style={{ display: 'block' }}
        />
        <Search className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      
      <Button
        type="submit"
        disabled={isLoading || !inputValue.trim()}
        variant="default"
        className="min-w-[100px]"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
            Searching
          </span>
        ) : (
          'Search'
        )}
      </Button>
    </form>
  );
};