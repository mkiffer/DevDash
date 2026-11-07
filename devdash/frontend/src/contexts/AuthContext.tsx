import React, {useState, useEffect, useRef} from 'react';
import {authService} from '@/services/authService';
import {LoginRequest, RegisterRequest, User} from '@/types'
import {AuthContext} from './auth-context';
import {forgetSession, hasSessionHint, rememberSession} from './sessionHint';

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children})=>{
    const [user, setUser] = useState<User|null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const[isGuest, setIsGuest] = useState(false)
    const [isReturningUser, setIsReturningUser] = useState(hasSessionHint);

    // The login page and dashboard stay usable during the first session check,
    // which can take several seconds on a cold backend. Once the user logs in,
    // logs out or picks guest mode, that check's late answer must be ignored.
    const initialCheckIsSuperseded = useRef(false);
    
    useEffect(()=> {
        // This effect runs once on app load to check for a valid session
    
        const checkUserSession = async () => {
            try{
                // the browser automatically send the HttpOnly cookie
                const userData = await authService.getCurrentUser();
                if (initialCheckIsSuperseded.current) return;
                setUser(userData)
                rememberSession();
            } catch {
                if (initialCheckIsSuperseded.current) return;
                // If the request fails (e.g., 401), it means no valid session
                setUser(null);
                forgetSession();
                setIsReturningUser(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkUserSession()
    
    }, []);

    const startLoggedInSession = async () => {
        initialCheckIsSuperseded.current = true;
        // The cookie is set by this point. Fetch user data to update context
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsGuest(false);
        setIsLoading(false);
        rememberSession();
    };

    const login = async (credentials:LoginRequest) => {
        await authService.login(credentials);
        await startLoggedInSession();
    }
    const register = async (credentials: RegisterRequest) => {
        await authService.register(credentials);
        await startLoggedInSession();
    };
    const logout = async(): Promise<void> => {
        initialCheckIsSuperseded.current = true;
        await authService.logout()
        setUser(null)
        setIsGuest(false)
        setIsLoading(false);
        forgetSession();
        setIsReturningUser(false);
    }
    const continueAsGuest = () => {
        initialCheckIsSuperseded.current = true;
        setUser(null);
        setIsGuest(true);
        setIsLoading(false)
    }

    return(
        <AuthContext.Provider value = {{
            user,
            isAuthenticated: !!user,
            isLoading,
            isReturningUser,
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
