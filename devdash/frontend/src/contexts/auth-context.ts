import { createContext, useContext } from 'react';
import { LoginRequest, RegisterRequest, User } from '@/types';

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isGuest: boolean;
    isLoading: boolean;
    login: (cerdentials: LoginRequest)=> Promise<void>;
    register: (credentials: RegisterRequest)=>Promise<void>;
    logout: () => Promise<void>
    continueAsGuest: () => void;
}

// The context and its hook live apart from AuthProvider so that the provider
// module exports a component and nothing else, which is what fast refresh
// needs in order to hot-swap it.
export const AuthContext = createContext<AuthContextType|undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined){
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context
}
