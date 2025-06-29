import React, {createContext, useState, useContext, useEffect} from 'react';
import { API_BASE_URL } from '@/services/apiConfig';
import {authService} from '@/services/authService';
import {LoginRequest, RegisterRequest, User} from '@/types'

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (cerdentials: LoginRequest)=> Promise<void>;
    register: (credentials: RegisterRequest)=>Promise<void>;
    logout: () => Promise<void>
}



const AuthContext = createContext<AuthContextType|undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children})=>{
    const [user, setUser] = useState<User|null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(()=> {
        // This effect runs once on app load to check for a valid session
    
        const checkUserSession = async () => {
            try{
                // the browser automatically send the HttpOnly cookie
                const userData = await authService.getCurrentUser();
                setUser(userData)
            } catch (error) {
                // If the request fails (e.g., 401), it means no valid session
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkUserSession()
    
    }, []);

    const login = async (credentials:LoginRequest) => {
        await authService.login(credentials);
        // after successful login, the cookie is set. Fetch user data to update context
        const userData = await authService.getCurrentUser();
        setUser(userData)
    }
    const register = async (credentials: RegisterRequest) => {
        await authService.register(credentials);
        // After successful registration, the cookie is set. Fetch user data.
        const userData = await authService.getCurrentUser();
        setUser(userData);
    };
    const logout = async(): Promise<void> => {
        await authService.logout()
        setUser(null)
    }

    return(
        <AuthContext.Provider value = {{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined){
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context
}
