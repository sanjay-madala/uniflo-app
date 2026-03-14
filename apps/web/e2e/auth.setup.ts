/**
 * Shared auth helper for Playwright tests.
 * Creates a browser context with localStorage pre-populated
 * so the AuthGuard allows access to protected pages.
 */
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
      origin: 'http://localhost:4173',
      localStorage: [
        { name: 'uniflo-auth', value: 'true' },
        { name: 'uniflo-role', value: 'admin' },
        { name: 'theme', value: 'dark' },
      ],
    },
  ],
};
