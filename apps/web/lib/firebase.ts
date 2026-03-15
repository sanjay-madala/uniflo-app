"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBSTHTYCgwpUdM0C-CynqvuNLoQO_ghP7U",
  authDomain: "collab-portal-2026.firebaseapp.com",
  projectId: "collab-portal-2026",
  storageBucket: "collab-portal-2026.firebasestorage.app",
  messagingSenderId: "701698424157",
  appId: "1:701698424157:web:d5243a5a40b2f310317cb4",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { auth, signInWithEmailAndPassword, signOut, onAuthStateChanged };
export type { User };
