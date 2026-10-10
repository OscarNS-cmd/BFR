import React, { useState } from 'react';
import {
  Feather,
  Plus,
  BookOpen,
  Users,
  Compass,
  Upload,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  Scroll,
  Smartphone,
} from 'lucide-react';
import { useLore } from '../../context/LoreContext';

interface WelcomeScreenProps {
  onOpenCreateUniverseModal?: () => void;
  onOpenImportModal?: () => void;
  onOpenAndroidModal?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onOpenCreateUniverseModal,
  onOpenImportModal,
  onOpenAndroidModal,
}) => {
  const { createUniverse, createStory, loadDemoUniverse } = useLore();
  const [isCreatingInline, setIsCreatingInline] = useState(false);
  const [universeName, setUniverseName] = useState('');
  const [universeDesc, setUniverseDesc] = useState('');
  const [initialStoryName, setInitialStoryName] = useState('Libro 1: El Despertar');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!universeName.trim()) return;

    const newUniv = createUniverse(universeName.trim(), universeDesc.trim());
    if (initialStoryName.trim()) {
      createStory(initialStoryName.trim(), 'Manuscrito principal de la saga.');
    }
  };

  return (
    <div className="h-screen w-screen overflow-y-auto bg-neutral-950 text-neutral-100 flex flex-col justify-between font-sans selection:bg-amber-600/30 selection:text-amber-200 relative">
      {/* Subtle ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-amber-800/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* Top minimal bar */}
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between border-b border-neutral-900 z-10 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-950/40 shrink-0">
            <Feather className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-lg tracking-wider text-neutral-100">
            Grimorio
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAndroidModal && (
            <button
              onClick={onOpenAndroidModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 text-xs font-medium transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>App Android Offline</span>
            </button>
          )}

          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline">Importar Copia (.json)</span>
              <span className="sm:hidden">Importar</span>
            </button>
          )}
        </div>
      </header>

      {/* Center Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 z-10 max-w-4xl mx-auto text-center">
        {/* Emblem */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-amber-500/20 to-neutral-900 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 shadow-xl shadow-black/50">
          <Sparkles className="w-8 h-8" />
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-100 max-w-2xl leading-[1.15]">
          Estudio de Worldbuilding & Lore
        </h1>

        <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-xl font-normal leading-relaxed">
          Estructura tus universos, sagas, novelas y fichas de lore con arquitectura jerárquica,
          soporte Markdown nativo y motor 100% offline para Android y escritorio.
        </p>

        {/* Primary Call to Action */}
        {!isCreatingInline ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsCreatingInline(true)}
              className="flex items-center gap-3 px-7 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-xl shadow-amber-900/40 hover:shadow-amber-800/60 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>+ Crear Nuevo Universo</span>
            </button>

            {onOpenAndroidModal && (
              <button
                onClick={onOpenAndroidModal}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 text-sm font-medium transition-colors cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Instalar / APK Android</span>
              </button>
            )}

            {onOpenImportModal && (
              <button
                onClick={onOpenImportModal}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 text-sm font-medium transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4 text-neutral-400" />
                <span>Restaurar Copia</span>
              </button>
            )}
          </div>
        ) : (
          /* Inline Creation Card */
          <div className="mt-8 w-full max-w-md bg-neutral-900/90 border border-amber-600/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <h3 className="font-serif font-bold text-sm text-neutral-100">
                  Nuevo Universo / Proyecto de Lore
                </h3>
              </div>
              <button
                onClick={() => setIsCreatingInline(false)}
                className="text-neutral-500 hover:text-neutral-300 text-xs"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Nombre del Universo: <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={universeName}
                  onChange={(e) => setUniverseName(e.target.value)}
                  placeholder="Ej: Aethelgard, Crónicas de Eldoria, Neo-Tokyo..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-950 text-neutral-100 placeholder-neutral-500 text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  Descripción o Premisa (opcional):
                </label>
                <textarea
                  rows={2}
                  value={universeDesc}
                  onChange={(e) => setUniverseDesc(e.target.value)}
                  placeholder="Mundo de fantasía oscura azotado por un cataclismo astral..."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100 placeholder-neutral-500 text-xs focus:outline-hidden focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  Primera Historia / Saga inicial (opcional):
                </label>
                <input
                  type="text"
                  value={initialStoryName}
                  onChange={(e) => setInitialStoryName(e.target.value)}
                  placeholder="Ej: Libro 1: El Despertar"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100 placeholder-neutral-500 text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingInline(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  <span>Comenzar Universo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Feature Highlights Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left">
          <div className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-xs text-neutral-200">1. Multi-Universo</h4>
            <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
              Crea y cambia libremente entre proyectos independientes sin mezclar su lore ni sus personajes.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-xs text-neutral-200">2. Historias Jerárquicas</h4>
            <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
              Cada historia cuenta con 5 subcarpetas dedicadas: Capítulos, Personajes, Mundo, Criaturas y Apuntes.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3">
              <Database className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-xs text-neutral-200">3. Persistencia Total</h4>
            <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
              Guardado automático en tiempo real en localStorage, exportación a archivo ZIP y respaldos JSON.
            </p>
          </div>
        </div>

        {/* Optional Demo Loader button */}
        <div className="mt-8">
          <button
            onClick={loadDemoUniverse}
            className="text-[11px] text-neutral-500 hover:text-amber-400 underline underline-offset-4 transition-colors"
          >
            ¿Prefieres explorar primero? Cargar universo de ejemplo (Aethelgard)
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-neutral-900 text-center text-[11px] text-neutral-600 z-10">
        Grimorio Studio • Arquitectura Multi-Universo & Sistema de Lore Jerárquico
      </footer>
    </div>
  );
};
