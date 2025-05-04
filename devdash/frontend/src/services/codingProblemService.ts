import { APIResponse } from '../types';
import { API_BASE_URL } from './apiConfig';

export interface CodingProblem {
  id: number;
  title: string;
  slug: string;
  difficulty: string;
  description: string;
  example_cases: Array<{
    input: any;
    output: any;
  }>;
  starter_code?: Record<string, string>;
}

export interface SubmissionResult {
  status: string;
  results: Array<{
    test_case: number;
    passed: boolean;
    input: any;
    expected: any;
    actual?: any;
    error?: string;
  }>;
  score: number;
  message?: string;
  compile_output?: string;
  stdout?: string;
  stderr?: string;
}

export const codingProblemService = {
    ///I think problems by diffifulty is not yet implemented on the backend
    async getProblems(
        difficulty?: string
    ): Promise<APIResponse<CodingProblem[]>>{
        try{
            let url = `${API_BASE_URL}/coding/problems`;

            if(difficulty){
                url += `?difficulty=${difficulty}`;
            }

            const response = await fetch(url);

            if (!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();

            //handle response formats
            const problemsArray = responseData.data || responseData;

            return {
                data: problemsArray, 
                status: response.status

            };

        } catch(error){
            console.error('Error fetching coding problems:', error);
            throw error
        }
    },

    async getProblem(slug: string): Promise<APIResponse<CodingProblem>> {
        try{
            const response = await fetch(`${API_BASE_URL}/coding/problems/${slug}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              
              const data = await response.json();
              return {
                data,
                status: response.status
              };
            } catch (error) {
              console.error('Error fetching coding problem:', error);
              throw error;
            }
        },

    async submitSolution(
        slug: string,
        code: string,
        language: string
    ): Promise<APIResponse<SubmissionResult>>{
        try {
            const response = await fetch(`${API_BASE_URL}/coding/problems/${slug}/submit`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                code,
                language
              }),
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return {
              data,
              status: response.status
            };
          } catch (error) {
            console.error('Error submitting solution:', error);
            throw error;
          }
    },

    
}