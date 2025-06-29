import { API_BASE_URL } from "./apiConfig";
import {apiRequest} from "./apiService"

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


export const authService ={
    async login(credentials: LoginRequest): Promise<void>{
        //Create form data (FastAPI expects form data for OAuth2)
        const formData = new FormData();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);
        
        await apiRequest('/auth/token', "POST" ,formData)
        

    },

    async register(userData: RegisterRequest): Promise<void>{
        const formData = new FormData();

        formData.append('email', userData.email);
        formData.append('username', userData.username);
        formData.append('password', userData.password);
    },

    async getCurrentUser() : Promise<User> {
        const user = await apiRequest<User>('/auth/me', "GET");
        return user
    },

    async logout(): Promise<void>{
        await apiRequest("/auth/logout", "POST")
    }
 
};