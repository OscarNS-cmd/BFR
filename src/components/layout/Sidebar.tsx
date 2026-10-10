import React, { useState } from 'react';
import {
  Book,
  Users,
  Calendar,
  Skull,
  Network,
  Image,
  Plus,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  Trash2,
  Download,
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
  Scroll,
  Layers,
  ChevronUp,
  Settings2,
  FileEdit,
  X,
} from 'lucide-react';
import { useLore } from '../../context/LoreContext';
import { ActiveModule, DocumentType, LoreDocument, StorySubfolderKey, STORY_SUBFOLDERS } from '../../types/lore';
import { downloadMarkdownFile } from '../../utils/fileSystem';

interface SidebarProps {
  onOpenNewDocModal: (type?: DocumentType, storyId?: string | null, subfolder?: StorySubfolderKey) => void;
  onOpenManageUniverseModal: () => void;
  onOpenManageStoryModal: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenNewDocModal,
  onOpenManageUniverseModal,
  onOpenManageStoryModal,
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const {
    universes,
    activeUniverse,
    activeUniverseId,
    setActiveUniverseId,
    universeStories,
    activeStoryId,
    setActiveStoryId,
    universeDocuments,
    activeDocId,
    setActiveDocId,
    activeModule,
    setActiveModule,
    deleteDocument,
    deleteStory,
  } = useLore();

  const [isUniverseDropdownOpen, setIsUniverseDropdownOpen] = useState(false);

