// vite.config.js
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'

/**
 * Configuración de Vite para Orquídea.
 *
 * DOMER Agnóstica:
 *   Mesa de trabajo (desk/) --vite build--> Producto desplegable (build/)
 *
 * La raíz del repositorio (donde vive este archivo) aloja únicamente la
 * orquestación: no contiene código de ejecución ni artefactos intermedios.
 */

// Raíz del repositorio (donde vive este archivo), como ruta absoluta.
// Equivale al antiguo __dirname, pero válido en ESM.
const repoRoot = fileURLToPath(new URL('.', import.meta.url))

// Mesa de trabajo y salida, derivadas de la raíz del repo.
const deskDir = resolve(repoRoot, 'desk')
const outDir  = resolve(repoRoot, 'build/web')

export default defineConfig({
  // El servidor de desarrollo y el build operan desde la mesa de trabajo.
  root: 'desk',

  // Rutas relativas en el HTML compilado: el producto en build/ es portable
  // y puede desplegarse desde cualquier subdirectorio o file system.
  base: './',

  build: {
    // La salida se extrae de desk/ y no contamina el área de desarrollo.
    outDir: '../build/web',

    // Purga compilaciones anteriores antes de cada build.
    // Es obligatorio declararlo porque outDir queda fuera de root.
    emptyOutDir: true,

    // ESM nativo: Firebase SDK modular no requiere polyfills ni transpilación legacy.
    target: 'esnext',
    modulePreload: { polyfill: false },
    sourcemap: true,

    // Multi-Page App: Vite solo toma index.html por defecto.
    // Si tu index redirige a otra página, hay que declarar cada HTML real.
    rollupOptions: {
      input: {
        main:  resolve(deskDir, 'index.html'),
        // Descomenta y ajusta según tus HTML reales:
        auth:   resolve(deskDir, 'auth.html'),
        // admin: resolve(deskDir, 'admin.html'),
      },
    },
  },

  resolve: {
    alias: {
      // '@' apunta a la mesa de trabajo 'desk'
      '@':           deskDir,
      '@components': resolve(deskDir, 'components'),
      '@utils':      resolve(deskDir, 'utils'),
    },
  },

  server: {
    // Recarga rápida en vivo (HMR) sobre la mesa de trabajo.
    open: true,

    fs: {
      // Permitir servir archivos solo desde la raíz del repositorio.
      allow: [repoRoot],
    },
  },

  preview: {
    open: true,
  },
})