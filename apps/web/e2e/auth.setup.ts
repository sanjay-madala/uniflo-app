/**
 * Shared auth helper for Playwright tests.
 * Creates a browser context with localStorage pre-populated
 * so the AuthGuard allows access to protected pages.
 *
 * Dynamically reads baseURL from PLAYWRIGHT_BASE_URL env var
 * to support both local (localhost:4173) and live (netlify) testing.
 */

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4173';
const origin = new URL(baseURL).origin;

export const AUTH_STORAGE_STATE = {
  cookies: [] as Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'Strict' | 'Lax' | 'None';
  }>,
  origins: [
    {
      origin,
      localStorage: [
        { name: 'uniflo-auth', value: 'true' },
        { name: 'uniflo-role', value: 'admin' },
        { name: 'theme', value: 'dark' },
      ],
    },
  ],
};
