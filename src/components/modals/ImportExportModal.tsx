import React, { useRef } from 'react';
import {
  X,
  FolderOpen,
  Download,
  Upload,
  FileArchive,
  Database,
  FileText,
  CheckCircle2,
  HardDrive,
  Info,
  Smartphone,
} from 'lucide-react';
import { useLore } from '../../context/LoreContext';
import { downloadMarkdownFile } from '../../utils/fileSystem';
import { downloadAndroidApkProjectPackage } from '../../utils/androidPackage';
import { downloadAndroidKotlinProjectPackage } from '../../utils/androidKotlinPackage';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({ isOpen, onClose }) => {
  const {
    documents,
    stories,
    universes,
    images,
    activeDocument,
    universeName,
    isDiskConnected,
    diskFolderName,
    connectLocalDirectory,
    exportZipArchive,
    exportJsonBackup,
    importJsonBackup,
    importLocalMarkdownFiles,
  } = useLore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      try {
        const parsed = JSON.parse(loadEvt.target?.result as string);
        importJsonBackup(parsed);
        onClose();
      } catch (err: any) {
        console.error('Error al leer archivo JSON:', err);
      }
    };
    reader.readAsText(file);
  };

  const handleMarkdownFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await importLocalMarkdownFiles(files);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden text-neutral-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <FileArchive className="w-4 h-4 text-amber-500" />
            <h3 className="font-serif font-bold text-base">
              Almacenamiento Local & Respaldos
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
          {/* Local directory connection box */}
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-200 font-semibold">
                <HardDrive className="w-4 h-4 text-amber-500" />
                <span>Carpeta Local en el Equipo (File System API)</span>
              </div>
              {isDiskConnected && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Vinculada: {diskFolderName}
                </span>
              )}
            </div>

            <p className="text-neutral-400 leading-relaxed">
              Permite a la aplicación leer y sincronizar directamente los archivos <code>.md</code> desde cualquier carpeta de tu disco duro.
            </p>

            <button
              onClick={async () => {
                await connectLocalDirectory();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors"
            >
              <FolderOpen className="w-4 h-4 text-amber-500" />
              <span>{isDiskConnected ? 'Cambiar Carpeta Local' : 'Abrir Carpeta Local de Notas'}</span>
            </button>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <h4 className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
              Opciones de Exportación y Paquetes Offline
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  downloadAndroidApkProjectPackage(documents, stories, universes, images, universeName);
                  onClose();
                }}
                className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-500/70 hover:bg-emerald-500/20 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-neutral-100 font-semibold group-hover:text-emerald-300">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Proyecto Android (.APK Offline)</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Paquete con Capacitor + Gradle + GitHub Actions para compilar Grimorio-Offline.apk con tus notas.
                </p>
              </button>

              <button
                onClick={() => {
                  downloadAndroidKotlinProjectPackage(documents, stories, universes, images, universeName);
                  onClose();
                }}
                className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:border-amber-500/70 hover:bg-amber-500/20 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-neutral-100 font-semibold group-hover:text-amber-300">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Proyecto Kotlin Android SDK</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Código fuente nativo en Kotlin 2.0 con Room Database, Gradle KTS y Jetpack Compose.
                </p>
              </button>

              <button
                onClick={() => {
                  exportZipArchive();
                  onClose();
                }}
                className="p-3 rounded-xl border border-neutral-800 bg-neutral-950/40 hover:border-amber-500/50 hover:bg-amber-500/5 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-neutral-200 font-medium group-hover:text-amber-400">
                  <FileArchive className="w-4 h-4 text-amber-500" />
                  <span>Notas en ZIP</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Todas las notas en carpetas con formato .md y frontmatter YAML.
                </p>
              </button>

              <button
                onClick={() => {
                  exportJsonBackup();
                  onClose();
                }}
                className="p-3 rounded-xl border border-neutral-800 bg-neutral-950/40 hover:border-amber-500/50 hover:bg-amber-500/5 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-neutral-200 font-medium group-hover:text-amber-400">
                  <Database className="w-4 h-4 text-sky-500" />
                  <span>Copia JSON</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Snapshot completo de todo el universo, notas, imágenes y grafo.
                </p>
              </button>
            </div>

            {activeDocument && (
              <button
                onClick={() => {
                  downloadMarkdownFile(activeDocument);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-950/40 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-2 text-neutral-300">
                  <FileText className="w-4 h-4 text-neutral-400" />
                  <span>Descargar nota activa: <strong>{activeDocument.fileName}</strong></span>
                </div>
                <Download className="w-4 h-4 text-amber-500" />
              </button>
            )}
          </div>

          {/* Import Options */}
          <div className="space-y-3 pt-3 border-t border-neutral-800">
            <h4 className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
              Opciones de Importación
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".md"
                className="hidden"
                onChange={handleMarkdownFilesUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-xl border border-neutral-800 bg-neutral-950/40 hover:border-neutral-700 text-left transition-all"
              >
                <div className="flex items-center gap-2 text-neutral-200 font-medium">
                  <Upload className="w-4 h-4 text-emerald-500" />
                  <span>Importar Archivos .md</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Añade uno o múltiples archivos Markdown desde tu disco local a este universo.
                </p>
              </button>

              <input
                ref={jsonInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleJsonUpload}
              />
              <button
                onClick={() => jsonInputRef.current?.click()}
                className="p-3 rounded-xl border border-neutral-800 bg-neutral-950/40 hover:border-neutral-700 text-left transition-all"
              >
                <div className="flex items-center gap-2 text-neutral-200 font-medium">
                  <Database className="w-4 h-4 text-indigo-500" />
                  <span>Restaurar Copia JSON</span>
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Carga un archivo de respaldo generado previamente por Grimorio.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
