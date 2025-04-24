import { API_BASE_URL } from './apiConfig';
/**
 * Creates fetch options with authentication headers
 */

export const createAuthFetchOptions = (options: RequestInit = {}): RequestInit => {
    const token = localStorage.getItem('token');
    const headers = {
        ...(options.headers as Record<string,string>)
    };

    if(token){
        headers["Authorization"] = `Bearer ${token}`;
    }

    return{
        ...options,
        headers,
    };
};

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
    customOptions: RequestInit = {}

) : Promise<T> => {
    
    const options: RequestInit = {
        method,
        ...customOptions,
    };

    if(data && ['POST', 'PUT', 'PATCH'].includes(method)){
        options.body = JSON.stringify(data);
    }

    const fetchOptions = createAuthFetchOptions(options);
    try{
        const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);

        if (!response.ok){

            if(response.status === 401){
                localStorage.removeItem('token');
                window.location.href = '/login';
            }

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