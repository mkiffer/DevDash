// services/stackOverflowService.ts
import axios from 'axios';

import { API_BASE_URL } from './apiConfig';
import type { StackOverflowResult } from '../types';

// An answer as returned by /stackoverflow/questions/:id/answers.
export interface StackOverflowAnswer {
  answer_id: number;
  body: string;
  score: number;
  is_accepted: boolean;
  creation_date: string;
  owner: {
    display_name: string;
    reputation: number;
  };
}

// The Stack Exchange envelope is the same for every endpoint; only the element
// type of `items` changes, so callers pick it via TItem.
export interface StackOverflowResponse<TItem = StackOverflowResult> {
  items: TItem[];
  has_more: boolean;
  quota_max: number;
  quota_remaining: number;
}

export const searchStackOverflow = async (
  query: string,
  page = 1,
  tags?: string
): Promise<StackOverflowResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stackoverflow/search`, {
      params: {
        query,
        page,
        pagesize: 10,
        tags,
        sort: 'votes'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Failed to search Stack Overflow', { cause: error });
  }
};

export const getQuestionAnswers = async (
  questionId: number,
  page = 1
): Promise<StackOverflowResponse<StackOverflowAnswer>> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/stackoverflow/questions/${questionId}/answers`,
      {
        params: {
          page,
          pagesize: 30,
          sort: 'votes'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Answer fetch error:', error);
    throw new Error('Failed to fetch answers', { cause: error });
  }
};

export const getQuestionDetails = async (
  questionId: number
): Promise<StackOverflowResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stackoverflow/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error('Question fetch error:', error);
    throw new Error('Failed to fetch question details', { cause: error });
  }
};
