/**
 * Tests for: AuthProvider's session check when the page no longer blocks on it.
 * Coverage intent: remembering that a browser had a session, and making sure a
 * slow session check can't overwrite something the user did while it was running.
 * Mocked: authService, plus localStorage, because recent Node versions define their
 * own global that hides jsdom's working implementation.
 */
import { act, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from '@/services/authService';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '../auth-context';
import { User } from '@/types';

vi.mock('@/services/authService', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

const SESSION_HINT_KEY = 'devdash.hasSession';
const existingUser = { id: 1, username: 'existing' } as unknown as User;
const newlyLoggedInUser = { id: 2, username: 'fresh' } as unknown as User;

let auth: ReturnType<typeof useAuth>;
const AuthProbe = () => {
  const currentAuth = useAuth();
  useEffect(() => {
    auth = currentAuth;
  });
  return <div>user:{currentAuth.user?.username ?? 'none'}</div>;
};
const renderProvider = () => render(<AuthProvider><AuthProbe /></AuthProvider>);

const createDeferred = <Value,>() => {
  let resolve!: (value: Value) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<Value>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, resolve, reject };
};

const createInMemoryStorage = () => {
  const storedValues = new Map<string, string>();
  return {
    getItem: (key: string) => storedValues.get(key) ?? null,
    setItem: (key: string, value: string) => void storedValues.set(key, value),
    removeItem: (key: string) => void storedValues.delete(key),
  };
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('localStorage', createInMemoryStorage());
});

describe('AuthProvider session hint', () => {
  it('remembers the session after a successful check', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(existingUser);

    renderProvider();

    await screen.findByText('user:existing');
    expect(localStorage.getItem(SESSION_HINT_KEY)).toBe('true');
  });

  it('forgets the session when the check fails', async () => {
    localStorage.setItem(SESSION_HINT_KEY, 'true');
    vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('401'));

    renderProvider();

    await waitFor(() => expect(auth.isLoading).toBe(false));
    expect(localStorage.getItem(SESSION_HINT_KEY)).toBeNull();
    expect(auth.isReturningUser).toBe(false);
  });

  it('reports a returning user while the check is still running', () => {
    localStorage.setItem(SESSION_HINT_KEY, 'true');
    vi.mocked(authService.getCurrentUser).mockReturnValue(new Promise(() => {}));

    renderProvider();

    expect(auth.isLoading).toBe(true);
    expect(auth.isReturningUser).toBe(true);
  });

  it('forgets the session on logout', async () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(existingUser);
    renderProvider();
    await screen.findByText('user:existing');

    await act(() => auth.logout());

    expect(localStorage.getItem(SESSION_HINT_KEY)).toBeNull();
  });
});

describe('AuthProvider slow session check', () => {
  it('keeps a login that finishes while the first check is still running', async () => {
    const firstCheck = createDeferred<User>();
    vi.mocked(authService.getCurrentUser)
      .mockReturnValueOnce(firstCheck.promise)
      .mockResolvedValueOnce(newlyLoggedInUser);
    renderProvider();

    await act(() => auth.login({ username: 'fresh', password: 'pw' } as never));
    await act(async () => firstCheck.reject(new Error('401')));

    // The form stays usable during the check, so a late 401 must not log them out.
    expect(screen.getByText('user:fresh')).toBeInTheDocument();
    expect(auth.isLoading).toBe(false);
  });

  it('stays a guest when the check succeeds after choosing guest mode', async () => {
    const firstCheck = createDeferred<User>();
    vi.mocked(authService.getCurrentUser).mockReturnValue(firstCheck.promise);
    renderProvider();

    act(() => auth.continueAsGuest());
    await act(async () => firstCheck.resolve(existingUser));

    expect(auth.isGuest).toBe(true);
    expect(auth.user).toBeNull();
  });

  it('stays logged out when the check succeeds after logging out', async () => {
    const firstCheck = createDeferred<User>();
    vi.mocked(authService.getCurrentUser).mockReturnValue(firstCheck.promise);
    localStorage.setItem(SESSION_HINT_KEY, 'true');
    renderProvider();

    await act(() => auth.logout());
    await act(async () => firstCheck.resolve(existingUser));

    expect(auth.user).toBeNull();
    expect(auth.isLoading).toBe(false);
    expect(localStorage.getItem(SESSION_HINT_KEY)).toBeNull();
  });
});
