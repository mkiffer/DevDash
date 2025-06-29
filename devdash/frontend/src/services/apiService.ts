import { API_BASE_URL } from './apiConfig';

/**
 * Generic API request function with authentication
 * @param endpoint - API endpoint (without base URL)
 * @param method - HTTP method (GET, POST, PUT, DELETE)
 * @param data - Optional data to send with the request
 * @param customOptions - Additional fetch options
 */
export const apiRequest = async<T>(
    endpoint: string,
    method: string = 'GET',
    data?: any,

) : Promise<T> => {
    


    const options: RequestInit = {
        method,
        // CRITICAL: This tells the browser to send cookies with the request.
        credentials: 'include', 
        headers: {}, // Start with empty headers
    };


    // Correctly handle body and Content-Type
    if (data) {
        if (data instanceof FormData) {
            // If data is FormData, we don't set the Content-Type header.
            // The browser does it automatically with the correct boundary.
            options.body = data;
        } else if (['POST', 'PUT', 'PATCH'].includes(method)) {
            // For regular objects, we stringify and set the correct header.
            (options.headers as Record<string, string>)['Content-Type'] = 'application/json';
            options.body = JSON.stringify(data);
        }
    }

    //const fetchOptions = createAuthFetchOptions(options);

    try{
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        if (!response.ok){


            const errorData = await response.json().catch(()=> null);
            throw new Error(
                errorData?.message ||
                `API request failed: ${response.status} ${response.statusText}`);
            
        } 

        return response.json();
    } catch(error){
        console.error(`API request error for ${endpoint}:`, error);
        throw error;
    }

};