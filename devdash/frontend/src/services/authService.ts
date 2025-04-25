import { API_BASE_URL } from "./apiConfig";

export interface User {
    username: string;
    email: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest{
    email: string;
    username: string;
    password: string;
}

export interface AuthResponse{
    access_token: string;
    token_type: string;
}

export const authService ={
    async login(credentials: LoginRequest): Promise<AuthResponse>{
        //Create form data (FastAPI expects form data for OAuth2)
        const formData = new FormData();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        const response = await fetch(`${API_BASE_URL}/auth/token`,{
            method: 'POST',
            body: formData

        });

        if (!response.ok){
            throw new Error('Login failed');
        }
        
        return response.json();

    },

    async register(userData: RegisterRequest): Promise<AuthResponse>{
        const response = await fetch(`${API_BASE_URL}/auth/register`,{
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok){
            throw new Error('Registration failed');
        }
        return response.json();
    },

    async getUserProfile(): Promise<User>{
        const token = localStorage.getItem('token');

        if(!token){
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${API_BASE_URL}/auth/me`,{
            headers: {
                'Authorization': `Bearer ${token}`
              }
        });

        if (!response.ok) {
            throw new Error('Failed to get user profile');
          }
        
        return response.json();
    },

    getAuthHeader() {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
      },
      
      logout() {
        localStorage.removeItem('token');
      }    
};