import { isFirebaseConfigured } from "@/js/firebase-config.js";
import {
  loginUser,
  registerUser,
  sendPasswordRecovery,
  signInWithGoogleAccount,
  translateFirebaseError
} from "@/js/auth-service.js";

const VIEWS = {
  LOGIN: "login",
  REGISTER: "register",
  RECOVER: "recover"
};

const HASH_TO_VIEW = {
  "#login": VIEWS.LOGIN,
  "#registro": VIEWS.REGISTER,
  "#recuperar": VIEWS.RECOVER
};

const VIEW_TO_HASH = {
  [VIEWS.LOGIN]: "#login",
  [VIEWS.REGISTER]: "#registro",
  [VIEWS.RECOVER]: "#recuperar"
};

let currentView = VIEWS.LOGIN;

/**
 * Inicializa la aplicación SPA al cargar el DOM.
 */
function initOrquideaAuthSPA() {
  updateFirebaseStatusBadge();
  bindNavigationEvents();
  bindPasswordVisibilityToggles();
  bindPasswordStrengthMeter();
  bindFormSubmissions();

  // Resolver ruta inicial desde el hash de la URL
  const initialView = HASH_TO_VIEW[window.location.hash] || VIEWS.LOGIN;
  switchView(initialView, false);

  window.addEventListener("hashchange", () => {
    const targetView = HASH_TO_VIEW[window.location.hash];
    if (targetView && targetView !== currentView) {
      switchView(targetView, false);
    }
  });
}

/**
 * Muestra en la barra inferior si el SDK tiene llaves configuradas o está en espera.
 */
function updateFirebaseStatusBadge() {
  const statusEl = document.getElementById("firebase-sdk-status");
  if (!statusEl) return;

  if (isFirebaseConfigured()) {
    statusEl.textContent = "Conectado a Firebase Auth";
  } else {
    statusEl.textContent = "SDK Firebase v10 listo (Configurar llaves en js/firebase-config.js)";
  }
}

/**
 * Cambia de vista dentro del SPA (Login, Registro, Recuperar contraseña).
 * @param {string} viewName
 * @param {boolean} updateHash
 */
function switchView(viewName, updateHash = true) {
  if (!Object.values(VIEWS).includes(viewName)) return;
  currentView = viewName;

  hideAlertBanner();
  clearAllFieldErrors();

  // Actualizar pestañas superiores (se ocultan en la vista de recuperar contraseña)
  const tabsContainer = document.getElementById("spa-tabs-nav");
  const tabLogin = document.getElementById("tab-btn-login");
  const tabRegister = document.getElementById("tab-btn-register");

  if (tabsContainer && tabLogin && tabRegister) {
    if (viewName === VIEWS.RECOVER) {
      tabsContainer.classList.add("is-hidden");
    } else {
      tabsContainer.classList.remove("is-hidden");
    }

    const isLogin = viewName === VIEWS.LOGIN;
    tabLogin.classList.toggle("is-active", isLogin);
    tabLogin.setAttribute("aria-selected", String(isLogin));

    const isRegister = viewName === VIEWS.REGISTER;
    tabRegister.classList.toggle("is-active", isRegister);
    tabRegister.setAttribute("aria-selected", String(isRegister));
  }

  // Mostrar únicamente la sección activa
  const viewElements = {
    [VIEWS.LOGIN]: document.getElementById("view-login"),
    [VIEWS.REGISTER]: document.getElementById("view-register"),
    [VIEWS.RECOVER]: document.getElementById("view-recover")
  };

  Object.entries(viewElements).forEach(([key, element]) => {
    if (!element) return;
    if (key === viewName) {
      element.classList.add("is-active");
    } else {
      element.classList.remove("is-active");
    }
  });

  // Pre-llenar el correo en recuperación si el usuario ya lo escribió en login
  if (viewName === VIEWS.RECOVER) {
    const loginEmail = document.getElementById("login-email");
    const recoverEmail = document.getElementById("recover-email");
    if (loginEmail && recoverEmail && loginEmail.value.trim() && !recoverEmail.value.trim()) {
      recoverEmail.value = loginEmail.value.trim();
    }
  }

  if (updateHash) {
    const newHash = VIEW_TO_HASH[viewName];
    if (newHash && window.location.hash !== newHash) {
      history.replaceState(null, "", newHash);
    }
  }
}

/**
 * Vincula todos los botones de navegación entre vistas del SPA.
 */
