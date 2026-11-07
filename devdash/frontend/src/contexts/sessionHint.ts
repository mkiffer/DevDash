/**
 * Remembers whether this browser recently had a logged-in session.
 *
 * The session cookie is HttpOnly, so JavaScript can't see it. This hint lets the
 * app show the dashboard to returning users before /auth/me has answered, which
 * avoids flashing the login page at them. It grants no access: the backend still
 * authenticates every request, and a wrong hint only means briefly showing the
 * wrong screen.
 */
const SESSION_HINT_KEY = 'devdash.hasSession';

// Storage can throw in private windows or when site data is blocked. Losing the
// hint is harmless, because the app just falls back to the login page first.
export const hasSessionHint = (): boolean => {
  try {
    return localStorage.getItem(SESSION_HINT_KEY) === 'true';
  } catch {
    return false;
  }
};

export const rememberSession = (): void => {
  try {
    localStorage.setItem(SESSION_HINT_KEY, 'true');
  } catch {
    // See the note above: the hint is optional.
  }
};

export const forgetSession = (): void => {
  try {
    localStorage.removeItem(SESSION_HINT_KEY);
  } catch {
    // See the note above: the hint is optional.
  }
};
