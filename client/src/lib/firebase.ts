/**
 * Firebase Client SDK - Browser-side initialization
 *
 * Reads config from VITE_FIREBASE_* environment variables.
 * If not configured, exports null instances so the app can
 * fall back gracefully (demo mode).
 *
 * To configure: copy .env.example → .env and fill in your
 * Firebase project values from the Firebase Console →
 * Project Settings → General → Your Apps → Web App.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  type Firestore,
} from 'firebase/firestore';
import {
  getDatabase,
  type Database,
} from 'firebase/database';

// ── Config from environment ──────────────────────────────────
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// ── Initialize ───────────────────────────────────────────────
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    rtdb = getDatabase(app);
    console.log('[Firebase] Client initialized for project:', firebaseConfig.projectId);
  } catch (error) {
    console.error('[Firebase] Client initialization failed:', error);
  }
} else {
  console.info(
    '[Firebase] Not configured — running in demo mode.',
    'Set VITE_FIREBASE_* env vars to enable.'
  );
}

// ── Exports ──────────────────────────────────────────────────
export { app as firebaseApp, auth as firebaseAuth, db as firebaseDb, rtdb as firebaseRtdb };
export { isConfigured as isFirebaseConfigured };

// ── Auth Helpers ─────────────────────────────────────────────
const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User | null> {
  if (!auth) {
    console.warn('[Firebase Auth] Not configured');
    return null;
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('[Firebase Auth] Google sign-in failed:', error);
    return null;
  }
}

export async function signOut(): Promise<void> {
  if (!auth) return;
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('[Firebase Auth] Sign-out failed:', error);
  }
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    // Not configured — call immediately with null and return no-op unsubscribe
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Get the current user's ID token for sending to the server.
 * Returns null if not signed in or Firebase isn't configured.
 */
export async function getIdToken(): Promise<string | null> {
  if (!auth?.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken();
  } catch {
    return null;
  }
}

export type { User as FirebaseUser };
