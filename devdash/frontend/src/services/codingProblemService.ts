import { APIResponse } from '../types';
import { API_BASE_URL } from './apiConfig';
import { parseJsonResponse } from './apiService';

export interface CodingProblem {
  id: number;
  title: string;
  slug: string;
  difficulty: string;
  description: string;
  // Test-case values are arbitrary JSON decided by the problem, so they stay
  // opaque here; the UI renders them via JSON.stringify/String.
  example_cases: Array<{
    input: unknown;
    output: unknown;
  }>;
  starter_code?: Record<string, string>;
  example_input?:string
}

export interface SubmissionResult {
  status: string;
  results: Array<{
    test_case: number;
    passed: boolean;
    // Keyed by parameter name; the values themselves are problem-defined.
    input: Record<string, unknown>;
    expected: unknown;
    actual?: unknown;
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

            const responseData = await parseJsonResponse<
                { data?: CodingProblem[] } | CodingProblem[]
            >(response, '/coding/problems');

            //handle response formats
            const problemsArray = Array.isArray(responseData)
                ? responseData
                : responseData.data ?? [];

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

            const data = await parseJsonResponse<CodingProblem>(response, `/coding/problems/${slug}`);
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
            
            const data = await parseJsonResponse<SubmissionResult>(response, `/coding/problems/${slug}/submit`);
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