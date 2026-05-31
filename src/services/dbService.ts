import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

function getDb(): Firestore {
  if (!db) {
    try {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    } catch (e) {
      console.error("Failed to initialize Firebase", e);
      // Fallback pseudo object to prevent further crashes, 
      // although operations will still fail in their try/catch blocks
      throw e;
    }
  }
  return db;
}

enum OperationType {
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

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path
  };
  console.error('Firestore Error: ', errInfo);
  // Do not throw an unhandled error out of this; return null so the app continues gracefully
  // This prevents the application from crashing and turning to a white screen
  return null;
}

const normalizeName = (name: string) => name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');

export async function loginAndGetProgress(name: string, defaultAvatar: string) {
  const nameId = normalizeName(name);
  if (!nameId) return null;
  
  const path = `users/${nameId}`;
  
  try {
    const database = getDb();
    const d = await getDoc(doc(database, 'users', nameId));
    if (d.exists()) {
      return d.data();
    } else {
      // Create new user profile
      const newUser = {
        name: nameId,
        avatar: defaultAvatar,
        score: 0,
        world: 1,
        activeWorld: 1,
        currentGameIndex: 0
      };
      await setDoc(doc(database, 'users', nameId), newUser);
      return newUser;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

export async function saveProgress(name: string, updates: Partial<{score: number, world: number, activeWorld: number, currentGameIndex: number}>) {
   const nameId = normalizeName(name);
   if (!nameId) return;

   const path = `users/${nameId}`;

   try {
     const database = getDb();
     await updateDoc(doc(database, 'users', nameId), updates);
   } catch (err) {
     handleFirestoreError(err, OperationType.UPDATE, path);
   }
}
