import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence,
  GoogleAuthProvider,
  GithubAuthProvider,        // <-- add GitHub provider
  signInWithPopup
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2uC_tDb4wTy5hl41oI4Cr6hoRIjAvK98",
  authDomain: "auth-app-475fc.firebaseapp.com",
  projectId: "auth-app-475fc",
  storageBucket: "auth-app-475fc.firebasestorage.app",
  messagingSenderId: "193737603953",
  appId: "1:193737603953:web:dabe01bbe7c890595f54d0",
  measurementId: "G-GNXGFPYTKZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();   // <-- export GitHub provider

export const setAuthPersistence = (rememberMe) => {
  const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
  return setPersistence(auth, persistence);
};

// Google sign‑in helper
export const signInWithGoogle = async (rememberMe = false) => {
  await setAuthPersistence(rememberMe);
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

// GitHub sign‑in helper (new)
export const signInWithGitHub = async (rememberMe = false) => {
  await setAuthPersistence(rememberMe);
  const result = await signInWithPopup(auth, githubProvider);
  return result.user;
};

// Save or update user data in Firestore (works for email, Google, GitHub)
export const saveUserToFirestore = async (user) => {
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    email: user.email,
    displayName: user.displayName || user.email,
    provider: user.providerData[0]?.providerId || 'email',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  }, { merge: true });
};