import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, Firestore } from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider,
  Auth,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

function getApp(): FirebaseApp {
  if (!app) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (e) {
      console.error("Failed to initialize Firebase App", e);
      throw e;
    }
  }
  return app;
}

export function getDb(): Firestore {
  if (!db) {
    try {
      const appInstance = getApp();
      db = getFirestore(appInstance, firebaseConfig.firestoreDatabaseId);
    } catch (e) {
      console.error("Failed to initialize Firestore", e);
      throw e;
    }
  }
  return db;
}

export function getMyAuth(): Auth {
  if (!auth) {
    try {
      const appInstance = getApp();
      auth = getAuth(appInstance);
    } catch (e) {
      console.error("Failed to initialize Auth", e);
      throw e;
    }
  }
  return auth;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuth = getMyAuth();
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth.currentUser?.uid,
      email: currentAuth.currentUser?.email,
      emailVerified: currentAuth.currentUser?.emailVerified,
      isAnonymous: currentAuth.currentUser?.isAnonymous,
      tenantId: currentAuth.currentUser?.tenantId,
      providerInfo: currentAuth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', errInfo);
  // Do not crash the app, return null so we can show friendly messages
  return null;
}

// User Profile Operations mapped by authenticated User.uid (Secure Progress)

export async function getUserProfile(uid: string) {
  const path = `users/${uid}`;
  try {
    const database = getDb();
    const d = await getDoc(doc(database, 'users', uid));
    if (d.exists()) {
      return d.data();
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

export async function createUserProfile(uid: string, profile: { name: string, avatar: string }) {
  const path = `users/${uid}`;
  const newUser = {
    name: profile.name,
    avatar: profile.avatar,
    score: 0,
    world: 1,
    activeWorld: 1,
    currentGameIndex: 0,
    userId: uid
  };
  
  try {
    const database = getDb();
    await setDoc(doc(database, 'users', uid), newUser);
    return newUser;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return null;
  }
}

export async function saveProgress(uid: string, updates: Partial<{score: number, world: number, activeWorld: number, currentGameIndex: number, name: string, avatar: string}>) {
   if (!uid) return;
   const path = `users/${uid}`;
   try {
     const database = getDb();
     await setDoc(doc(database, 'users', uid), updates, { merge: true });
   } catch (err) {
     handleFirestoreError(err, OperationType.UPDATE, path);
   }
}

// Authentication Helpers

export async function signUpWithEmail(email: string, password: string) {
  try {
    const firebaseAuth = getMyAuth();
    const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    return cred.user;
  } catch (err) {
    console.error("Auth sign-up error:", err);
    throw err;
  }
}

export async function loginWithEmail(email: string, password: string) {
  try {
    const firebaseAuth = getMyAuth();
    const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return cred.user;
  } catch (err) {
    console.error("Auth login error:", err);
    throw err;
  }
}

export async function loginWithGoogle() {
  try {
    const firebaseAuth = getMyAuth();
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(firebaseAuth, provider);
    return cred.user;
  } catch (err: any) {
    if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/popup-blocked' || err?.code === 'auth/cancelled-popup-request') {
      console.warn("Google authentication warning (popup interrupted or blocked):", err.code);
    } else {
      console.error("Auth Google sign-in error:", err);
    }
    throw err;
  }
}

export async function logoutUser() {
  try {
    const firebaseAuth = getMyAuth();
    await signOut(firebaseAuth);
  } catch (err) {
    console.error("Auth logout error:", err);
  }
}
