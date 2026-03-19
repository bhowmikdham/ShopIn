/**
 * Firebase Admin SDK - Server-side initialization
 *
 * Supports two modes:
 *   1. Service Account JSON (FIREBASE_SERVICE_ACCOUNT_JSON env var)
 *   2. Application Default Credentials (when running on GCP/Firebase hosting)
 *
 * If neither is configured, Firebase features are disabled and the app
 * falls back to demo data so development works without any credentials.
 */

import * as admin from 'firebase-admin';

let _app: admin.app.App | null = null;
let _db: admin.firestore.Firestore | null = null;
let _rtdb: admin.database.Database | null = null;
let _auth: admin.auth.Auth | null = null;
let _initialized = false;

function initFirebaseAdmin(): boolean {
  if (_initialized) return _app !== null;
  _initialized = true;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const databaseURL = process.env.FIREBASE_DATABASE_URL || (projectId ? `https://${projectId}-default-rtdb.firebasedatabase.app` : undefined);

  try {
    if (serviceAccountJson) {
      // Mode 1: Explicit service account JSON
      const serviceAccount = JSON.parse(serviceAccountJson);
      _app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || projectId,
        databaseURL,
      });
      console.log('[Firebase Admin] Initialized with service account');
    } else if (projectId) {
      // Mode 2: Application Default Credentials (GCP environment)
      _app = admin.initializeApp({
        projectId,
        databaseURL,
      });
      console.log('[Firebase Admin] Initialized with default credentials');
    } else {
      console.warn('[Firebase Admin] No credentials configured. Using demo data fallback.');
      console.warn('[Firebase Admin] Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_PROJECT_ID to enable.');
      return false;
    }

    _db = admin.firestore(_app);
    _rtdb = admin.database(_app);
    _auth = admin.auth(_app);
    return true;
  } catch (error) {
    console.error('[Firebase Admin] Failed to initialize:', error);
    _app = null;
    _db = null;
    _rtdb = null;
    _auth = null;
    return false;
  }
}

/** Get Firestore instance (null if not configured) */
export function getFirestore(): admin.firestore.Firestore | null {
  initFirebaseAdmin();
  return _db;
}

/** Get Realtime Database instance (null if not configured) */
export function getRealtimeDatabase(): admin.database.Database | null {
  initFirebaseAdmin();
  return _rtdb;
}

/** Get Firebase Auth instance (null if not configured) */
export function getFirebaseAuth(): admin.auth.Auth | null {
  initFirebaseAdmin();
  return _auth;
}

/** Check if Firebase Admin is available */
export function isFirebaseConfigured(): boolean {
  return initFirebaseAdmin();
}

/**
 * Verify a Firebase ID token from the client.
 * Returns the decoded token or null if invalid/not configured.
 */
export async function verifyFirebaseToken(
  idToken: string
): Promise<admin.auth.DecodedIdToken | null> {
  const auth = getFirebaseAuth();
  if (!auth) return null;

  try {
    return await auth.verifyIdToken(idToken);
  } catch (error) {
    console.warn('[Firebase Auth] Token verification failed:', error);
    return null;
  }
}
