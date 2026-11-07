/**
 * Tests for: which screen appears while the session check is still running.
 * Coverage intent: public content must not wait on /auth/me, and no account-only
 * request should start before that check has finished.
 * Mocked: useAuth and the heavy panels, so only the screen choice is under test.
 */
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import DashboardLayout from '../MainDashboard';
import LoginPage from '../LoginPage';
import { useAuth } from '@/contexts/auth-context';

vi.mock('@/contexts/auth-context', () => ({ useAuth: vi.fn() }));
vi.mock('@/components/dashboard/AIChat', () => ({ AIChat: () => <div>Chat panel</div> }));
vi.mock('@/components/dashboard/StackOverflowSearch', () => ({ StackOverflowSearch: () => <div>Search panel</div> }));
vi.mock('@/components/dashboard/CodingChallenges/index', () => ({
  CodingProblemComponent: () => <div>Challenges panel</div>,
}));
vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockAuthState = (state: Partial<ReturnType<typeof useAuth>>) => {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    isAuthenticated: false,
    isGuest: false,
    isLoading: false,
    isReturningUser: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    continueAsGuest: vi.fn(),
    ...state,
  });
};

beforeEach(() => vi.clearAllMocks());

describe('App while the session check is running', () => {
  it('shows the dashboard to a returning user', () => {
    mockAuthState({ isLoading: true, isReturningUser: true });

    render(<App />);

    expect(screen.getByText('Challenges panel')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('shows the login page to a new visitor, so guest mode is available at once', () => {
    mockAuthState({ isLoading: true, isReturningUser: false });

    render(<App />);

    expect(screen.queryByText('Challenges panel')).not.toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guest/i })).toBeInTheDocument();
  });

  it('returns to the login page when a remembered session turns out to be invalid', () => {
    mockAuthState({ isLoading: false, isReturningUser: false });

    render(<App />);

    expect(screen.getByRole('button', { name: /guest/i })).toBeInTheDocument();
  });
});

describe('DashboardLayout while the session check is running', () => {
  it('holds back the chat panel, which would fail if the session is invalid', () => {
    mockAuthState({ isLoading: true, isReturningUser: true });

    render(<DashboardLayout />);

    expect(screen.queryByText('Chat panel')).not.toBeInTheDocument();
    expect(screen.getByText('Checking your session...')).toBeInTheDocument();
  });

  it('shows the chat panel once the session is confirmed', () => {
    mockAuthState({ isLoading: false, isAuthenticated: true });

    render(<DashboardLayout />);

    expect(screen.getByText('Chat panel')).toBeInTheDocument();
  });
});

describe('LoginPage while the session check is running', () => {
  it('stays usable instead of showing a spinner', () => {
    mockAuthState({ isLoading: true });

    render(<LoginPage />);

    expect(screen.getByRole('button', { name: /guest/i })).toBeInTheDocument();
  });
});
