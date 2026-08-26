import { API_BASE_URL } from './apiConfig';

const JSON_CONTENT_TYPE = 'application/json';

/**
 * Turns FastAPI's error shape into a readable message.
 * Errors come back as {"detail": ...}, where detail is a string for ordinary
 * HTTPExceptions but an array of objects for 422 validation failures.
 */
const describeError = (errorData: unknown, response: Response): string => {
    const body = (errorData ?? {}) as { detail?: unknown; message?: unknown };
    const detail = body.detail;

    if (typeof detail === 'string') return detail;
    if (detail) return JSON.stringify(detail);
    if (typeof body.message === 'string') return body.message;

    return `API request failed: ${response.status} ${response.statusText}`;
};

/**
 * Parses a response that is expected to carry a JSON body.
 *
 * The content-type guard matters as much as the status check: a CDN or proxy can
 * return an HTML error page with a 200, which passes `response.ok` and then dies
 * inside `response.json()` as an opaque "Unexpected token '<'" SyntaxError. That
 * hides the real failure, so surface it explicitly instead.
 */
export const parseJsonResponse = async <T>(
    response: Response,
    endpoint: string
): Promise<T> => {
    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.includes(JSON_CONTENT_TYPE);

    if (!response.ok) {
        const errorData = isJson ? await response.json().catch(() => null) : null;
        throw new Error(describeError(errorData, response));
    }

    if (!isJson) {
        throw new Error(
            `Expected JSON from ${endpoint} but received "${contentType || 'no content-type'}" ` +
            `with status ${response.status}. The API may be unreachable or misrouted.`
        );
    }

    return response.json();
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
    data?: unknown,

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

    try{
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

        return await parseJsonResponse<T>(response, endpoint);
    } catch(error){
        console.error(`API request error for ${endpoint}:`, error);
        throw error;
    }

};