function bindNavigationEvents() {
  const navTriggers = [
    { id: "tab-btn-login", target: VIEWS.LOGIN },
    { id: "tab-btn-register", target: VIEWS.REGISTER },
    { id: "btn-go-recover", target: VIEWS.RECOVER },
    { id: "link-to-register", target: VIEWS.REGISTER },
    { id: "link-to-login", target: VIEWS.LOGIN },
    { id: "btn-back-to-login", target: VIEWS.LOGIN }
  ];

  navTriggers.forEach(({ id, target }) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", (event) => {
        event.preventDefault();
        switchView(target, true);
      });
    }
  });

  const alertCloseBtn = document.getElementById("alert-close-btn");
  if (alertCloseBtn) {
    alertCloseBtn.addEventListener("click", hideAlertBanner);
  }
}

/**
 * Activa/desactiva la visibilidad de los campos de contraseña.
 */
function bindPasswordVisibilityToggles() {
  const toggleButtons = document.querySelectorAll("[data-toggle-password]");
  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-toggle-password");
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPassword = input.getAttribute("type") === "password";
      input.setAttribute("type", isPassword ? "text" : "password");
      btn.setAttribute(
        "aria-label",
        isPassword ? "Ocultar contraseña" : "Mostrar contraseña"
      );
    });
  });
}

/**
 * Calcula y actualiza el indicador visual de seguridad de contraseña en el registro.
 */
function bindPasswordStrengthMeter() {
  const passwordInput = document.getElementById("register-password");
  const strengthLabel = document.getElementById("password-strength-text");
  const bars = [
    document.getElementById("strength-bar-1"),
    document.getElementById("strength-bar-2"),
    document.getElementById("strength-bar-3"),
    document.getElementById("strength-bar-4")
  ];

  if (!passwordInput || !strengthLabel || bars.some((b) => !b)) return;

  passwordInput.addEventListener("input", () => {
    const val = passwordInput.value;
    let score = 0;

    if (val.length >= 8) score += 1;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score += 1;
    if (/\d/.test(val)) score += 1;
    if (/[^A-Za-z0-9]/.test(val)) score += 1;

    const levelClasses = ["level-weak", "level-medium", "level-strong", "level-excellent"];
    const levelNames = [
      "Mínimo 8 caracteres, letras y números",
      "Seguridad baja",
      "Seguridad aceptable",
      "Seguridad buena",
      "Seguridad excelente"
    ];

    bars.forEach((bar, index) => {
      bar.classList.remove(...levelClasses);
      if (val.length > 0 && index < score) {
        const activeClass = levelClasses[Math.max(0, score - 1)];
        bar.classList.add(activeClass);
      }
    });

    strengthLabel.textContent = val.length === 0 ? levelNames[0] : levelNames[score];
  });
}

/**
 * Validación de correo electrónico estándar.
 * @param {string} email
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Muestra un error específico debajo de un campo.
 */
function setFieldError(inputId, errorId, message) {
  const inputEl = document.getElementById(inputId);
  const errorEl = document.getElementById(errorId);

  if (inputEl) {
    inputEl.classList.toggle("has-error", Boolean(message));
    inputEl.setAttribute("aria-invalid", Boolean(message) ? "true" : "false");
  }
  if (errorEl) {
    errorEl.textContent = message || "";
    errorEl.classList.toggle("is-visible", Boolean(message));
  }
}

function clearAllFieldErrors() {
  const inputs = document.querySelectorAll(".form-input, .form-select");
  inputs.forEach((input) => {
    input.classList.remove("has-error");
    input.removeAttribute("aria-invalid");
  });

  const errors = document.querySelectorAll(".field-error");
  errors.forEach((err) => {
    err.textContent = "";
    err.classList.remove("is-visible");
  });
}

/**
 * Muestra el banner de notificación superior dentro de la tarjeta.
 * @param {"error" | "success" | "info"} type
 * @param {string} message
 */
function showAlertBanner(type, message) {
  const banner = document.getElementById("auth-alert-banner");
  const textEl = document.getElementById("auth-alert-text");
  if (!banner || !textEl) return;

  banner.classList.remove("alert-error", "alert-success", "alert-info");
  banner.classList.add(`alert-${type}`, "is-visible");
  textEl.textContent = message;
}

function hideAlertBanner() {
  const banner = document.getElementById("auth-alert-banner");
  if (banner) {
    banner.classList.remove("is-visible", "alert-error", "alert-success", "alert-info");
  }
}

function setButtonLoading(buttonId, isLoading) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.disabled = isLoading;
  btn.classList.toggle("is-loading", isLoading);
}

/**
 * Vincula el envío de los 3 formularios (Login, Registro, Recuperar) y el botón de Google.
 */
