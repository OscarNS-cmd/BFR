import JSZip from 'jszip';
import { LoreDocument, Story, Universe, ImageAsset } from '../types/lore';
import { serializeMarkdown } from './frontmatter';

/**
 * 1. Generates a complete Android Native APK Project (.ZIP) powered by Capacitor + Gradle + GitHub Actions.
 * Allows compiling Grimorio into a native .APK file either locally (via compilar_apk_android.bat)
 * or automatically in the cloud via GitHub Actions without installing Android Studio.
 */
export async function downloadAndroidApkProjectPackage(
  docs: LoreDocument[],
  stories: Story[],
  universes: Universe[],
  images: ImageAsset[],
  universeName: string
): Promise<void> {
  const zip = new JSZip();

  // 1. Capacitor Configuration for Android Offline WebView
  const capacitorConfig = {
    appId: 'com.grimorio.lorestudio',
    appName: 'Grimorio Lore Studio',
    webDir: 'dist',
    bundledWebRuntime: false,
    server: {
      androidScheme: 'https',
    },
    android: {
      allowMixedContent: true,
      captureInput: true,
      webContentsDebuggingEnabled: false,
      backgroundColor: '#0a0a0a',
    },
  };
  zip.file('capacitor.config.json', JSON.stringify(capacitorConfig, null, 2));

  // 2. Automated Windows Batch Script to build the Android .APK
  const batApkBuilder = `@echo off
chcp 65001 >nul
title Grimorio - Compilador de APK Nativo para Android (Offline)

echo ======================================================================
echo       GRIMORIO - GENERADOR DE APLICACION ANDROID (.APK OFFLINE)
echo ======================================================================
echo.

:: 1. Verificar Node.js
echo [1/5] Verificando Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado. Descargalo desde https://nodejs.org
    pause
    exit /b 1
)

:: 2. Instalar dependencias del proyecto y Capacitor Android
echo [2/5] Instalando dependencias y motor Capacitor Android...
call npm install
call npm install @capacitor/core @capacitor/cli @capacitor/android --save

:: 3. Compilar la aplicacion web offline (dist)
echo [3/5] Compilando aplicacion Grimorio en modo produccion offline...
call npm run build

:: 4. Inicializar o sincronizar plataforma Android
echo [4/5] Configurando proyecto nativo de Android...
if not exist "android\\" (
    call npx cap add android
)
call npx cap sync android

:: 5. Compilar APK si JAVA_HOME y Android SDK estan disponibles
echo [5/5] Verificando compilador Gradle para generar el archivo .APK...
if exist "android\\gradlew.bat" (
    cd android
    call gradlew.bat assembleDebug
    if %errorlevel% equ 0 (
        echo.
        echo ======================================================================
        echo  ¡EXITO! Tu archivo APK de Android se ha generado en:
        echo  android\\app\\build\\outputs\\apk\\debug\\app-debug.apk
        echo ======================================================================
        echo  Copia ese archivo .apk a tu telefono Android e instalalo para usar
        echo  Grimorio 100%% offline sin necesidad de conexion a internet.
        echo ======================================================================
        explorer app\\build\\outputs\\apk\\debug
    ) else (
        echo.
        echo [AVISO] No se detecto Android SDK local para compilar por consola.
        echo Abriendo el proyecto en Android Studio para generar el APK...
        cd ..
        call npx cap open android
    )
) else (
    echo Abriendo Android Studio...
    call npx cap open android
)

pause
`;
  zip.file('compilar_apk_android.bat', batApkBuilder);

  // 3. Automated Linux / macOS Shell Script to build the Android .APK
  const shApkBuilder = `#!/usr/bin/env bash
set -e
echo "======================================================================"
echo "      GRIMORIO - GENERADOR DE APLICACION ANDROID (.APK OFFLINE)       "
echo "======================================================================"

echo "[1/4] Instalando dependencias y Capacitor Android..."
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android --save

echo "[2/4] Compilando aplicación web offline..."
npm run build

echo "[3/4] Sincronizando plataforma nativa Android..."
if [ ! -d "android" ]; then
  npx cap add android
fi
npx cap sync android

echo "[4/4] Generando APK con Gradle..."
cd android
./gradlew assembleDebug
echo "======================================================================"
echo "¡APK generado con éxito en: android/app/build/outputs/apk/debug/app-debug.apk!"
echo "======================================================================"
`;
  zip.file('compilar_apk_android.sh', shApkBuilder);

  // 4. GitHub Actions Workflow (Builds the .APK in the cloud without installing Android Studio!)
  const githubWorkflow = `name: Compilar Grimorio Android APK (Offline)

on:
  push:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build-apk:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout código
        uses: actions/checkout@v4

      - name: Configurar Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Configurar Java JDK 21 para Android
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'

      - name: Configurar Android SDK
        uses: android-actions/setup-android@v3

      - name: Instalar dependencias y Capacitor
        run: |
          npm install
          npm install @capacitor/core @capacitor/cli @capacitor/android

      - name: Compilar Grimorio Offline Bundle
        run: npm run build

      - name: Generar plataforma Android y sincronizar
        run: |
          if [ ! -d "android" ]; then
            npx cap add android
          fi
          npx cap sync android

      - name: Compilar archivo APK instalable
        working-directory: ./android
        run: ./gradlew assembleDebug

      - name: Subir Grimorio-Android-Offline.apk listo para descargar
        uses: actions/upload-artifact@v4
        with:
          name: Grimorio-Android-Offline-APK
          path: android/app/build/outputs/apk/debug/app-debug.apk
`;
  zip.folder('.github')?.folder('workflows')?.file('build-android-apk.yml', githubWorkflow);

  // 5. Package.json with Android scripts
  const packageJson = {
    name: 'grimorio-android-offline',
    private: true,
    version: '2.0.0',
    type: 'module',
    scripts: {
      dev: 'vite --port=3000 --host=0.0.0.0',
      build: 'vite build',
      preview: 'vite preview',
      'android:init': 'npx cap add android && npx cap sync android',
      'android:sync': 'npm run build && npx cap sync android',
      'android:open': 'npx cap open android',
    },
    dependencies: {
      '@capacitor/android': '^6.0.0',
      '@capacitor/cli': '^6.0.0',
      '@capacitor/core': '^6.0.0',
      '@tailwindcss/vite': '^4.3.3',
      '@vitejs/plugin-react': '^6.1.1',
      jszip: '^3.10.2',
      'lucide-react': '^0.546.0',
      mermaid: '^12.1.0',
      motion: '^12.23.24',
      react: '^19.0.1',
      'react-dom': '^19.0.1',
      tailwindcss: '^4.3.3',
      vite: '^8.3.0',
    },
    devDependencies: {
      '@types/node': '^22.14.0',
      '@types/react': '^19.3.0',
      '@types/react-dom': '^19.3.0',
      '@types/jszip': '^3.4.1',
      typescript: '^7.0.2',
      'vite-plugin-pwa': '^2.0.0',
    },
  };
  zip.file('package.json', JSON.stringify(packageJson, null, 2));

  // 6. Save complete offline backup JSON inside the bundle
  const backupData = {
    version: '2.0.0-android-offline',
    exportedAt: new Date().toISOString(),
    universeName,
    universes,
    stories,
    documents: docs,
    images,
  };
  zip.file('respaldo_lore_android.json', JSON.stringify(backupData, null, 2));

  // 7. Export all Markdown files organized by category
  const loreFolder = zip.folder('notas_markdown_offline')!;
  const folders: Record<string, JSZip> = {
    story: loreFolder.folder('01_Historias')!,
    character: loreFolder.folder('02_Personajes')!,
    creature: loreFolder.folder('03_Bestiario')!,
    timeline: loreFolder.folder('04_Cronologia')!,
    location: loreFolder.folder('05_Lugares_y_Mundo')!,
    faction: loreFolder.folder('06_Facciones')!,
    note: loreFolder.folder('07_Notas_Generales')!,
  };

  docs.forEach((doc) => {
    const targetFolder = folders[doc.frontmatter.type] || loreFolder;
    const fullMarkdown = serializeMarkdown(doc.frontmatter, doc.content);
    const safeName = doc.fileName.endsWith('.md') ? doc.fileName : `${doc.fileName}.md`;
    targetFolder.file(safeName, fullMarkdown);
  });

  // 8. Detailed Guide in Spanish
  const readmeAndroid = `==============================================================================
   GRIMORIO - GUÍA DE INSTALACIÓN Y COMPILACIÓN PARA ANDROID (100% OFFLINE)
==============================================================================

Tienes 3 formas de instalar y usar Grimorio en tu teléfono o tablet Android
totalmente desconectado de internet (Modo Avión / Offline):

------------------------------------------------------------------------------
MÉTODO 1: INSTALACIÓN DIRECTA EN ANDROID (WEBAPK NATIVA - RECOMENDADO)
------------------------------------------------------------------------------
No requiere cables ni compilar código:
1. Abre la dirección web de Grimorio desde Google Chrome, Edge o Brave en tu
   teléfono Android.
2. Toca el botón "App Android" en la barra superior o inferior y pulsa
   "Instalar App en Android" (o abre el menú ⋮ del navegador -> "Instalar aplicación").
3. Android generará e instalará automáticamente el paquete nativo (WebAPK) en tu
   cajón de aplicaciones con el icono de Grimorio.
4. Gracias al motor Service Worker + IndexedDB integrado, todas tus pantallas,
   historias, personajes y notas quedan guardadas en la memoria interna del
   teléfono y funcionan 100% sin internet.

------------------------------------------------------------------------------
MÉTODO 2: COMPILAR EL ARCHIVO .APK EN LA NUBE (SIN INSTALAR ANDROID STUDIO)
------------------------------------------------------------------------------
Este paquete incluye el flujo automatizado:
  .github/workflows/build-android-apk.yml

1. Sube el proyecto a un repositorio gratuito de GitHub.
2. Entra en la pestaña "Actions" de tu repositorio y ejecuta el flujo
   "Compilar Grimorio Android APK (Offline)".
3. En 2 minutos podrás descargar el archivo "Grimorio-Android-Offline.apk"
   listo para instalar en cualquier celular Android.

------------------------------------------------------------------------------
MÉTODO 3: COMPILAR EL ARCHIVO .APK EN TU PC LOCAL (CAPACITOR + GRADLE)
------------------------------------------------------------------------------
1. Descomprime este paquete y haz doble clic en:
   compilar_apk_android.bat (en Windows) o ./compilar_apk_android.sh (Linux/Mac).
2. El script instalará @capacitor/android, empaquetará la aplicación y generará
   el archivo instalable en:
   android/app/build/outputs/apk/debug/app-debug.apk

==============================================================================
`;
  zip.file('LEEME_ANDROID_APK.txt', readmeAndroid);

  // Trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const cleanName = universeName.replace(/[^a-zA-Z0-9]/g, '_') || 'Lore';
  a.download = `Grimorio_Android_APK_Project_${cleanName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 2. Generates a single, self-contained Portable Android Offline HTML Application (.html).
 * Can be copied via USB, WhatsApp, Telegram, or Google Drive to any Android device and opened
 * directly in any browser/WebView 100% offline with all current Universes, Stories, and Notes embedded!
 */
export function downloadPortableOfflineAndroidHtml(
  docs: LoreDocument[],
  stories: Story[],
  universes: Universe[],
  universeName: string
): void {
  const initialDataJson = JSON.stringify({
    universes,
    stories,
    documents: docs,
  }).replace(/</g, '\\u003c');

  const htmlContent = `<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <meta name="theme-color" content="#0a0a0a" />
  <meta name="mobile-web-app-capable" content="yes" />
  <title>Grimorio Android Offline — ${universeName}</title>
  <style>
    :root {
      --bg: #0a0a0a;
      --surface: #171717;
      --surface-2: #262626;
      --border: #2e2e2e;
      --text: #f5f5f5;
      --muted: #a3a3a3;
      --accent: #d97706;
      --accent-light: #fbbf24;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    header {
      height: 54px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 14px;
      flex-shrink: 0;
    }
    .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 16px; color: var(--accent-light); }
    .badge-offline {
      font-size: 11px;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 3px 8px;
      border-radius: 8px;
      font-weight: 600;
    }
    main {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      max-width: 900px;
      width: 100%;
      margin: 0 auto;
    }
    .search-bar {
      width: 100%;
      padding: 12px 14px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      font-size: 14px;
      margin-bottom: 14px;
    }
    .tabs {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 10px;
      margin-bottom: 14px;
      border-bottom: 1px solid var(--border);
    }
    .tab-btn {
      padding: 8px 14px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--muted);
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      cursor: pointer;
    }
    .tab-btn.active {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 14px;
      margin-bottom: 10px;
      cursor: pointer;
    }
    .card:active { transform: scale(0.99); }
    .card-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
    .card-meta { font-size: 12px; color: var(--muted); }
    .editor-box {
      display: flex;
      flex-direction: column;
      gap: 12px;
      height: 100%;
    }
    .input-title {
      width: 100%;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      font-size: 16px;
      font-weight: 700;
    }
    textarea {
      width: 100%;
      min-height: 320px;
      padding: 14px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      font-family: monospace;
      font-size: 14px;
      line-height: 1.6;
      resize: vertical;
    }
    .btn {
      padding: 10px 16px;
      border-radius: 10px;
      border: none;
      background: var(--accent);
      color: #fff;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }
    .btn-secondary {
      background: var(--surface-2);
      color: var(--text);
    }
    nav.bottom-nav {
      height: 62px;
      background: var(--surface);
      border-top: 1px solid var(--border);
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      flex-shrink: 0;
    }
    .nav-item {
      background: none;
      border: none;
      color: var(--muted);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      gap: 4px;
      cursor: pointer;
    }
    .nav-item.active { color: var(--accent-light); }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <span>📖 Grimorio Android</span>
    </div>
    <span class="badge-offline">100% Offline</span>
  </header>

  <main id="app-viewport"></main>

  <nav class="bottom-nav">
    <button class="nav-item active" id="nav-list" onclick="setView('list')">
      <span>📚 Notas</span>
    </button>
    <button class="nav-item" id="nav-new" onclick="createNewNote()">
      <span>➕ Nueva Nota</span>
    </button>
    <button class="nav-item" id="nav-characters" onclick="setFilter('character')">
      <span>👤 Personajes</span>
    </button>
    <button class="nav-item" id="nav-export" onclick="exportBackup()">
      <span>💾 Exportar</span>
    </button>
  </nav>

  <script>
    const STORAGE_KEY = 'grimorio_portable_android_v1';
    const SEED_DATA = ${initialDataJson};

    let state = {
      documents: [],
      filter: 'all',
      search: '',
      activeDocId: null,
      view: 'list'
    };

    function init() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          state.documents = parsed.documents || SEED_DATA.documents || [];
        } else {
          state.documents = SEED_DATA.documents || [];
          saveState();
        }
      } catch (e) {
        state.documents = SEED_DATA.documents || [];
      }
      render();
    }

    function saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          documents: state.documents,
          updatedAt: Date.now()
        }));
      } catch (e) {}
    }

    function setView(v) {
      state.view = v;
      if (v === 'list') state.filter = 'all';
      render();
    }

    function setFilter(f) {
      state.view = 'list';
      state.filter = f;
      render();
    }

    function openDoc(id) {
      state.activeDocId = id;
      state.view = 'editor';
      render();
    }

    function createNewNote() {
      const newDoc = {
        id: 'doc-' + Date.now(),
        fileName: 'Nueva_Nota.md',
        frontmatter: { title: 'Nueva Nota Offline', type: 'note', tags: [] },
        content: '# Nueva Nota Offline\\n\\nEscribe tu lore aquí...',
        wordCount: 6,
        lastModified: Date.now()
      };
      state.documents.unshift(newDoc);
      saveState();
      openDoc(newDoc.id);
    }

    function saveActiveDoc() {
      const doc = state.documents.find(d => d.id === state.activeDocId);
      if (!doc) return;
      const titleEl = document.getElementById('edit-title');
      const contentEl = document.getElementById('edit-content');
      if (titleEl && contentEl) {
        doc.frontmatter.title = titleEl.value;
        doc.content = contentEl.value;
        doc.wordCount = contentEl.value.trim().split(/\\s+/).filter(Boolean).length;
        doc.lastModified = Date.now();
        saveState();
        alert('Guardado en la memoria offline del dispositivo.');
      }
    }

    function exportBackup() {
      const blob = new Blob([JSON.stringify({
        universes: SEED_DATA.universes,
        stories: SEED_DATA.stories,
        documents: state.documents
      }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Grimorio_Respaldo_Android.json';
      a.click();
    }

    function render() {
      const container = document.getElementById('app-viewport');
      if (state.view === 'editor') {
        const doc = state.documents.find(d => d.id === state.activeDocId);
        if (!doc) { state.view = 'list'; return render(); }
        container.innerHTML = \`
          <div class="editor-box">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
              <button class="btn btn-secondary" onclick="setView('list')">← Volver</button>
              <button class="btn" onclick="saveActiveDoc()">Guardar Cambios</button>
            </div>
            <input id="edit-title" class="input-title" value="\${(doc.frontmatter.title || '').replace(/"/g, '&quot;')}" />
            <textarea id="edit-content">\${(doc.content || '').replace(/</g, '&lt;')}</textarea>
          </div>
        \`;
        return;
      }

      const filtered = state.documents.filter(d => {
        const matchesType = state.filter === 'all' || (d.frontmatter && d.frontmatter.type === state.filter);
        const q = state.search.toLowerCase();
        const matchesSearch = !q ||
          (d.frontmatter && d.frontmatter.title && d.frontmatter.title.toLowerCase().includes(q)) ||
          (d.content && d.content.toLowerCase().includes(q));
        return matchesType && matchesSearch;
      });

      const types = [
        { k: 'all', l: 'Todas (' + state.documents.length + ')' },
        { k: 'story', l: 'Capítulos' },
        { k: 'character', l: 'Personajes' },
        { k: 'location', l: 'Lugares' },
        { k: 'creature', l: 'Bestiario' },
        { k: 'note', l: 'Notas' }
      ];

      container.innerHTML = \`
        <input class="search-bar" placeholder="Buscar notas, personajes o capítulos offline..." value="\${state.search}" oninput="state.search = this.value; render();" />
        <div class="tabs">
          \${types.map(t => \`<button class="tab-btn \${state.filter === t.k ? 'active' : ''}" onclick="setFilter('\${t.k}')">\${t.l}</button>\`).join('')}
        </div>
        <div>
          \${filtered.length === 0 ? '<p style="color:#a3a3a3;text-align:center;padding:32px 0;">No hay documentos en esta categoría.</p>' :
            filtered.map(d => \`
              <div class="card" onclick="openDoc('\${d.id}')">
                <div class="card-title">\${d.frontmatter ? d.frontmatter.title : d.fileName}</div>
                <div class="card-meta">\${(d.frontmatter && d.frontmatter.type) || 'nota'} · \${d.wordCount || 0} palabras</div>
              </div>
            \`).join('')
          }
        </div>
      \`;
    }

    init();
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const cleanName = universeName.replace(/[^a-zA-Z0-9]/g, '_') || 'Lore';
  a.download = `Grimorio_Android_Portable_${cleanName}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
