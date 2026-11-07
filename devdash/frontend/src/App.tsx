import './App.css'
import DashboardLayout from './pages/MainDashboard'
import { AuthProvider } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import { useAuth } from './contexts/auth-context'
import {Toaster} from "./components/ui/toaster"

// Auth wrapper component
const AuthenticatedApp = () => {
  
  const { isAuthenticated, isLoading, isGuest, isReturningUser } = useAuth();

  // Neither screen waits for the session check. Returning users get the dashboard
  // and new visitors get the login page, so public content isn't held up by /auth/me.
  const isExpectedToBeLoggedIn = isLoading && isReturningUser;

  return isAuthenticated || isGuest || isExpectedToBeLoggedIn ? <DashboardLayout /> : <LoginPage />;
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