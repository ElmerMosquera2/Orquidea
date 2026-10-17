/**
 * Orquidea Edu — Servicio de Autenticación para Firebase Auth
 * Archivo: js/auth-service.js
 *
 * Gestiona login, registro académico, recuperación de contraseña y acceso con Google,
 * además de la traducción de códigos de error de Firebase al español.
 */

import {
  auth,
  googleProvider,
  isFirebaseConfigured,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile
} from "@/js/firebase-config.js";

/**
 * Traduce los códigos de error de Firebase Authentication a mensajes claros en español.
 * @param {Error & { code?: string }} error
 * @returns {string}
 */
export function translateFirebaseError(error) {
  const code = error && error.code ? error.code : "";
  const errorMap = {
    "auth/invalid-credential": "Las credenciales ingresadas no son válidas. Verifica tu correo y contraseña.",
    "auth/user-not-found": "No existe una cuenta académica asociada a este correo electrónico.",
    "auth/wrong-password": "La contraseña ingresada es incorrecta.",
    "auth/invalid-email": "El formato del correo electrónico no es válido.",
    "auth/user-disabled": "Esta cuenta de Orquidea Edu ha sido deshabilitada por administración académica.",
    "auth/email-already-in-use": "Este correo electrónico ya está registrado en Orquidea Edu.",
    "auth/weak-password": "La contraseña es muy débil. Debe contener al menos 8 caracteres.",
    "auth/operation-not-allowed": "Este método de autenticación no está habilitado en la consola de Firebase.",
    "auth/too-many-requests": "Se detectaron demasiados intentos fallidos. Por seguridad, intenta de nuevo en unos minutos.",
    "auth/network-request-failed": "Error de conexión de red. Verifica tu acceso a internet.",
    "auth/popup-closed-by-user": "Se cerró la ventana de autenticación antes de completar el ingreso.",
    "auth/popup-blocked": "El navegador bloqueó la ventana emergente. Permite ventanas emergentes para este sitio."
  };

  return errorMap[code] || "Ocurrió un error al procesar la solicitud en el servidor de autenticación.";
}

/**
 * Inicia sesión con correo electrónico y contraseña en Firebase.
 * @param {{ email: string, password: string, remember: boolean }} params
 */
export async function loginUser({ email, password, remember }) {
  if (!isFirebaseConfigured()) {
    await simulateNetworkDelay();
    return {
      mode: "pending-config",
      user: { email, remember },
      message: "Formulario validado correctamente. Conecta tus credenciales en js/firebase-config.js para autenticar en vivo con Firebase Auth."
    };
  }

  const persistenceMode = remember ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistenceMode);
  const credential = await signInWithEmailAndPassword(auth, email, password);

  return {
    mode: "firebase",
    user: credential.user,
    message: "Sesión iniciada correctamente. Redirigiendo al campus de Orquidea Edu..."
  };
}

/**
 * Registra un nuevo usuario académico en Firebase Authentication.
 * @param {{ name: string, role: string, email: string, password: string }} params
 */
export async function registerUser({ name, role, email, password }) {
  if (!isFirebaseConfigured()) {
    await simulateNetworkDelay();
    return {
      mode: "pending-config",
      user: { displayName: name, role, email },
      message: `Registro validado para ${name} (${role}). Configura js/firebase-config.js para crear el usuario en Firebase Authentication.`
    };
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, {
    displayName: `${name} | ${role}`
  });

  return {
    mode: "firebase",
    user: credential.user,
    message: "Cuenta académica creada exitosamente en Orquidea Edu."
  };
}

/**
 * Envía el correo de restablecimiento de contraseña mediante Firebase.
 * @param {{ email: string }} params
 */
export async function sendPasswordRecovery({ email }) {
  if (!isFirebaseConfigured()) {
    await simulateNetworkDelay();
    return {
      mode: "pending-config",
      message: `Solicitud validada para ${email}. Al conectar js/firebase-config.js, Firebase enviará el enlace de restablecimiento a este correo.`
    };
  }

  await sendPasswordResetEmail(auth, email);
  return {
    mode: "firebase",
    message: `Hemos enviado un enlace de recuperación a ${email}. Revisa tu bandeja de entrada y carpeta de spam.`
  };
}

/**
 * Inicia sesión mediante cuenta institucional de Google con Firebase Popup.
 */
export async function signInWithGoogleAccount() {
  if (!isFirebaseConfigured()) {
    await simulateNetworkDelay();
    return {
      mode: "pending-config",
      message: "Flujo OAuth de Google listo. Agrega las llaves de tu proyecto en js/firebase-config.js para abrir el selector de cuentas de Firebase."
    };
  }

  const credential = await signInWithPopup(auth, googleProvider);
  return {
    mode: "firebase",
    user: credential.user,
    message: `Bienvenido(a) a Orquidea Edu, ${credential.user.displayName || credential.user.email}.`
  };
}

function simulateNetworkDelay() {
  return new Promise((resolve) => setTimeout(resolve, 450));
}
