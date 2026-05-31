import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc, Firestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, Auth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

function getDb(): Firestore {
  if (!db) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
  }
  return db;
}

function getAuthInstance(): Auth {
  getDb();
  return auth!;
}

// Login con Google
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(getAuthInstance(), provider);
    const user = result.user;

    // Crear perfil en Firestore si no existe
    const db = getDb();
    const ref = doc(db, 'users', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        name: user.displayName || 'Jugador',
        avatar: '👾',
        score: 0,
        world: 1,
        activeWorld: 1,
        currentGameIndex: 0,
        email: user.email,
        photoURL: user.photoURL,
      });
    }
    return user;
  } catch (err) {
    console.error('Error en login con Google', err);
    return null;
  }
}

// Obtener progreso del usuario
export async function getProgress(uid: string) {
  try {
    const db = getDb();
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) return snap.data();
    return null;
  } catch (err) {
    console.error('Error obteniendo progreso', err);
    return null;
  }
}

// Guardar progreso
export async function saveProgress(uid: string, updates: Partial<{score: number, world: number, activeWorld: number, currentGameIndex: number}>) {
  try {
    const db = getDb();
    await updateDoc(doc(db, 'users', uid), updates);
  } catch (err) {
    console.error('Error guardando progreso', err);
  }
}

// Cerrar sesión
export async function logout() {
  try {
    await signOut(getAuthInstance());
  } catch (err) {
    console.error('Error cerrando sesión', err);
  }
}

// Escuchar cambios de sesión
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(getAuthInstance(), callback);
}

// Compatibilidad con código anterior
export async function loginAndGetProgress(name: string, defaultAvatar: string) {
  return null;
}