  // Expanded state for stories
  const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (activeStoryId) initial[activeStoryId] = true;
    return initial;
  });

  // Expanded state for subfolders inside stories: key = `${storyId}:${subfolderKey}`
  const [expandedSubfolders, setExpandedSubfolders] = useState<Record<string, boolean>>({
    'default:chapters': true,
    'default:characters': true,
    'default:locations': true,
    'default:creatures': true,
    'default:notes': true,
  });

  const toggleStoryExpand = (storyId: string) => {
    setExpandedStories((prev) => ({ ...prev, [storyId]: !prev[storyId] }));
  };

  const toggleSubfolderExpand = (storyId: string, subfolderKey: string) => {
    const key = `${storyId}:${subfolderKey}`;
    setExpandedSubfolders((prev) => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key],
    }));
  };

  const isSubfolderExpanded = (storyId: string, subfolderKey: string) => {
    const key = `${storyId}:${subfolderKey}`;
    return expandedSubfolders[key] !== false; // Default to open
  };

  const getSubfolderIcon = (key: StorySubfolderKey) => {
    switch (key) {
      case 'chapters':
        return <Book className="w-3.5 h-3.5 text-amber-500" />;
      case 'characters':
        return <Users className="w-3.5 h-3.5 text-emerald-500" />;
      case 'locations':
        return <Globe className="w-3.5 h-3.5 text-purple-500" />;
      case 'creatures':
        return <Skull className="w-3.5 h-3.5 text-rose-500" />;
      case 'notes':
      default:
        return <Scroll className="w-3.5 h-3.5 text-sky-500" />;
    }
  };

  if (collapsed && !mobileOpen) {
    return (
      <aside className="hidden md:flex w-12 bg-neutral-900 border-r border-neutral-800 flex-col items-center py-3 select-none shrink-0 z-20">
        <button
          onClick={onToggleCollapse}
          title="Expandir barra lateral"
          className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors mb-4"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveModule('stories')}
          title="Historias & Arcos"
          className={`p-2 rounded-lg mb-2 transition-colors ${
            activeModule === 'stories' ? 'bg-amber-600/20 text-amber-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Book className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveModule('graph')}
          title="Grafo de Relaciones"
          className={`p-2 rounded-lg mb-2 transition-colors ${
            activeModule === 'graph' ? 'bg-amber-600/20 text-amber-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Network className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveModule('timeline')}
          title="Cronología"
          className={`p-2 rounded-lg mb-2 transition-colors ${
            activeModule === 'timeline' ? 'bg-amber-600/20 text-amber-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
        </button>
      </aside>
    );
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={`${
          mobileOpen ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden md:flex'
        } w-72 bg-neutral-900 border-r border-neutral-800 flex-col h-full select-none shrink-0 z-20`}
      >
        {/* 1. Universe Selector Header */}
        <div className="p-3 border-b border-neutral-800 bg-neutral-950/40 relative">
          <div className="flex items-center justify-between gap-1 text-xs">
            <button
              onClick={() => setIsUniverseDropdownOpen((prev) => !prev)}
              className="flex-1 min-w-0 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-left transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Layers className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-neutral-500 leading-none">Universo Activo</p>
                  <p className="font-serif font-bold text-neutral-100 truncate text-xs mt-0.5">
                    {activeUniverse?.name || 'Seleccionar Universo'}
                  </p>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-1" />
            </button>

            <button
              onClick={onOpenManageUniverseModal}
              title="Administrar Universos"
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shrink-0"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>

            {mobileOpen && onCloseMobile ? (
              <button
                onClick={onCloseMobile}
                title="Cerrar menú"
                className="md:hidden p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onToggleCollapse}
                title="Plegar barra lateral"
                className="hidden md:flex p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shrink-0"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        {/* Universe Dropdown Menu */}
        {isUniverseDropdownOpen && (
          <div className="absolute top-full left-3 right-3 mt-1 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-1.5 z-40 text-xs">
            <div className="px-2 py-1 text-[10px] uppercase font-semibold text-neutral-400 tracking-wider">
              Cambiar Universo
            </div>
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {universes.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setActiveUniverseId(u.id);
                    setIsUniverseDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs truncate flex items-center justify-between ${
                    u.id === activeUniverseId
                      ? 'bg-amber-600/20 text-amber-400 font-semibold'
                      : 'text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  <span className="truncate">{u.name}</span>
                  {u.id === activeUniverseId && <span className="text-[10px] text-amber-500">✓</span>}
                </button>
              ))}
            </div>
            <div className="pt-1.5 mt-1 border-t border-neutral-800 flex flex-col gap-1">
              <button
                onClick={() => {
                  setIsUniverseDropdownOpen(false);
                  onOpenManageUniverseModal();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-amber-400 hover:bg-amber-500/10 text-xs font-medium flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nuevo Universo / Administrar</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Primary Navigation Views */}
      <div className="px-3 pt-3 pb-2 border-b border-neutral-800/80 shrink-0">
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <button
            onClick={() => setActiveModule('stories')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeModule === 'stories'
                ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Book className="w-3.5 h-3.5" />
            <span className="truncate">Historias Hub</span>
          </button>

          <button
            onClick={() => setActiveModule('graph')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              activeModule === 'graph'
                ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span className="truncate">Grafo Lore</span>
          </button>
        </div>
      </div>

      {/* 3. Main Hierarchical Explorer */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs">
        {/* Section: Historias */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Book className="w-3 h-3 text-amber-500" />
              <span>Historias</span>
            </span>
            <button
              onClick={onOpenManageStoryModal}
              title="Agregar nueva historia"
              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-500" />
            </button>
          </div>

          {universeStories.length === 0 ? (
            <div className="p-3 mx-1 rounded-xl border border-dashed border-neutral-800 text-center text-neutral-500 space-y-2">
              <p className="text-[11px]">No hay historias creadas en este universo.</p>
              <button
                onClick={onOpenManageStoryModal}
                className="px-3 py-1 rounded-lg bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 text-[11px] font-medium inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Crear Primera Historia</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {universeStories.map((story) => {
                const isStoryActive = story.id === activeStoryId;
                const isExpanded = expandedStories[story.id] !== false;
                const storyDocs = universeDocuments.filter((d) => d.storyId === story.id);

                return (
                  <div
                    key={story.id}
                    className={`rounded-xl border transition-colors ${
                      isStoryActive
                        ? 'border-neutral-700 bg-neutral-950/60'
                        : 'border-neutral-800/60 bg-neutral-950/20 hover:border-neutral-800'
                    }`}
                  >
                    {/* Story Header */}
                    <div
                      className="flex items-center justify-between p-2 cursor-pointer group"
                      onClick={() => {
                        setActiveStoryId(story.id);
                        toggleStoryExpand(story.id);
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        )}
                        <span
                          className={`font-semibold truncate text-xs ${
                            isStoryActive ? 'text-amber-400 font-bold' : 'text-neutral-200'
                          }`}
                        >
                          {story.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-neutral-500 font-mono px-1.5 py-0.5 rounded bg-neutral-900">
                          {storyDocs.length}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`¿Eliminar la historia "${story.title}" y todas sus notas?`)) {
                              deleteStory(story.id);
                            }
                          }}
                          title="Eliminar historia"
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-500 hover:text-rose-400 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Subfolders for this story */}
                    {isExpanded && (
                      <div className="px-2 pb-2 space-y-1 border-t border-neutral-800/60 pt-1.5">
                        {STORY_SUBFOLDERS.map((subfolder) => {
                          const subDocs = storyDocs.filter((d) => d.subfolder === subfolder.key);
                          const subfolderOpen = isSubfolderExpanded(story.id, subfolder.key);

                          return (
                            <div key={subfolder.key} className="space-y-0.5">
                              {/* Subfolder Row */}
                              <div className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-neutral-900 group transition-colors">
                                <div
                                  className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                                  onClick={() => toggleSubfolderExpand(story.id, subfolder.key)}
                                >
                                  {subfolderOpen ? (
                                    <ChevronDown className="w-3 h-3 text-neutral-500 shrink-0" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 text-neutral-500 shrink-0" />
                                  )}
                                  <span className="text-xs">{subfolder.emoji}</span>
                                  <span className="text-neutral-300 font-medium text-xs truncate">
                                    {subfolder.label}
                                  </span>
                                  <span className="text-[10px] text-neutral-500 font-mono">
                                    ({subDocs.length})
                                  </span>
                                </div>

                                {/* Add doc directly in this subfolder */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveStoryId(story.id);
                                    onOpenNewDocModal(subfolder.defaultType, story.id, subfolder.key);
                                  }}
                                  title={`Agregar a ${subfolder.label}`}
                                  className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-amber-400 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Documents in Subfolder */}
                              {subfolderOpen && subDocs.length > 0 && (
                                <div className="pl-6 space-y-0.5 border-l border-neutral-800/80 ml-3">
                                  {subDocs.map((doc) => {
                                    const isDocActive = doc.id === activeDocId && activeModule === 'editor';

                                    return (
                                      <div
                                        key={doc.id}
                                        onClick={() => {
                                          setActiveDocId(doc.id);
                                          setActiveModule('editor');
                                          onCloseMobile?.();
                                        }}
                                        className={`group/doc flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer text-xs transition-colors ${
                                          isDocActive
                                            ? 'bg-amber-600/20 text-amber-300 font-medium'
                                            : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <FileText className="w-3 h-3 shrink-0 opacity-70" />
                                          <span className="truncate">{doc.frontmatter.title}</span>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover/doc:opacity-100 transition-opacity">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              downloadMarkdownFile(doc);
                                            }}
                                            title="Descargar archivo .md"
                                            className="p-0.5 text-neutral-500 hover:text-white"
                                          >
                                            <Download className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (window.confirm(`¿Eliminar "${doc.frontmatter.title}"?`)) {
                                                deleteDocument(doc.id);
                                              }
                                            }}
                                            title="Eliminar documento"
                                            className="p-0.5 text-neutral-500 hover:text-rose-400"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section: Universe-wide Views */}
        <div className="pt-2 border-t border-neutral-800/60">
          <div className="px-2 mb-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Vistas Globales
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => {
                setActiveModule('characters');
                onCloseMobile?.();
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                activeModule === 'characters'
                  ? 'bg-amber-600/20 text-amber-300 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>Personajes del Universo</span>
            </button>

            <button
              onClick={() => {
                setActiveModule('bestiary');
                onCloseMobile?.();
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                activeModule === 'bestiary'
                  ? 'bg-amber-600/20 text-amber-300 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              <Skull className="w-3.5 h-3.5 text-rose-500" />
              <span>Bestiario y Facciones</span>
            </button>

            <button
              onClick={() => {
                setActiveModule('timeline');
                onCloseMobile?.();
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                activeModule === 'timeline'
                  ? 'bg-amber-600/20 text-amber-300 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-sky-500" />
              <span>Cronología & Mermaid</span>
            </button>

            <button
              onClick={() => {
                setActiveModule('gallery');
                onCloseMobile?.();
              }}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                activeModule === 'gallery'
                  ? 'bg-amber-600/20 text-amber-300 font-medium'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              <Image className="w-3.5 h-3.5 text-purple-500" />
              <span>Galería de Medios</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bottom Quick Actions */}
      <div className="p-3 border-t border-neutral-800 bg-neutral-950/40 shrink-0">
        <button
          onClick={() => {
            onCloseMobile?.();
            onOpenNewDocModal();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-600/30 font-semibold text-xs transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva Nota Rápida</span>
        </button>
      </div>
    </aside>
    </>
  );
};
