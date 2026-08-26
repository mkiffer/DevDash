import React, {useState, useEffect} from 'react';
import {authService} from '@/services/authService';
import {LoginRequest, RegisterRequest, User} from '@/types'
import {AuthContext} from './auth-context';

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children})=>{
    const [user, setUser] = useState<User|null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const[isGuest, setIsGuest] = useState(false)
    
    useEffect(()=> {
        // This effect runs once on app load to check for a valid session
    
        const checkUserSession = async () => {
            try{
                // the browser automatically send the HttpOnly cookie
                const userData = await authService.getCurrentUser();
                setUser(userData)
            } catch {
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
        setIsGuest(false)
    }
    const register = async (credentials: RegisterRequest) => {
        await authService.register(credentials);
        // After successful registration, the cookie is set. Fetch user data.
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsGuest(false);
    };
    const logout = async(): Promise<void> => {
        await authService.logout()
        setUser(null)
        setIsGuest(false)
    }
    const continueAsGuest = () => {
        setUser(null);
        setIsGuest(true);
        setIsLoading(false)
    }

    return(
        <AuthContext.Provider value = {{
            user,
            isAuthenticated: !!user,
            isLoading,
            isGuest,
            login,
            register,
            logout,
            continueAsGuest
        }}>
            {children}
        </AuthContext.Provider>
    );
};
