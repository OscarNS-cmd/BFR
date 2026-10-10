import React, { useState, useEffect } from 'react';
import { X, Book, Users, Skull, Globe, Scroll, Sparkles, Folder } from 'lucide-react';
import { DocumentType, StorySubfolderKey, STORY_SUBFOLDERS } from '../../types/lore';
import { useLore } from '../../context/LoreContext';

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: DocumentType;
  defaultStoryId?: string | null;
  defaultSubfolder?: StorySubfolderKey;
}

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'note',
  defaultStoryId,
  defaultSubfolder,
}) => {
  const { createDocument, universeStories, activeStoryId } = useLore();
  const [title, setTitle] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(defaultStoryId || activeStoryId);
  const [selectedSubfolder, setSelectedSubfolder] = useState<StorySubfolderKey>(defaultSubfolder || 'notes');

  // Sync props when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedStoryId(defaultStoryId !== undefined ? defaultStoryId : activeStoryId);
      if (defaultSubfolder) {
        setSelectedSubfolder(defaultSubfolder);
      } else if (defaultType === 'story') {
        setSelectedSubfolder('chapters');
      } else if (defaultType === 'character') {
        setSelectedSubfolder('characters');
      } else if (defaultType === 'location') {
        setSelectedSubfolder('locations');
      } else if (defaultType === 'creature' || defaultType === 'faction') {
        setSelectedSubfolder('creatures');
      } else {
        setSelectedSubfolder('notes');
      }
    }
  }, [isOpen, defaultStoryId, defaultSubfolder, defaultType, activeStoryId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    createDocument({
      title: title.trim(),
      storyId: selectedStoryId,
      subfolder: selectedSubfolder,
      tags,
    });

    onClose();
    setTitle('');
    setTagsInput('');
  };

  const getSubfolderIcon = (key: StorySubfolderKey) => {
    switch (key) {
      case 'chapters':
        return <Book className="w-4 h-4 text-amber-500" />;
      case 'characters':
        return <Users className="w-4 h-4 text-emerald-500" />;
      case 'locations':
        return <Globe className="w-4 h-4 text-purple-500" />;
      case 'creatures':
        return <Skull className="w-4 h-4 text-rose-500" />;
      case 'notes':
      default:
        return <Scroll className="w-4 h-4 text-sky-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden text-neutral-100">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="font-serif font-bold text-base">Crear Nuevo Documento</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Select Story */}
          {universeStories.length > 0 && (
            <div>
              <label className="block font-medium text-neutral-300 mb-1.5">
                Asignar a Historia:
              </label>
              <select
                value={selectedStoryId || ''}
                onChange={(e) => setSelectedStoryId(e.target.value || null)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100 text-xs focus:outline-hidden focus:border-amber-500"
              >
                {universeStories.map((story) => (
                  <option key={story.id} value={story.id}>
                    {story.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Select Subfolder */}
          <div>
            <label className="block font-medium text-neutral-300 mb-2">
              Subcarpeta Jerárquica:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STORY_SUBFOLDERS.map((sub) => {
                const isSelected = selectedSubfolder === sub.key;

                return (
                  <div
                    key={sub.key}
                    onClick={() => setSelectedSubfolder(sub.key)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-neutral-800 bg-neutral-950/40 hover:border-neutral-700'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg shrink-0 bg-neutral-900 border border-neutral-800">
                      {getSubfolderIcon(sub.key)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-neutral-200 flex items-center gap-1.5">
                        <span>{sub.emoji}</span>
                        <span>{sub.label}</span>
                      </p>
                      <p className="text-[10px] text-neutral-500 leading-tight mt-0.5 truncate">
                        {sub.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-medium text-neutral-300 mb-1">
              Título o Nombre de la Entrada:
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Capítulo 1, Valerius, El Bosque Sombrío, Orden del Dragón..."
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100 placeholder-neutral-500 text-xs focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block font-medium text-neutral-400 mb-1">
              Etiquetas (opcional, separadas por comas):
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="principal, magia, combate, norte..."
              className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-100 placeholder-neutral-500 text-xs focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-colors shadow-xs"
            >
              Crear y Abrir en Editor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
