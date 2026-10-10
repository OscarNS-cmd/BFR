import React, { useState } from 'react';
import { Skull, Plus, AlertTriangle, MapPin, Search, ShieldAlert, Heart, Droplet, Trash2 } from 'lucide-react';
import { useLore } from '../../context/LoreContext';
import { DangerLevel } from '../../types/lore';

export const BestiaryModule: React.FC = () => {
  const { universeDocuments, setActiveDocId, setActiveModule, createDocument, deleteDocument } = useLore();
  const [filterDanger, setFilterDanger] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const creatureDocs = universeDocuments.filter((d) => d.frontmatter.type === 'creature');

  const filteredCreatures = creatureDocs.filter((cr) => {
    const danger = cr.frontmatter.danger_level || 'Moderado';
    const matchesDanger = filterDanger === 'all' || danger === filterDanger;
    const matchesSearch =
      cr.frontmatter.title.toLowerCase().includes(search.toLowerCase()) ||
      (cr.frontmatter.habitat || '').toLowerCase().includes(search.toLowerCase()) ||
      cr.content.toLowerCase().includes(search.toLowerCase());
    return matchesDanger && matchesSearch;
  });

  const handleOpenCreature = (id: string) => {
    setActiveDocId(id);
    setActiveModule('editor');
  };

  const handleNewCreature = () => {
    const newDoc = createDocument({
      title: 'Nueva Bestia o Monstruo',
      type: 'creature',
      tags: ['bestiario', 'criatura'],
    });
    setActiveDocId(newDoc.id);
    setActiveModule('editor');
  };

  const dangerColors: Record<DangerLevel, string> = {
    Inofensivo: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50',
    Moderado: 'text-sky-400 bg-sky-950/40 border-sky-800/50',
    Peligroso: 'text-amber-400 bg-amber-950/40 border-amber-800/50',
    Letal: 'text-rose-400 bg-rose-950/40 border-rose-800/50',
    Cataclísmico: 'text-purple-400 bg-purple-950/40 border-purple-800/50',
  };

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8 bg-neutral-50/50 dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 font-medium uppercase tracking-wider">
              <Skull className="w-3.5 h-3.5" />
              <span>Bestiario & Fauna Fantástica</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-50 mt-1">
              Criaturas y Bestias del Mundo
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Catálogo de especies con índices de amenaza, hábitats, debilidades y pautas de interacción.
            </p>
          </div>

          <button
            onClick={handleNewCreature}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Criatura</span>
          </button>
        </div>

        {/* Filter and search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, hábitat o rasgos..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden focus:border-rose-500"
            />
          </div>

          {/* Danger level tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
            <button
              onClick={() => setFilterDanger('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                filterDanger === 'all'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              Todas ({creatureDocs.length})
            </button>
            {(['Moderado', 'Peligroso', 'Letal', 'Cataclísmico'] as DangerLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterDanger(lvl)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                  filterDanger === lvl
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Creature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreatures.map((cr) => {
            const fm = cr.frontmatter;
            const danger = (fm.danger_level || 'Moderado') as DangerLevel;

            return (
              <div
                key={cr.id}
                onClick={() => handleOpenCreature(cr.id)}
                className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden shadow-xs hover:border-rose-500/50 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Creature Image Banner */}
                  <div className="relative aspect-16/10 w-full bg-neutral-950 overflow-hidden">
                    {fm.image ? (
                      <img
                        src={fm.image}
                        alt={fm.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-950 text-neutral-600">
                        <Skull className="w-12 h-12 stroke-[1]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    <div className="absolute top-3 left-3 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(cr.id);
                        }}
                        title="Eliminar criatura o facción"
                        className="p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-neutral-300 hover:text-white transition-colors backdrop-blur-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg border backdrop-blur-xs ${dangerColors[danger] || 'text-white'}`}>
                        <AlertTriangle className="w-3 h-3" />
                        {danger}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-serif font-bold text-lg leading-tight group-hover:text-rose-300 transition-colors">
                        {fm.title}
                      </h3>
                      {fm.habitat && (
                        <p className="flex items-center gap-1 text-xs text-neutral-300 mt-1">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          <span>{fm.habitat}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Inline Delete Confirmation */}
                  {deleteConfirmId === cr.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="p-3 bg-rose-950/80 border-b border-rose-800 text-rose-200 text-xs flex items-center justify-between gap-2 animate-in fade-in"
                    >
                      <span className="flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>¿Eliminar esta criatura?</span>
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
                            deleteDocument(cr.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-[11px]"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-4 space-y-3 text-xs">
                    <p className="text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                      {cr.content.replace(/^#+ .*\n/, '').replace(/\[!Infobox\]/g, '').trim().slice(0, 160)}...
                    </p>

                    {fm.weaknesses && (
                      <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40 text-[11px]">
                        <span className="font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1 mb-0.5">
                          <Droplet className="w-3 h-3" /> Vulnerabilidad Conocida:
                        </span>
                        <p className="text-neutral-700 dark:text-neutral-300">{fm.weaknesses}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/90 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="font-mono">{cr.wordCount} palabras</span>
                  <span className="text-rose-600 dark:text-rose-400 font-medium group-hover:underline">
                    Ver Registro Completo →
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