function bindFormSubmissions() {
  // 1. Envío de Login
  const formLogin = document.getElementById("form-login");
  if (formLogin) {
    formLogin.addEventListener("submit", async (event) => {
      event.preventDefault();
      hideAlertBanner();
      clearAllFieldErrors();

      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;
      const remember = document.getElementById("login-remember").checked;

      let hasError = false;
      if (!email) {
        setFieldError("login-email", "login-email-error", "Ingresa tu correo electrónico institucional o personal.");
        hasError = true;
      } else if (!isValidEmail(email)) {
        setFieldError("login-email", "login-email-error", "Ingresa un formato de correo electrónico válido.");
        hasError = true;
      }

      if (!password) {
        setFieldError("login-password", "login-password-error", "Ingresa tu contraseña.");
        hasError = true;
      }

      if (hasError) return;

      setButtonLoading("btn-login-submit", true);
      try {
        const result = await loginUser({ email, password, remember });
        showAlertBanner(result.mode === "firebase" ? "success" : "info", result.message);
      } catch (error) {
        showAlertBanner("error", translateFirebaseError(error));
      } finally {
        setButtonLoading("btn-login-submit", false);
      }
    });
  }

  // 2. Envío de Registro Académico
  const formRegister = document.getElementById("form-register");
  if (formRegister) {
    formRegister.addEventListener("submit", async (event) => {
      event.preventDefault();
      hideAlertBanner();
      clearAllFieldErrors();

      const name = document.getElementById("register-name").value.trim();
      const role = document.getElementById("register-role").value;
      const email = document.getElementById("register-email").value.trim();
      const password = document.getElementById("register-password").value;
      const confirmPassword = document.getElementById("register-password-confirm").value;
      const termsAccepted = document.getElementById("register-terms").checked;

      let hasError = false;
      if (name.length < 3) {
        setFieldError("register-name", "register-name-error", "Ingresa tu nombre completo (mínimo 3 caracteres).");
        hasError = true;
      }

      if (!role) {
        setFieldError("register-role", "register-role-error", "Selecciona tu rol dentro de la institución.");
        hasError = true;
      }

      if (!email || !isValidEmail(email)) {
        setFieldError("register-email", "register-email-error", "Ingresa un correo electrónico válido.");
        hasError = true;
      }

      if (password.length < 8) {
        setFieldError("register-password", "register-password-error", "La contraseña debe tener al menos 8 caracteres.");
        hasError = true;
      }

      if (confirmPassword !== password || !confirmPassword) {
        setFieldError("register-password-confirm", "register-password-confirm-error", "Las contraseñas no coinciden.");
        hasError = true;
      }

      if (!termsAccepted) {
        const termsError = document.getElementById("register-terms-error");
        if (termsError) {
          termsError.textContent = "Debes aceptar las normas de uso académico para continuar.";
          termsError.classList.add("is-visible");
        }
        hasError = true;
      }

      if (hasError) return;

      setButtonLoading("btn-register-submit", true);
      try {
        const result = await registerUser({ name, role, email, password });
        showAlertBanner(result.mode === "firebase" ? "success" : "info", result.message);
        if (result.mode === "firebase") {
          formRegister.reset();
        }
      } catch (error) {
        showAlertBanner("error", translateFirebaseError(error));
      } finally {
        setButtonLoading("btn-register-submit", false);
      }
    });
  }

  // 3. Envío de Recuperación de Contraseña
  const formRecover = document.getElementById("form-recover");
  if (formRecover) {
    formRecover.addEventListener("submit", async (event) => {
      event.preventDefault();
      hideAlertBanner();
      clearAllFieldErrors();

      const email = document.getElementById("recover-email").value.trim();
      if (!email || !isValidEmail(email)) {
        setFieldError("recover-email", "recover-email-error", "Ingresa el correo electrónico válido de tu cuenta.");
        return;
      }

      setButtonLoading("btn-recover-submit", true);
      try {
        const result = await sendPasswordRecovery({ email });
        showAlertBanner("success", result.message);
      } catch (error) {
        showAlertBanner("error", translateFirebaseError(error));
      } finally {
        setButtonLoading("btn-recover-submit", false);
      }
    });
  }

  // 4. Botón de acceso con Google (Firebase GoogleAuthProvider)
  const googleBtn = document.getElementById("btn-google-auth");
  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      hideAlertBanner();
      clearAllFieldErrors();
      try {
        const result = await signInWithGoogleAccount();
        showAlertBanner(result.mode === "firebase" ? "success" : "info", result.message);
      } catch (error) {
        showAlertBanner("error", translateFirebaseError(error));
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", initOrquideaAuthSPA);
