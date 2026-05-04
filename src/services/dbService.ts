import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); // CRITICAL
export const auth = getAuth();

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
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const normalizeName = (name: string) => name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');

export async function loginAndGetProgress(name: string, defaultAvatar: string) {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (e) {
      console.error("Anonymous auth failed", e);
      throw e;
    }
  }

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
   if (!auth.currentUser) return;
   const nameId = normalizeName(name);
   if (!nameId) return;

   const path = `users/${nameId}`;

   try {
     await updateDoc(doc(db, 'users', nameId), updates);
   } catch (err) {
     handleFirestoreError(err, OperationType.UPDATE, path);
   }
}
