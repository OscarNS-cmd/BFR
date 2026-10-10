import React, { useState } from 'react';
import { X, Book, Plus, Edit2, Trash2, Check, ArrowRight, AlertTriangle } from 'lucide-react';
import { useLore } from '../../context/LoreContext';
import { Story } from '../../types/lore';

interface ManageStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'manage';
}

export const ManageStoryModal: React.FC<ManageStoryModalProps> = ({
  isOpen,
  onClose,
  mode = 'create',
}) => {
  const {
    activeUniverse,
    universeStories,
    activeStoryId,
    setActiveStoryId,
    createStory,
    renameStory,
    deleteStory,
    documents,
  } = useLore();

  const [activeTab, setActiveTab] = useState<'create' | 'list'>(mode === 'create' ? 'create' : 'list');
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingSynopsis, setEditingSynopsis] = useState('');

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createStory(title.trim(), synopsis.trim());
    setTitle('');
    setSynopsis('');
    onClose();
  };

  const handleStartEdit = (story: Story) => {
    setEditingId(story.id);
    setEditingTitle(story.title);
    setEditingSynopsis(story.synopsis || '');
  };

  const handleSaveEdit = (id: string) => {
    if (!editingTitle.trim()) return;
    renameStory(id, editingTitle.trim(), editingSynopsis.trim());
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteStory(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden text-neutral-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Book className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm">Historias & Manuscritos</h3>
              <p className="text-[11px] text-neutral-400">
                Universo: <span className="text-amber-400 font-medium">{activeUniverse?.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2.5 font-medium transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'create'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nueva Historia</span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2.5 font-medium transition-colors border-b-2 ${
              activeTab === 'list'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Todas las Historias ({universeStories.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'create' ? (
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-300 mb-1.5">
                  Título de la Historia / Novela: <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Libro 1: El Despertar, Spin-off del Norte, Las Crónicas de Ceniza..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-700 bg-neutral-950 text-neutral-100 placeholder-neutral-500 text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-400 mb-1.5">
                  Sinopsis / Premisa Argumental (opcional):
                </label>
                <textarea
                  rows={3}
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  placeholder="Resumen del conflicto principal, protagonistas o tema central..."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100 placeholder-neutral-500 text-xs focus:outline-hidden focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-md transition-colors"
                >
                  <span>Crear Historia</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {universeStories.length === 0 ? (
                <div className="py-8 text-center text-neutral-500 text-xs">
                  <p>No hay historias registradas en este universo aún.</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-3 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Primera Historia</span>
                  </button>
                </div>
              ) : (
                universeStories.map((story) => {
                  const isActive = story.id === activeStoryId;
                  const storyDocCount = documents.filter((d) => d.storyId === story.id).length;

                  if (editingId === story.id) {
                    return (
                      <div
                        key={story.id}
                        className="p-3.5 rounded-xl border border-amber-500/40 bg-neutral-950 space-y-2.5 text-xs"
                      >
                        <div>
                          <label className="block text-[11px] text-neutral-400 mb-1">Título:</label>
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs focus:outline-hidden focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-neutral-400 mb-1">Sinopsis:</label>
                          <textarea
                            rows={2}
                            value={editingSynopsis}
                            onChange={(e) => setEditingSynopsis(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs focus:outline-hidden focus:border-amber-500 resize-none"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 rounded-lg text-neutral-400 hover:text-white"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveEdit(story.id)}
                            className="px-3.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Guardar</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (deleteConfirmId === story.id) {
                    return (
                      <div
                        key={story.id}
                        className="p-3.5 rounded-xl border border-rose-500/50 bg-rose-950/20 space-y-2 text-xs"
                      >
                        <div className="flex items-center gap-2 text-rose-400 font-semibold">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>¿Eliminar "{story.title}"?</span>
                        </div>
                        <p className="text-[11px] text-neutral-400">
                          Se eliminarán las {storyDocCount} notas y capítulos asignados a esta historia. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-3 py-1 rounded-lg text-neutral-400 hover:text-white"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleDelete(story.id)}
                            className="px-3.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Eliminar Historia</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={story.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isActive
                          ? 'border-amber-500/50 bg-amber-500/5'
                          : 'border-neutral-800 bg-neutral-950/50 hover:border-neutral-700'
                      }`}
                    >
                      <div
                        onClick={() => {
                          setActiveStoryId(story.id);
                          onClose();
                        }}
                        className="flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-xs text-neutral-200 truncate">
                            {story.title}
                          </h4>
                          {isActive && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-mono">
                              Activa
                            </span>
                          )}
                        </div>
                        {story.synopsis && (
                          <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                            {story.synopsis}
                          </p>
                        )}
                        <p className="text-[10px] text-neutral-500 mt-1">
                          {storyDocCount} documentos en subcarpetas
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(story)}
                          title="Renombrar / Editar"
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(story.id)}
                          title="Eliminar historia"
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
