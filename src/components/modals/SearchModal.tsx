import React, { useState, useEffect } from 'react';
import { Search, X, FileText, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { useLore } from '../../context/LoreContext';
import { LoreDocument, DocumentType } from '../../types/lore';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { universeDocuments, setActiveDocId, setActiveModule } = useLore();
  const [query, setQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, filterType]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        handleSelect(filtered[selectedIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex]);

  if (!isOpen) return null;

  const filtered = universeDocuments.filter((doc) => {
    const matchesType = filterType === 'all' || doc.frontmatter.type === filterType;
    if (!matchesType) return false;

    if (!query.trim()) return true;

    const q = query.toLowerCase();
    const titleMatch = doc.frontmatter.title.toLowerCase().includes(q);
    const contentMatch = doc.content.toLowerCase().includes(q);
    const tagMatch = doc.frontmatter.tags?.some((t) => t.toLowerCase().includes(q));
    const roleMatch = (doc.frontmatter.role || '').toLowerCase().includes(q);

    return titleMatch || contentMatch || tagMatch || roleMatch;
  });

  const handleSelect = (id: string) => {
    setActiveDocId(id);
    setActiveModule('editor');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden text-neutral-100 flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
          <Search className="w-4 h-4 text-amber-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por título, contenido, facción, etiqueta..."
            className="flex-1 bg-transparent text-sm text-neutral-100 placeholder-neutral-500 focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Type Filter Bar */}
        <div className="px-4 py-2 border-b border-neutral-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] bg-neutral-950/40">
          {(['all', 'character', 'story', 'creature', 'timeline', 'location', 'faction'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded-md transition-colors capitalize ${
                filterType === t
                  ? 'bg-amber-600 text-white font-medium'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              {t === 'all' ? 'Todos' : t}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-neutral-800/60">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-xs">
              No se encontraron notas que coincidan con "{query}".
            </div>
          ) : (
            filtered.map((doc, idx) => {
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={doc.id}
                  onClick={() => handleSelect(doc.id)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl cursor-pointer transition-colors flex items-start justify-between gap-3 ${
                    isSelected ? 'bg-amber-600/15 border border-amber-500/30' : 'hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-serif font-bold text-sm text-neutral-100 truncate">
                        {doc.frontmatter.title}
                      </span>
                      <span className="text-[10px] font-mono capitalize px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                        {doc.frontmatter.type}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-1 leading-relaxed">
                      {doc.content.replace(/^#+ .*\n/, '').replace(/\[!Infobox\]/g, '').trim()}
                    </p>

                    {doc.frontmatter.tags && doc.frontmatter.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-neutral-500">
                        <span>Tags:</span>
                        <span>{doc.frontmatter.tags.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-neutral-500">
                    <span className="text-[11px] font-mono">{doc.wordCount} pal.</span>
                    <CornerDownLeft className="w-3.5 h-3.5 opacity-60" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2 border-t border-neutral-800 bg-neutral-950/60 text-[11px] text-neutral-500 flex items-center justify-between font-mono">
          <span>{filtered.length} resultados encontrados</span>
          <div className="flex items-center gap-3">
            <span>↑↓ Navegar</span>
            <span>↵ Abrir</span>
            <span>Esc Cerrar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
