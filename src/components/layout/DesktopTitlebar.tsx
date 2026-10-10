import React, { useState } from 'react';
import {
  Feather,
  Layers,
  Book,
  Search,
  Sun,
  Moon,
  FolderGit2,
  HardDrive,
  FileArchive,
  ChevronDown,
  Plus,
  Smartphone,
  Menu,
  WifiOff,
} from 'lucide-react';
import { useLore } from '../../context/LoreContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface DesktopTitlebarProps {
  onOpenSearch: () => void;
  onOpenImportExport: () => void;
  onOpenAndroidModal: () => void;
  onOpenManageUniverseModal: () => void;
  onOpenManageStoryModal: () => void;
  onToggleMobileDrawer?: () => void;
}

export const DesktopTitlebar: React.FC<DesktopTitlebarProps> = ({
  onOpenSearch,
  onOpenImportExport,
  onOpenAndroidModal,
  onOpenManageUniverseModal,
  onOpenManageStoryModal,
  onToggleMobileDrawer,
}) => {
  const {
    activeUniverse,
    activeUniverseId,
    setActiveUniverseId,
    universes,
    activeStory,
    theme,
    setTheme,
    isDiskConnected,
    diskFolderName,
    connectLocalDirectory,
    exportZipArchive,
  } = useLore();

  const { isOnline } = usePWAInstall();
  const [isUniverseMenuOpen, setIsUniverseMenuOpen] = useState(false);

  return (
    <header className="h-11 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-2.5 sm:px-3 select-none shrink-0 text-xs text-neutral-300 font-sans z-30">
      {/* Zone 1: Brand, Mobile Drawer Trigger & Universe Selector */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onToggleMobileDrawer && (
          <button
            onClick={onToggleMobileDrawer}
            title="Abrir menú lateral"
            aria-label="Abrir explorador de lore"
            className="md:hidden min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-amber-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Feather className="w-3 h-3" />
          </div>
          <span className="font-serif font-bold text-sm tracking-tight text-white truncate hidden xs:inline">
            Grimorio
          </span>
        </div>

        <span className="text-neutral-700 hidden sm:inline">/</span>

        {/* Universe Selector Button */}
        <div className="relative">
          <button
            onClick={() => setIsUniverseMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 text-xs transition-colors border border-neutral-700/60 max-w-[160px] sm:max-w-[200px]"
          >
            <Layers className="w-3 h-3 text-amber-500 shrink-0" />
            <span className="truncate font-medium">{activeUniverse?.name || 'Sin Universo'}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
          </button>

          {isUniverseMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-60 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
              <div className="px-2 py-1 text-[10px] uppercase font-semibold text-neutral-400">
                Cambiar Proyecto / Universo
              </div>
              <div className="max-h-44 overflow-y-auto space-y-0.5">
                {universes.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setActiveUniverseId(u.id);
                      setIsUniverseMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs truncate flex items-center justify-between ${
                      u.id === activeUniverseId
                        ? 'bg-amber-600/20 text-amber-400 font-semibold'
                        : 'text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <span className="truncate">{u.name}</span>
                    {u.id === activeUniverseId && <span className="text-amber-500">✓</span>}
                  </button>
                ))}
              </div>
              <div className="pt-1 mt-1 border-t border-neutral-800">
                <button
                  onClick={() => {
                    setIsUniverseMenuOpen(false);
                    onOpenManageUniverseModal();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-amber-400 hover:bg-amber-500/10 text-xs font-medium flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Nuevo Universo</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Story Breadcrumb */}
        {activeStory && (
          <div className="hidden lg:flex items-center gap-1.5 text-neutral-400">
            <span className="text-neutral-600">›</span>
            <button
              onClick={onOpenManageStoryModal}
              title="Cambiar o configurar historia"
              className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-amber-300 max-w-[140px] truncate transition-colors"
            >
              <Book className="w-3 h-3 text-neutral-500" />
              <span className="truncate">{activeStory.title}</span>
            </button>
          </div>
        )}

        {/* Offline Connectivity Badge */}
        {!isOnline && (
          <div
            onClick={onOpenAndroidModal}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-medium cursor-pointer shrink-0"
            title="Trabajando sin conexión — Tus datos se guardan localmente en el dispositivo"
          >
            <WifiOff className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Offline Activo</span>
          </div>
        )}

        {/* Disk connection indicator */}
        <button
          onClick={connectLocalDirectory}
          title={isDiskConnected ? `Conectado a carpeta: ${diskFolderName}` : 'Hacer clic para abrir carpeta local en el equipo'}
          className={`hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
            isDiskConnected
              ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/50'
              : 'bg-neutral-800 text-neutral-400 border border-neutral-700/50 hover:bg-neutral-700 hover:text-white'
          }`}
        >
          {isDiskConnected ? <FolderGit2 className="w-3 h-3 text-emerald-400" /> : <HardDrive className="w-3 h-3" />}
          <span className="truncate max-w-[100px]">
            {isDiskConnected ? `📁 ${diskFolderName}` : 'Disco Local'}
          </span>
        </button>
      </div>

      {/* Zone 2: Global Search Shortcut Bar */}
      <div className="hidden sm:flex items-center justify-center flex-1 max-w-xs lg:max-w-sm mx-3">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1 bg-neutral-950/70 hover:bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800 rounded-lg transition-colors text-xs"
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span className="truncate">Buscar en notas, historias y lore...</span>
          </span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-neutral-800 rounded border border-neutral-700 text-neutral-400">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Actions, Android & Desktop Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Search icon for mobile */}
        <button
          onClick={onOpenSearch}
          title="Buscar"
          className="sm:hidden min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg hover:bg-neutral-800 text-neutral-300"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Android Offline App Button */}
        <button
          onClick={onOpenAndroidModal}
          title="Instalar o descargar aplicación Android Offline (.APK / WebAPK)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:inline">App Android Offline</span>
          <span className="md:hidden">Android</span>
        </button>

        <button
          onClick={exportZipArchive}
          title="Exportar todo el universo a ZIP"
          className="hidden sm:flex p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          <FileArchive className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenImportExport}
          title="Copia de seguridad y sincronización"
          className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          <HardDrive className="w-4 h-4" />
        </button>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
