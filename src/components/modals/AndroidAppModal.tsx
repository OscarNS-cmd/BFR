import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  WifiOff,
  Wifi,
  CheckCircle2,
  Database,
  FileCode2,
  ShieldCheck,
  HardDrive,
  Sparkles,
  FileText,
  Layers,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useLore } from '../../context/LoreContext';
import {
  downloadAndroidApkProjectPackage,
  downloadPortableOfflineAndroidHtml,
} from '../../utils/androidPackage';
import { downloadAndroidKotlinProjectPackage } from '../../utils/androidKotlinPackage';

interface AndroidAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidAppModal: React.FC<AndroidAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isOnline, swReady, install } = usePWAInstall();
  const { documents, stories, universes, images, universeName, offlineStats } = useLore();
  const [isGeneratingKotlinZip, setIsGeneratingKotlinZip] = useState(false);
  const [showInstallSteps, setShowInstallSteps] = useState(false);
  const [showKotlinBuildSteps, setShowKotlinBuildSteps] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInstallWebApk = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        setStatusMessage('¡Grimorio se está instalando en tu pantalla de inicio de Android!');
      }
    } else {
      setShowInstallSteps((prev) => !prev);
    }
  };

  const handleDownloadKotlinProject = async () => {
    setIsGeneratingKotlinZip(true);
    setStatusMessage(null);
    try {
      await downloadAndroidKotlinProjectPackage(documents, stories, universes, images, universeName);
      setStatusMessage('Proyecto nativo Android en Kotlin (Android SDK + Gradle + Jetpack Compose) descargado con éxito.');
    } catch (e: any) {
      setStatusMessage(`Error al generar el proyecto nativo Kotlin: ${e.message}`);
    } finally {
      setIsGeneratingKotlinZip(false);
    }
  };

  const handleDownloadPortableHtml = () => {
    downloadPortableOfflineAndroidHtml(documents, stories, universes, universeName);
    setStatusMessage('Archivo portátil Grimorio_Android_Portable.html descargado. Envíalo a tu móvil por USB, WhatsApp o Drive.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden text-neutral-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-white">
                Aplicación Android & Modo 100% Offline
              </h3>
              <p className="text-xs text-neutral-400">
                Instala Grimorio en tu móvil o tablet Android y úsalo sin conexión a internet.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto text-xs">
          {/* Live Offline Storage & Connectivity Status Bar */}
          <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">Estado de Red</span>
              <div className="flex items-center gap-1.5 font-semibold text-xs">
                {isOnline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Conectado</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-400">Modo Offline Activo</span>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">Base de Datos Local</span>
              <div className="flex items-center gap-1.5 font-semibold text-neutral-200">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>{offlineStats?.indexedDbReady ? 'IndexedDB Activa' : 'LocalStorage'}</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">Caché Offline</span>
              <div className="flex items-center gap-1.5 font-semibold text-neutral-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{swReady ? 'Lista sin red' : 'Precargada'}</span>
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">Datos Guardados</span>
              <div className="font-mono font-semibold text-neutral-200 tabular-nums">
                {documents.length} notas · {offlineStats?.usageFormatted || 'Local'}
              </div>
            </div>
          </div>

          {statusMessage && (
            <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{statusMessage}</span>
              </span>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-emerald-400 hover:text-white text-[11px] underline shrink-0"
              >
                Ocultar
              </button>
            </div>
          )}

          {/* Option 1: Direct Native Android Installation (WebAPK / PWA) */}
          <div className="p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-neutral-900 to-neutral-950 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-400">
                    Opción 1 · Instalación Directa
                  </span>
                  <span className="text-neutral-600">·</span>
                  <span className="text-[11px] text-neutral-400">Sin cables ni PC</span>
                </div>
                <h4 className="font-serif font-bold text-sm text-white">
                  Instalar App en Android (WebAPK Offline)
                </h4>
                <p className="text-neutral-300 leading-relaxed text-xs">
                  Instala Grimorio directamente en el cajón de aplicaciones de tu teléfono o tablet Android. Se abre a pantalla completa sin barra de navegador y guarda todas tus historias en la memoria interna (IndexedDB) para funcionar en <strong>Modo Avión / 100% sin internet</strong>.
                </p>
              </div>

              <button
                onClick={handleInstallWebApk}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-md shrink-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>{isInstalled ? 'App Ya Instalada' : 'Instalar en Android'}</span>
              </button>
            </div>

            {showInstallSteps && (
              <div className="p-3.5 rounded-xl bg-neutral-950/90 border border-neutral-800 space-y-2 text-neutral-300">
                <p className="font-semibold text-emerald-400">
                  Cómo instalarla desde tu navegador en Android:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 text-xs">
                  <li>
                    En <strong>Chrome, Brave o Edge para Android</strong>, toca el icono de menú (tres puntos <strong>⋮</strong> arriba a la derecha).
                  </li>
                  <li>
                    Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Añadir a pantalla de inicio"</strong>.
                  </li>
                  <li>
                    Confirma pulsando <strong>Instalar</strong>. El icono dorado de Grimorio aparecerá junto a tus demás apps de Android y funcionará sin conexión.
                  </li>
                </ol>
              </div>
            )}
          </div>

          {/* Option 2: Download Native Android Project (Kotlin + Android SDK + Jetpack Compose + Room SQLite) */}
          <div className="p-5 rounded-2xl border border-amber-500/30 bg-neutral-950/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-amber-400">
                    Opción 2 · Nativo Kotlin & Android SDK
                  </span>
                  <span className="text-neutral-600">·</span>
                  <span className="text-[11px] text-neutral-400">Android Studio + Gradle KTS</span>
                </div>
                <h4 className="font-serif font-bold text-sm text-white">
                  Proyecto Nativo Android en Kotlin (.ZIP)
                </h4>
                <p className="text-neutral-400 leading-relaxed text-xs">
                  Código fuente nativo 100% en <strong>Kotlin 2.0</strong> con <strong>Android SDK 34</strong>, <strong>Jetpack Compose</strong> y base de datos <strong>Room (SQLite)</strong>. Incluye la opción para <strong>eliminar en cada sección</strong> (Historias, Capítulos, Personajes, Bestiario y Cronología), el script <code>compilar_apk_nativo_kotlin.bat</code> y un flujo de <strong>GitHub Actions</strong> para compilar el APK gratis en la nube.
                </p>
              </div>

              <button
                onClick={handleDownloadKotlinProject}
                disabled={isGeneratingKotlinZip}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-colors shrink-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingKotlinZip ? 'Generando Kotlin...' : 'Descargar Proyecto Kotlin'}</span>
              </button>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500">
                Incluye tus {universes.length} universos, {stories.length} historias y {documents.length} notas pre-cargadas en Room.
              </span>
              <button
                onClick={() => setShowKotlinBuildSteps((prev) => !prev)}
                className="text-amber-400 hover:underline font-medium text-xs"
              >
                {showKotlinBuildSteps ? 'Ocultar guía de compilación' : '¿Cómo compilar el código Kotlin en Android?'}
              </button>
            </div>

            {showKotlinBuildSteps && (
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2.5 text-neutral-300">
                <div>
                  <p className="font-semibold text-amber-400">
                    Forma A: Abrir directamente en Android Studio (Recomendado)
                  </p>
                  <p className="text-neutral-400 mt-0.5">
                    Descomprime el archivo ZIP. En <strong>Android Studio</strong> selecciona <em>Open</em> y elige la carpeta. Gradle sincronizará automáticamente y podrás presionar <strong>Run (▶)</strong> o <em>Build APK</em>.
                  </p>
                </div>
                <div className="pt-2 border-t border-neutral-800">
                  <p className="font-semibold text-emerald-400">
                    Forma B: En tu PC por consola (Windows / Linux / Mac)
                  </p>
                  <p className="text-neutral-400 mt-0.5">
                    Ejecuta <code>compilar_apk_nativo_kotlin.bat</code> (Windows) o <code>./compilar_apk_nativo_kotlin.sh</code> (Mac/Linux). El script ejecutará Gradle y generará <code>app-debug.apk</code>.
                  </p>
                </div>
                <div className="pt-2 border-t border-neutral-800">
                  <p className="font-semibold text-sky-400">
                    Forma C: Compilar en la nube gratis sin instalar nada (GitHub Actions)
                  </p>
                  <p className="text-neutral-400 mt-0.5">
                    El proyecto ya contiene <code>.github/workflows/build-native-kotlin-apk.yml</code>. Sube el código a GitHub y la pestaña <strong>Actions</strong> compilará automáticamente el archivo <code>Grimorio-Android-Kotlin-APK</code> listo para descargar.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Option 3: Single-File Portable Offline HTML for Android */}
          <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-md">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-sky-400">
                  Opción 3 · Archivo Único Portátil
                </span>
                <span className="text-neutral-600">·</span>
                <span className="text-[11px] text-neutral-400">Enviar por WhatsApp / USB</span>
              </div>
              <h4 className="font-serif font-bold text-sm text-white">
                Descargar Grimorio Portátil en 1 Archivo (.HTML)
              </h4>
              <p className="text-neutral-400 leading-relaxed text-xs">
                Genera un único archivo <code>.html</code> autónomo con lector, buscador, editor y todas tus notas actuales incrustadas. Envíalo por WhatsApp, Telegram o cable USB a tu Android y ábrelo sin internet.
              </p>
            </div>

            <button
              onClick={handleDownloadPortableHtml}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-medium transition-colors shrink-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileCode2 className="w-4 h-4 text-sky-400" />
              <span>Descargar .HTML Offline</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between gap-2">
          <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Persistencia garantizada mediante IndexedDB + LocalStorage + Service Worker.</span>
          </span>
          <button
            onClick={onClose}
            className="min-h-[40px] px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
