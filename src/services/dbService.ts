import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Default configuration for AI Studio environment (from firebase-applet-config.json)
const appletConfig = {
  projectId: "gen-lang-client-0969175667",
  appId: "1:1023759587217:web:0d325c601943ce796fec30",
  apiKey: "AIzaSyA0YDwpouBhiy6CRWGCjtZ7RamHKveupWc",
  authDomain: "gen-lang-client-0969175667.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-e6cbde79-577a-4cf9-a7ab-08dda2fc9ee2",
  storageBucket: "gen-lang-client-0969175667.firebasestorage.app",
  messagingSenderId: "1023759587217"
};

// Configuration prioritizing environment variables (useful for Vercel/External deployment)
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || appletConfig.firestoreDatabaseId || "(default)"
};

const app = initializeApp(config);
export const db = getFirestore(app, config.firestoreDatabaseId); // CRITICAL

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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const normalizeName = (name: string) => name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');

export async function loginAndGetProgress(name: string, defaultAvatar: string) {
  const nameId = normalizeName(name);
  if (!nameId) return null;
  
  const path = `users/${nameId}`;
  
  try {
    const d = await getDoc(doc(db, 'users', nameId));
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
      await setDoc(doc(db, 'users', nameId), newUser);
      return newUser;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveProgress(name: string, updates: Partial<{score: number, world: number, activeWorld: number, currentGameIndex: number}>) {
   const nameId = normalizeName(name);
   if (!nameId) return;

   const path = `users/${nameId}`;

   try {
     await updateDoc(doc(db, 'users', nameId), updates);
   } catch (err) {
     handleFirestoreError(err, OperationType.UPDATE, path);
   }
}
