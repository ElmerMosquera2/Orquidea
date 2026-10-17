/**
 * Orquidea Edu — Controlador Interactivo del Kit de Diseño UI
 * Archivo: js/orquidea-design-kit.js
 * Sin frameworks. Gestiona filtros de secciones, copiado de tokens, pestañas,
 * acordeones de sílabo, tabla filtrable, modales y notificaciones Toast.
 */

function initOrquideaDesignKit() {
  bindCategoryFilter();
  bindTokenCopyButtons();
  bindDemoTabs();
  bindSyllabusAccordions();
  bindModalControls();
  bindToastTriggers();
  bindGradeTableSearch();
  bindCampusSidebarDemo();
  bindPaginationDemo();
  bindDropzoneDemo();
}

function bindPaginationDemo() {
  const pageBtns = document.querySelectorAll(".page-btn");
  pageBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      pageBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
      showOrquideaToast(`Página ${btn.textContent.trim()} seleccionada`);
    });
  });
}

function bindDropzoneDemo() {
  const dropzone = document.getElementById("kit-dropzone-demo");
  if (dropzone) {
    dropzone.addEventListener("click", () => {
      const modal = document.getElementById("kit-demo-modal");
      if (modal) modal.classList.add("is-open");
    });
  }
}

/**
 * Filtra las secciones visibles del Kit de Diseño.
 */
function bindCategoryFilter() {
  const buttons = document.querySelectorAll("[data-kit-filter]");
  const sections = document.querySelectorAll("[data-kit-section]");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-kit-filter");

      buttons.forEach((b) => b.classList.toggle("is-active", b === btn));

      sections.forEach((sec) => {
        const category = sec.getAttribute("data-kit-section");
        if (target === "all" || category === target) {
          sec.classList.add("is-visible");
        } else {
          sec.classList.remove("is-visible");
        }
      });
    });
  });
}

/**
 * Permite copiar el código HEX o la variable CSS al portapapeles con confirmación Toast.
 */
function bindTokenCopyButtons() {
  const copyButtons = document.querySelectorAll("[data-copy-token]");
  copyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tokenValue = btn.getAttribute("data-copy-token");
      copyTextSafe(tokenValue);
      showOrquideaToast(`Token copiado: ${tokenValue}`);
    });
  });
}

function copyTextSafe(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopyText(text));
  } else {
    fallbackCopyText(text);
  }
}

function fallbackCopyText(text) {
  const temp = document.createElement("textarea");
  temp.value = text;
  document.body.appendChild(temp);
  temp.select();
  try {
    document.execCommand("copy");
  } catch (_) {
    // Ignorar fallo en entorno restringido
  }
  document.body.removeChild(temp);
}

/**
 * Pestañas interactivas de demostración en el Kit.
 */
function bindDemoTabs() {
  const tabButtons = document.querySelectorAll("[data-demo-tab]");
  const tabPanes = document.querySelectorAll("[data-demo-pane]");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-demo-tab");

      tabButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });

      tabPanes.forEach((pane) => {
        const match = pane.getAttribute("data-demo-pane") === target;
        pane.classList.toggle("is-active", match);
      });
    });
  });
}

/**
 * Acordeones para unidades temáticas del sílabo académico.
 */
function bindSyllabusAccordions() {
  const triggers = document.querySelectorAll("[data-accordion-toggle]");
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const parentItem = trigger.closest(".accordion-item");
      if (!parentItem) return;
      parentItem.classList.toggle("is-open");
    });
  });
}

/**
 * Apertura y cierre de ventanas modales accesibles.
 */
function bindModalControls() {
  const modal = document.getElementById("kit-demo-modal");
  const openBtn = document.getElementById("btn-open-modal");
  const closeBtns = document.querySelectorAll("[data-close-modal]");
  const confirmBtn = document.getElementById("btn-confirm-delivery");

  if (openBtn && modal) {
    openBtn.addEventListener("click", () => {
      modal.classList.add("is-open");
    });
  }

  closeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (modal) modal.classList.remove("is-open");
    });
  });

  if (confirmBtn && modal) {
    confirmBtn.addEventListener("click", () => {
      modal.classList.remove("is-open");
      showOrquideaToast("Entrega académica registrada correctamente.");
    });
  }
}

/**
 * Notificaciones emergentes (Toast) en interfaz sin usar alert() del navegador.
 */
function bindToastTriggers() {
  const toastBtn = document.getElementById("btn-trigger-toast");
  if (toastBtn) {
    toastBtn.addEventListener("click", () => {
      showOrquideaToast("Calificación sincronizada en el registro curricular.");
    });
  }
}

export function showOrquideaToast(message) {
  const region = document.getElementById("kit-toast-region");
  if (!region) return;

  const toast = document.createElement("div");
  toast.className = "toast-card";
  toast.textContent = message;

  region.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode === region) {
      region.removeChild(toast);
    }
  }, 3200);
}

/**
 * Filtro interactivo de estudiantes/asignaturas en la tabla de calificaciones.
 */
function bindGradeTableSearch() {
  const searchInput = document.getElementById("grade-table-search");
  const rows = document.querySelectorAll("#grade-table-body tr");

  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(query) ? "" : "none";
    });
  });
}

/**
 * Navegación lateral interactiva en la vista previa del Campus.
 */
function bindCampusSidebarDemo() {
  const navBtns = document.querySelectorAll("[data-campus-nav]");
  const statusIndicator = document.getElementById("campus-active-module");

  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      navBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
      const label = btn.getAttribute("data-campus-nav");
      if (statusIndicator && label) {
        statusIndicator.textContent = label;
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", initOrquideaDesignKit);
