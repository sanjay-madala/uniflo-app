/**
 * Production Firebase Auth setup for Playwright E2E tests.
 *
 * Provides programmatic Firebase sign-in so tests can authenticate
 * against the live collab-portal-2026 project without touching the
 * browser UI first.  Returns an ID token that can be injected into
 * localStorage or used as a Bearer header.
 */

import { initializeApp, deleteApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  type Auth,
  type UserCredential,
} from "firebase/auth";

// ── Firebase config (collab-portal-2026) ──────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBSTHTYCgwpUdM0C-CynqvuNLoQO_ghP7U",
  authDomain: "collab-portal-2026.firebaseapp.com",
  projectId: "collab-portal-2026",
};

// ── Test accounts ─────────────────────────────────────────────
export interface TestAccount {
  email: string;
  password: string;
  role: "admin" | "manager" | "field_staff";
  displayName: string;
}

export const TEST_ACCOUNTS: Record<string, TestAccount> = {
  admin: {
    email: "admin@democorp.com",
    password: "Admin2026!",
    role: "admin",
    displayName: "Admin User",
  },
  manager: {
    email: "manager@democorp.com",
    password: "Manager2026!",
    role: "manager",
    displayName: "Manager User",
  },
  fieldStaff: {
    email: "field@democorp.com",
    password: "Field2026!",
    role: "field_staff",
    displayName: "Field Staff User",
  },
};

// ── Helpers ───────────────────────────────────────────────────

let _testApp: FirebaseApp | null = null;
let _testAuth: Auth | null = null;

function getTestAuth(): Auth {
  if (!_testAuth) {
    _testApp = initializeApp(firebaseConfig, `test-${Date.now()}`);
    _testAuth = getAuth(_testApp);
  }
  return _testAuth;
}

/**
 * Sign in with email/password and return the Firebase ID token (JWT).
 */
export async function getFirebaseToken(
  email: string,
  password: string,
): Promise<string> {
  const auth = getTestAuth();
  const cred: UserCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  return cred.user.getIdToken();
}

/**
 * Sign in for a named test account and return the token.
 */
export async function getTokenForRole(
  role: keyof typeof TEST_ACCOUNTS,
): Promise<string> {
  const account = TEST_ACCOUNTS[role];
  return getFirebaseToken(account.email, account.password);
}

/**
 * Tear down the test Firebase app (call in globalTeardown or afterAll).
 */
export async function cleanupFirebaseApp(): Promise<void> {
  if (_testApp) {
    await deleteApp(_testApp);
    _testApp = null;
    _testAuth = null;
  }
}

/**
 * Build a Playwright storageState-compatible object that injects
 * the Firebase auth token and role into localStorage so AuthGuard
 * lets the page through.
 */
export function buildStorageState(
  origin: string,
  token: string,
  account: TestAccount,
) {
  return {
    cookies: [] as Array<{
      name: string;
      value: string;
      domain: string;
      path: string;
      expires: number;
      httpOnly: boolean;
      secure: boolean;
      sameSite: "Strict" | "Lax" | "None";
    }>,
    origins: [
      {
        origin,
        localStorage: [
          { name: "uniflo-auth", value: "true" },
          { name: "uniflo-role", value: account.role },
          { name: "uniflo-user-email", value: account.email },
          { name: "uniflo-firebase-token", value: token },
          { name: "theme", value: "dark" },
        ],
      },
    ],
  };
}
