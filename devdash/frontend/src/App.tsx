import { useState } from 'react'
import './App.css'
import DashboardLayout from './pages/MainDashboard'
import { AuthProvider } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import { useAuth } from './contexts/AuthContext'
import {Toaster} from "./components/ui/toaster"

// Auth wrapper component
const AuthenticatedApp = () => {
  
  const { isAuthenticated, isLoading, isGuest } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return isAuthenticated || isGuest ? <DashboardLayout /> : <LoginPage />;
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen w-full bg-background">
        <AuthenticatedApp />
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;