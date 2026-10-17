    ---
tipo: adr
id: ADR-001
titulo: Adopción de Bun y Vite para el entorno de desarrollo y empaquetado en desk/
estado: Aceptado # Propuesto | Aceptado | Superado
fecha: 2026-10-15
dominio: Infraestructura y Entorno de Desarrollo
vision_origen: VA-001
---

# ADR-001: Adopción de Bun y Vite para el entorno de desarrollo y empaquetado en desk/

## 1. Contexto

El desarrollo de *Orquídea* inició como un conjunto de archivos estáticos independientes (`.html`, `.css`, `.js`) sin herramientas de construcción ni gestores de dependencias activos.

Con la incorporación de servicios externos como el SDK modular de Firebase (autenticación y base de datos), surgió la necesidad de:
1. Gestionar paquetes sin depender de scripts pesados o desactualizados desde CDN.
2. Contar con un servidor de desarrollo con recarga rápida en vivo (*Hot Module Replacement* / HMR).
3. Alinear el proyecto con la estructura de gobernanza DOMER, operando el código fuente estrictamente dentro de la mesa de trabajo (`desk/`) y generando artefactos distribuibles en `build/`.

Se evaluaron dos frentes técnicos:
- **Gestor de paquetes / runtime:** npm frente a Bun.
- **Servidor y empaquetador:** Vanilla sin empaquetar frente a Vite.

## 2. Decisión

Se adopta **Bun** como entorno de ejecución y gestor de paquetes principal del proyecto, en combinación con **Vite** como empaquetador y servidor de desarrollo local configurado para operar con raíz en `desk/`.

### 2.1. Método
- **Aislamiento en mesa de trabajo:** Toda la codificación activa de frontend (HTML, CSS, módulos JS) residirá exclusivamente en `desk/`.
- **Compilación desacoplada:** La construcción del producto formal no alterará el código fuente ni la gobernanza; emitirá sus salidas directamente hacia `build/`.
- **Estandarización ESM:** Todo script JavaScript se escribirá como módulo ECMAScript nativo (`import`/`export`), evitando empaquetados manuales complejos.

### 2.2. Tecnología
- **Runtime & Package Manager:** `bun` (aprovechando compatibilidad nativa con dependencias de npm y alta velocidad de instalación).
- **Bundler / Dev Server:** `vite` configurado con `root: 'desk'` y `build.outDir: '../build'`.

## 3. Justificación y Razones

1. **Rendimiento y simplicidad:** Bun ofrece tiempos de instalación y ejecución significativamente menores que npm tradicional, permitiendo iterar rápidamente en la mesa de trabajo sin fricción.
2. **Soporte nativo de módulos:** Vite resuelve la resolución de dependencias de Firebase SDK de manera transparente para el navegador en modo desarrollo, manteniendo los archivos fuente limpios como estándar web (`type="module"`).
3. **Compatibilidad con DOMER:** La directiva `root` de Vite permite mapear limpiamente la separación física dictada por el marco:
   $$\text{Mesa de trabajo (desk/)} \xrightarrow{\text{vite build}} \text{Producto desplegable (build/)}$$
4. **Preservación del contexto:** Evita ensuciar la raíz del repositorio con artefactos intermedios o mezclar la gobernanza (`_docs_orquidea/`) con el código de ejecución.

## 4. Consecuencias

### Positivas
- Tiempos de arranque y actualización de módulos prácticamente instantáneos en desarrollo local.
- Separación estricta y limpia entre el código editable (`desk/`) y el código final compilado (`build/`).
- Facilidad para incorporar dependencias futuras del ecosistema JavaScript mediante `bun add`.

### Negativas / Restricciones
- Cualquier desarrollador que clone el proyecto debe tener instalado Bun en su entorno local (o recurrir a npm/npx como fallback si Bun no está disponible).
- Las rutas relativas a assets en `index.html` deben apegarse al estándar de resolución de Vite desde el subdirectorio `desk/`.

## 5. Trazabilidad

- **Deriva de:** Necesidad de integrar Firebase SDK modular y organizar el proyecto bajo DOMER Agnóstica.
- **Da origen a:** 
  - `REQ-001`: Configuración del archivo `vite.config.js` y scripts de `package.json`.
  - `REQ-002`: Migración de scripts HTML a módulos con importaciones formales de Firebase.