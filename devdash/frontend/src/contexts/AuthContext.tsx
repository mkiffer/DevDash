import React, {createContext, useState, useContext, useEffect} from 'react';
import { API_BASE_URL } from '@/services/apiConfig';
import {authService} from '@/services/authService'

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username:string, password:string)=> Promise<void>;
    register: (email:string, username:string, password:string)=>Promise<void>;
    logout: () => void
}

interface User{
    username: string;
    email: string;
}

const AuthContext = createContext<AuthContextType|undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children})=>{
    const [user, setUser] = useState<User|null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(()=>{
        const checkAuth = async () => {
            const token = localStorage.getItem('token');

            if(token){
                try{
                    const response = await fetch(`${API_BASE_URL}/auth/me`,{
                        headers:{
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok){
                        const userData = await response.json();
                        setUser({
                            username: userData.username,
                            email: userData.email
                        });
                    } else{
                        //token invalid -clear it
                        localStorage.removeItem('token');
                        setUser(null);
                    }
                } catch(error){
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    setUser(null); 
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (username: string, password: string) => {
        setIsLoading(true);

        try{
            const data = await authService.login({username, password});
            localStorage.setItem('token', data.access_token);

            const userData = await authService.getUserProfile();
            setUser(userData)
            } catch (error){
                console.error('Login error:', error);
                throw error;

            }finally{
                setIsLoading(false);
            }
        };
    
    

    const register = async (email: string, username: string, password: string) => {
        setIsLoading(true);

        try{
            
            const data = await authService.register({email,username,password});

            //store token
            localStorage.setItem('token', data.access_token);

            //set user state
            setUser({
                username,
                email
            });

        } catch(error) {
            console.error("Registration error:", error);
            throw error;
        } finally{
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        
    };

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
