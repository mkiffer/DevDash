import React, {createContext, useState, useContext, useEffect} from 'react';
import { API_BASE_URL } from '@/services/apiConfig';

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
            //Create for data (FastAPI expects form data for Oauth2)
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await fetch(`${API_BASE_URL}/auth/token`, {
                method: 'POST',
                body: formData});
            
            if(!response.ok){
                throw new Error('Login failed');
            }
            
            const data = await response.json();

            //store token
            localStorage.setItem('token', data.access_token);
            
            const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${data.access_token}`
                }
            });

            if (userResponse.ok){
                const userData = await userResponse.json();
                setUser({
                    username: userData.username,
                    email: userData.email
                });
            }
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
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({email,username,password})
            });
            if(!response.ok){
                throw new Error('Registration failed');
            }

            const data = await response.json();

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
