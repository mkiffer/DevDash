// services/stackOverflowService.ts
import axios from 'axios';

import { API_BASE_URL } from './apiConfig';

export interface StackOverflowResponse {
  items: any[];
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
    const response = await axios.get(`${API_BASE_URL}/search`, {
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
    throw new Error('Failed to search Stack Overflow');
  }
};

export const getQuestionAnswers = async (
  questionId: number,
  page = 1
): Promise<StackOverflowResponse> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/questions/${questionId}/answers`,
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
    throw new Error('Failed to fetch answers');
  }
};

export const getQuestionDetails = async (
  questionId: number
): Promise<StackOverflowResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/questions/${questionId}`);
    return response.data;
  } catch (error) {
    console.error('Question fetch error:', error);
    throw new Error('Failed to fetch question details');
  }
};