import React, { useState } from 'react';
import {
  Book,
  Plus,
  Clock,
  User,
  ChevronRight,
  FileEdit,
  Globe,
  Skull,
  Scroll,
  Sparkles,
  Edit2,
  Trash2,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useLore } from '../../context/LoreContext';
import { StorySubfolderKey, STORY_SUBFOLDERS, LoreDocument } from '../../types/lore';

export const StoriesModule: React.FC = () => {
  const {
    activeUniverse,
    universeStories,
    activeStory,
    activeStoryId,
    setActiveStoryId,
    createStory,
    renameStory,
    deleteStory,
    storyDocuments,
    createDocument,
    deleteDocument,
    setActiveDocId,
    setActiveModule,
  } = useLore();

  const [activeSubfolderTab, setActiveSubfolderTab] = useState<StorySubfolderKey | 'overview'>('overview');
  const [deleteDocConfirmId, setDeleteDocConfirmId] = useState<string | null>(null);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStorySynopsis, setNewStorySynopsis] = useState('');

  // Story edit
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSynopsis, setEditSynopsis] = useState('');

  // Delete confirm
  const [confirmDeleteStory, setConfirmDeleteStory] = useState(false);

  // Quick document creation inside active story
  const [quickDocTitle, setQuickDocTitle] = useState('');
  const [targetQuickSubfolder, setTargetQuickSubfolder] = useState<StorySubfolderKey>('chapters');
  const [isQuickDocOpen, setIsQuickDocOpen] = useState(false);

  const handleCreateStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryTitle.trim()) return;

    createStory(newStoryTitle.trim(), newStorySynopsis.trim());
    setNewStoryTitle('');
    setNewStorySynopsis('');
    setIsCreatingStory(false);
  };

  const handleStartEdit = () => {
    if (!activeStory) return;
    setEditTitle(activeStory.title);
    setEditSynopsis(activeStory.synopsis || '');
    setIsEditingStory(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStory || !editTitle.trim()) return;
    renameStory(activeStory.id, editTitle.trim(), editSynopsis.trim());
    setIsEditingStory(false);
  };

  const handleDeleteStory = () => {
    if (!activeStory) return;
    deleteStory(activeStory.id);
    setConfirmDeleteStory(false);
  };

  const handleOpenDoc = (id: string) => {
    setActiveDocId(id);
    setActiveModule('editor');
  };

  const handleQuickCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickDocTitle.trim()) return;

    const newDoc = createDocument({
      title: quickDocTitle.trim(),
      storyId: activeStoryId,
      subfolder: targetQuickSubfolder,
    });
    setQuickDocTitle('');
    setIsQuickDocOpen(false);
    handleOpenDoc(newDoc.id);
  };

  // If no universe
  if (!activeUniverse) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center text-neutral-500">
        <p>No hay un universo seleccionado.</p>
      </div>
    );
  }

  // If no stories exist in this universe
  if (universeStories.length === 0) {
    return (
      <div className="h-full overflow-y-auto p-8 flex flex-col items-center justify-center bg-neutral-950 text-neutral-100">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-4 shadow-xl">
          <Book className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-neutral-100">
          Sección Principal: Historias
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md text-center mt-2 leading-relaxed">
          En este universo ({activeUniverse.name}) aún no has agregado ninguna historia independiente.
          Comienza creando tu primera novela, saga o relato.
        </p>

        {!isCreatingStory ? (
          <button
            onClick={() => setIsCreatingStory(true)}
            className="mt-6 flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Crear Primera Historia</span>
          </button>
        ) : (
          <form
            onSubmit={handleCreateStorySubmit}
            className="mt-6 w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 text-xs text-left animate-in fade-in"
          >
            <div>
              <label className="block text-neutral-300 font-medium mb-1">
                Título de la Historia: <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={newStoryTitle}
                onChange={(e) => setNewStoryTitle(e.target.value)}
                placeholder="Ej: Libro 1: El Despertar, Spin-off del Norte..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-neutral-100 placeholder-neutral-500 text-xs focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 font-medium mb-1">
                Sinopsis o Premisa (opcional):
              </label>
              <textarea
                rows={2}
                value={newStorySynopsis}
                onChange={(e) => setNewStorySynopsis(e.target.value)}
                placeholder="Breve resumen del conflicto o trama principal..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100 placeholder-neutral-500 text-xs focus:outline-hidden focus:border-amber-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreatingStory(false)}
                className="px-3 py-1.5 rounded-xl text-neutral-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-xs"
              >
                Crear Historia
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  const chaptersDocs = storyDocuments.filter((d) => d.subfolder === 'chapters');
  const charactersDocs = storyDocuments.filter((d) => d.subfolder === 'characters');
  const locationsDocs = storyDocuments.filter((d) => d.subfolder === 'locations');
  const creaturesDocs = storyDocuments.filter((d) => d.subfolder === 'creatures');
  const notesDocs = storyDocuments.filter((d) => d.subfolder === 'notes');

  const totalWords = storyDocuments.reduce((acc, d) => acc + d.wordCount, 0);

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8 bg-neutral-950 text-neutral-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Story Selector Tabs Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs flex-1">
            <span className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider shrink-0 mr-1 flex items-center gap-1.5">
              <Book className="w-3.5 h-3.5 text-amber-500" />
              <span>Historias:</span>
            </span>

            {universeStories.map((story) => {
              const isSelected = story.id === activeStoryId;
              return (
                <button
                  key={story.id}
                  onClick={() => {
                    setActiveStoryId(story.id);
                    setActiveSubfolderTab('overview');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-xs font-semibold'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                  }`}
                >
                  {story.title}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsCreatingStory(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-amber-400 text-xs font-semibold shrink-0 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nueva Historia</span>
          </button>
        </div>

        {/* Modal / Card to create new story if clicked */}
        {isCreatingStory && (
          <div className="p-4 rounded-2xl bg-neutral-900/90 border border-amber-600/30 text-xs animate-in fade-in">
            <h4 className="font-semibold text-neutral-200 mb-2">Crear Nueva Historia Independiente</h4>
            <form onSubmit={handleCreateStorySubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  placeholder="Título (Ej: Libro 2: La Ciudad Sumergida, Spin-off del Dragón...)"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newStorySynopsis}
                  onChange={(e) => setNewStorySynopsis(e.target.value)}
                  placeholder="Sinopsis breve (opcional)..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-white text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingStory(false)}
                  className="px-3 py-1 rounded-lg text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold"
                >
                  Crear Historia
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Active Story Banner & Controls */}
        {activeStory && (
          <div className="p-5 sm:p-6 rounded-2xl bg-linear-to-r from-neutral-900/90 to-neutral-900/40 border border-neutral-800/80 shadow-xl backdrop-blur-xs">
            {!isEditingStory ? (
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-600/20 text-amber-400 font-mono">
                      Historia Activa
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">
                      {storyDocuments.length} documentos • {totalWords.toLocaleString()} palabras
                    </span>
                  </div>

                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-100">
                    {activeStory.title}
                  </h1>

                  <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
                    {activeStory.synopsis || 'Sin sinopsis registrada aún para esta historia.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleStartEdit}
                    title="Editar título y sinopsis"
                    className="p-2 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => setConfirmDeleteStory(true)}
                    title="Eliminar esta historia"
                    className="p-2 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 text-xs transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">Título de la Historia:</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white text-xs focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">Sinopsis:</label>
                  <textarea
                    rows={2}
                    value={editSynopsis}
                    onChange={(e) => setEditSynopsis(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-950 text-white text-xs focus:outline-hidden focus:border-amber-500 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingStory(false)}
                    className="px-3 py-1.5 rounded-xl text-neutral-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            )}

            {/* Delete Confirmation Box */}
            {confirmDeleteStory && (
              <div className="mt-4 p-3.5 rounded-xl border border-rose-500/50 bg-rose-950/30 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-rose-400 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>¿Estás seguro de eliminar "{activeStory.title}"?</span>
                </div>
                <p className="text-neutral-400 text-[11px]">
                  Se borrarán las subcarpetas y {storyDocuments.length} notas de esta historia.
                </p>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setConfirmDeleteStory(false)}
                    className="px-3 py-1 rounded-lg text-neutral-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteStory}
                    className="px-3.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold"
                  >
                    Sí, Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subfolders Navigation Tabs */}
        <div className="flex items-center gap-1.5 border-b border-neutral-800 pb-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveSubfolderTab('overview')}
            className={`px-3.5 py-2 rounded-xl font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              activeSubfolderTab === 'overview'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Vista General ({storyDocuments.length})</span>
          </button>

          {STORY_SUBFOLDERS.map((sub) => {
            const count = storyDocuments.filter((d) => d.subfolder === sub.key).length;
            const isTabActive = activeSubfolderTab === sub.key;

            return (
              <button
                key={sub.key}
                onClick={() => setActiveSubfolderTab(sub.key)}
                className={`px-3.5 py-2 rounded-xl font-medium transition-colors shrink-0 flex items-center gap-2 ${
                  isTabActive
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <span>{sub.emoji}</span>
                <span>{sub.label}</span>
                <span className="text-[10px] text-neutral-500 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Quick Doc Creator in Story */}
        {isQuickDocOpen && (
          <form
            onSubmit={handleQuickCreateDoc}
            className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs flex flex-col sm:flex-row items-center gap-3 animate-in fade-in"
          >
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-neutral-400">Subcarpeta:</span>
              <select
                value={targetQuickSubfolder}
                onChange={(e) => setTargetQuickSubfolder(e.target.value as StorySubfolderKey)}
                className="px-2.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-950 text-white"
              >
                {STORY_SUBFOLDERS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.emoji} {s.label}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              required
              autoFocus
              value={quickDocTitle}
              onChange={(e) => setQuickDocTitle(e.target.value)}
              placeholder="Título de la entrada o capítulo..."
              className="flex-1 w-full px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-950 text-white text-xs focus:outline-hidden focus:border-amber-500"
            />

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsQuickDocOpen(false)}
                className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold"
              >
                Crear y Abrir
              </button>
            </div>
          </form>
        )}

        {/* Render 5 Subfolder Panels */}
        {activeSubfolderTab === 'overview' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STORY_SUBFOLDERS.map((sub) => {
              const subDocs = storyDocuments.filter((d) => d.subfolder === sub.key);

              return (
                <div
                  key={sub.key}
                  className="rounded-2xl border border-neutral-800/90 bg-neutral-900/50 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{sub.emoji}</span>
                        <div>
                          <h3 className="font-semibold text-xs text-neutral-200">{sub.label}</h3>
                          <p className="text-[10px] text-neutral-500">{sub.description}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                        {subDocs.length}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
                      {subDocs.length === 0 ? (
                        <p className="text-[11px] text-neutral-500 italic py-2">
                          Sin elementos en esta subcarpeta.
                        </p>
                      ) : (
                        subDocs.map((doc) => (
                          <div
                            key={doc.id}
                            onClick={() => handleOpenDoc(doc.id)}
                            className="flex items-center justify-between p-1.5 rounded-lg hover:bg-neutral-800 text-xs cursor-pointer text-neutral-300 hover:text-white transition-colors group"
                          >
                            <span className="truncate flex-1 mr-2">{doc.frontmatter.title}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] text-neutral-500 font-mono group-hover:text-amber-400">
                                {doc.wordCount} pal.
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`¿Eliminar "${doc.frontmatter.title}"?`)) {
                                    deleteDocument(doc.id);
                                  }
                                }}
                                title="Eliminar documento"
                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-neutral-500 hover:text-rose-400 transition-opacity ml-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setTargetQuickSubfolder(sub.key);
                      setIsQuickDocOpen(true);
                    }}
                    className="w-full mt-2 py-1.5 rounded-xl border border-dashed border-neutral-700/80 hover:border-amber-500/60 text-neutral-400 hover:text-amber-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar a {sub.label}</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* Single Subfolder Dedicated View */
          <div className="space-y-4">
            {(() => {
              const currentSub = STORY_SUBFOLDERS.find((s) => s.key === activeSubfolderTab)!;
              const subDocs = storyDocuments.filter((d) => d.subfolder === activeSubfolderTab);

              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{currentSub.emoji}</span>
                      <div>
                        <h2 className="font-serif text-lg font-bold text-neutral-100">
                          {currentSub.label} de "{activeStory?.title}"
                        </h2>
                        <p className="text-xs text-neutral-400">{currentSub.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setTargetQuickSubfolder(currentSub.key);
                        setIsQuickDocOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nuevo Documento</span>
                    </button>
                  </div>

                  {subDocs.length === 0 ? (
                    <div className="py-12 text-center text-neutral-500 text-xs border border-dashed border-neutral-800 rounded-2xl">
                      <p>Esta subcarpeta está vacía actualmente.</p>
                      <button
                        onClick={() => {
                          setTargetQuickSubfolder(currentSub.key);
                          setIsQuickDocOpen(true);
                        }}
                        className="mt-3 px-4 py-2 rounded-xl bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Primer Documento</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {subDocs.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => handleOpenDoc(doc.id)}
                          className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:border-amber-600/40 hover:bg-neutral-900 text-xs cursor-pointer transition-all space-y-2 group shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-neutral-200 group-hover:text-amber-300 truncate flex-1 mr-2">
                              {doc.frontmatter.title}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] font-mono text-neutral-500">
                                {doc.wordCount} pal.
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteDocConfirmId(doc.id);
                                }}
                                title="Eliminar documento"
                                className="p-1 rounded hover:bg-rose-500/10 text-neutral-500 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {deleteDocConfirmId === doc.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center justify-between gap-2 animate-in fade-in"
                            >
                              <span className="flex items-center gap-1 font-medium text-[11px]">
                                <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                                <span>¿Eliminar?</span>
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => setDeleteDocConfirmId(null)}
                                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px]"
                                >
                                  No
                                </button>
                                <button
                                  onClick={() => {
                                    deleteDocument(doc.id);
                                    setDeleteDocConfirmId(null);
                                  }}
                                  className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-[10px]"
                                >
                                  Sí
                                </button>
                              </div>
                            </div>
                          )}

                          {doc.frontmatter.summary ? (
                            <p className="text-[11px] text-neutral-400 line-clamp-2">
                              {doc.frontmatter.summary}
                            </p>
                          ) : (
                            <p className="text-[11px] text-neutral-500 line-clamp-2 italic">
                              {doc.content.slice(0, 100) || 'Sin contenido adicional...'}
                            </p>
                          )}

                          <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-500">
                            <span>Modificado {new Date(doc.lastModified).toLocaleDateString()}</span>
                            <span className="group-hover:text-amber-400 flex items-center gap-1">
                              <span>Abrir</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
