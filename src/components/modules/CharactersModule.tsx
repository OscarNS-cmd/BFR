import React, { useState } from 'react';
import { Users, Plus, Shield, Sparkles, UserCheck, Search, Filter, Trash2, AlertTriangle } from 'lucide-react';
import { useLore } from '../../context/LoreContext';

export const CharactersModule: React.FC = () => {
  const { universeDocuments, setActiveDocId, setActiveModule, createDocument, deleteDocument } = useLore();
  const [filterFaction, setFilterFaction] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const characterDocs = universeDocuments.filter((d) => d.frontmatter.type === 'character');

  // Collect distinct factions
  const factions = Array.from(
    new Set(characterDocs.map((d) => d.frontmatter.faction).filter(Boolean))
  ) as string[];

  const filteredCharacters = characterDocs.filter((char) => {
    const matchesFaction = filterFaction === 'all' || char.frontmatter.faction === filterFaction;
    const matchesSearch =
      char.frontmatter.title.toLowerCase().includes(search.toLowerCase()) ||
      (char.frontmatter.role || '').toLowerCase().includes(search.toLowerCase()) ||
      (char.frontmatter.race || '').toLowerCase().includes(search.toLowerCase());
    return matchesFaction && matchesSearch;
  });

  const handleOpenChar = (id: string) => {
    setActiveDocId(id);
    setActiveModule('editor');
  };

  const handleNewCharacter = () => {
    const newDoc = createDocument({
      title: 'Nuevo Héroe o Villano',
      type: 'character',
      tags: ['personaje', 'nuevo'],
    });
    setActiveDocId(newDoc.id);
    setActiveModule('editor');
  };

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8 bg-neutral-50/50 dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Dramatis Personae</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-50 mt-1">
              Personajes y Figuras del Lore
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Fichas wiki detalladas con infoboxes laterales, atributos, facciones y vínculos de lealtad.
            </p>
          </div>

          <button
            onClick={handleNewCharacter}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Personaje</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, rol o raza..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          {/* Faction selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
            <button
              onClick={() => setFilterFaction('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                filterFaction === 'all'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              Todas las Facciones ({characterDocs.length})
            </button>
            {factions.map((fac) => (
              <button
                key={fac}
                onClick={() => setFilterFaction(fac)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                  filterFaction === fac
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}
              >
                {fac}
              </button>
            ))}
          </div>
        </div>

        {/* Character Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharacters.map((char) => {
            const fm = char.frontmatter;

            return (
              <div
                key={char.id}
                onClick={() => handleOpenChar(char.id)}
                className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden shadow-xs hover:border-amber-500/50 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Portrait / Banner */}
                  <div className="relative aspect-16/10 w-full bg-neutral-900 overflow-hidden">
                    {fm.image ? (
                      <img
                        src={fm.image}
                        alt={fm.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-950 text-neutral-600">
                        <Users className="w-12 h-12 stroke-[1]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Delete button on card */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(char.id);
                      }}
                      title="Eliminar personaje"
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-neutral-300 hover:text-white transition-colors backdrop-blur-xs z-10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-serif font-bold text-lg leading-tight group-hover:text-amber-300 transition-colors">
                        {fm.title}
                      </h3>
                      {fm.role && (
                        <p className="text-xs text-neutral-300 line-clamp-1 mt-0.5">
                          {fm.role}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Inline Delete Confirmation if clicked */}
                  {deleteConfirmId === char.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="p-3 bg-rose-950/80 border-b border-rose-800 text-rose-200 text-xs flex items-center justify-between gap-2 animate-in fade-in"
                    >
                      <span className="flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>¿Eliminar este personaje?</span>
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px]"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            deleteDocument(char.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-[11px]"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Body Attributes */}
                  <div className="p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                      {fm.faction && (
                        <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                          <Shield className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[140px]">{fm.faction}</span>
                        </span>
                      )}
                      {fm.race && (
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 opacity-60" />
                          <span>{fm.race}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                      {char.content.replace(/^#+ .*\n/, '').replace(/\[!Infobox\]/g, '').trim().slice(0, 160)}...
                    </p>

                    {/* Key Attributes if present */}
                    {fm.attributes && (
                      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 space-y-1 text-[11px]">
                        {Object.entries(fm.attributes).slice(0, 2).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-neutral-500">
                            <span>{k}:</span>
                            <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[150px]">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/90 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="font-mono">{char.wordCount} palabras</span>
                  <span className="text-amber-600 dark:text-amber-400 font-medium group-hover:underline">
                    Abrir Ficha Wiki →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
