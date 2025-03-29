// services/hackerRankService.ts
import { APIResponse } from '../types';

import { API_BASE_URL } from './apiConfig';

export interface HackerRankChallenge {
  id: string;
  slug: string;
  name: string;
  preview: string;
  body: string;
  difficulty: string; // Easy, Medium, Hard
  category: string;
  max_score: number;
  languages: string[];
  testcases?: Array<{
    input: string;
    output: string;
  }>;
}

export interface HackerRankSubmission {
  id: string;
  status: string;
  score: number;
  results: Array<{
    status: string;
    stdout: string;
    stderr: string;
    expected_output: string;
    actual_output: string;
  }>;
}

export const hackerRankService = {
  async getChallenges(
    page: number = 1,
    limit: number = 10, 
    difficulty?: string
  ): Promise<APIResponse<HackerRankChallenge[]>> {
    try {
      let url = `${API_BASE_URL}/hackerrank/challenges?page=${page}&limit=${limit}`;
      
      if (difficulty) {
        url += `&difficulty=${difficulty}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        data: data.data.problems,
        status: response.status
      };
    } catch (error) {
      console.error('Error fetching HackerRank challenges:', error);
      throw error;
    }
  },
  
  async getRandomChallenge(difficulty?: string): Promise<APIResponse<HackerRankChallenge>> {
    try {
      let url = `${API_BASE_URL}/hackerrank/challenges/random`;
      
      if (difficulty) {
        url += `?difficulty=${difficulty}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        data: data.data.problem,
        status: response.status
      };
    } catch (error) {
      console.error('Error fetching random HackerRank challenge:', error);
      throw error;
    }
  },
  
  async getChallenge(slug: string): Promise<APIResponse<HackerRankChallenge>> {
    try {
      const response = await fetch(`${API_BASE_URL}/hackerrank/challenges/${slug}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        data: data.data.problem,
        status: response.status
      };
    } catch (error) {
      console.error('Error fetching HackerRank challenge:', error);
      throw error;
    }
  },
  
  async submitSolution(
    challengeSlug: string, 
    code: string,
    language: string
  ): Promise<APIResponse<{id: string}>> {
    try {
      const response = await fetch(`${API_BASE_URL}/hackerrank/challenges/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challenge_slug: challengeSlug,
          code,
          language
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        data: data.data,
        status: response.status
      };
    } catch (error) {
      console.error('Error submitting HackerRank solution:', error);
      throw error;
    }
  },
  
  async getSubmissionResult(submissionId: string): Promise<APIResponse<HackerRankSubmission>> {
    try {
      const response = await fetch(`${API_BASE_URL}/hackerrank/submissions/${submissionId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        data: data.data.message,
        status: response.status
      };
    } catch (error) {
      console.error('Error fetching HackerRank submission result:', error);
      throw error;
    }
  }
};