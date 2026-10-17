/**
 * Orquidea Edu — Configuración e Inicialización de Firebase Authentication
 * Archivo: js/firebase-config.js
 *
 * INSTRUCCIONES DE CONEXIÓN:
 * Reemplaza los valores del objeto `firebaseConfig` con las credenciales
 * de tu proyecto desde Firebase Console (Configuración del proyecto -> Tus apps -> SDK Web).
 */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyCKrqF2wk6d2xdd6gUBrHMwua51O6u542k",
  authDomain: "orquidea-edu.firebaseapp.com",
  projectId: "orquidea-edu",
  storageBucket: "orquidea-edu.firebasestorage.app",
  messagingSenderId: "277342316413",
  appId: "1:277342316413:web:abeac0363b2837aa1b4e14",
  measurementId: "G-3V6ZG0LDWX"
};

/**
 * Verifica si el desarrollador ya reemplazó las credenciales por defecto.
 */
export function isFirebaseConfigured() {
  return (
    Boolean(firebaseConfig.apiKey) &&
    firebaseConfig.apiKey !== "REEMPLAZAR_CON_TU_API_KEY" &&
    !firebaseConfig.apiKey.startsWith("REEMPLAZAR_")
  );
}

let appInstance = null;
let authInstance = null;
let googleProviderInstance = null;

if (isFirebaseConfigured()) {
  appInstance = initializeApp(firebaseConfig);
  authInstance = getAuth(appInstance);
  authInstance.languageCode = "es";
  googleProviderInstance = new GoogleAuthProvider();
  googleProviderInstance.setCustomParameters({ prompt: "select_account" });
}

export {
  appInstance as app,
  authInstance as auth,
  googleProviderInstance as googleProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
  onAuthStateChanged
};
