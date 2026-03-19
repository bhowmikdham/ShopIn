/**
 * Firebase Authentication Hook
 *
 * Drop-in replacement for useAuth that works with Firebase Auth.
 * When Firebase is configured, uses Firebase Auth (Google sign-in).
 * When not configured, falls back to the original tRPC-based auth.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  firebaseAuth,
  isFirebaseConfigured,
  signInWithGoogle,
  signOut,
  onAuthChange,
  getIdToken,
  type FirebaseUser,
} from '@/lib/firebase';

interface FirebaseAuthState {
  user: {
    openId: string;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
    role: string;
  } | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
}

export function useFirebaseAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setFirebaseUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async () => {
    setError(null);
    try {
      const user = await signInWithGoogle();
      if (!user) {
        setError(new Error('Sign-in was cancelled'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sign-in failed'));
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sign-out failed'));
    }
  }, []);

  const state = useMemo<FirebaseAuthState>(() => {
    const mappedUser = firebaseUser
      ? {
          openId: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          avatarUrl: firebaseUser.photoURL,
          role: 'user' as const,
        }
      : null;

    return {
      user: mappedUser,
      loading,
      error,
      isAuthenticated: Boolean(firebaseUser),
    };
  }, [firebaseUser, loading, error]);

  return {
    ...state,
    login,
    logout,
    refresh: () => {},             // No-op for Firebase (real-time state)
    getIdToken,                     // For sending to server
    isFirebaseConfigured,
  };
}

export { isFirebaseConfigured };
