import React, { useState } from 'react';
import { Calendar, Plus, Clock, Workflow, ArrowRight, Tag, Share2, Trash2, AlertTriangle } from 'lucide-react';
import { useLore } from '../../context/LoreContext';
import { MermaidRenderer } from '../editor/MermaidRenderer';

export const TimelineModule: React.FC = () => {
  const { universeDocuments, setActiveDocId, setActiveModule, createDocument, deleteDocument } = useLore();
  const [activeTab, setActiveTab] = useState<'visual' | 'mermaid-timeline' | 'mermaid-genealogy'>('visual');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const timelineDocs = universeDocuments.filter((d) => d.frontmatter.type === 'timeline');

  // Custom Mermaid Code state for direct experimentation
  const [customMermaidTimeline, setCustomMermaidTimeline] = useState<string>(`timeline
  title Crónica de las Eras de Aethelgard
  Era Primigenia : Nacimiento del Núcleo Astral
                 : Pacto de los Cuatro Titanes
  Año 0 E.S. : El Gran Cataclismo de Cenizas
             : Ocaso de la Antigua Dinastía
  Año 102 E.S. : Fundación del Bastión de Cenizas
               : Consagración de las Forjas de Basalto
  Año 180 E.S. : Creación de la Orden de la Ceniza
  Año 314 E.S. : Misterioso asesinato del Rey Aldor IV
  Año 318 E.S. : Rebelión y Despertar del Sombradraco`);

  const [customGenealogy, setCustomGenealogy] = useState<string>(`graph TD
  subgraph Casa Real Ashborn
    Aldor[Rey Aldor IV †] --> Valerius[Valerius Ashborn - Príncipe Heredero]
    Aldor --> Lyra[Lyra Vespera - Consejera Secreta]
  end

  subgraph Fuerzas en Conflicto
    Valerius -. Vínculo Mágico .-> Drake[Sombradraco Ancestral]
    Valerius --> Orden[Orden de la Ceniza]
    Garrick[Lord Canciller Garrick] --> Conclave[Cónclave Astral]
    Conclave -. Usurpadores .-> Trono[Trono del Bastión de Cenizas]
  end`);

  const handleOpenDoc = (id: string) => {
    setActiveDocId(id);
    setActiveModule('editor');
  };

  const handleNewEvent = () => {
    const newDoc = createDocument({
      title: 'Nuevo Evento Histórico',
      type: 'timeline',
      tags: ['cronologia', 'evento'],
      initialContent: `# Nuevo Evento Histórico\n\nDescripción detallada de la batalla, tratado o descubrimiento...\n\n\`\`\`mermaid\ntimeline\n  title Cronología del Acontecimiento\n  Día 1 : Ruptura de las negociaciones\n  Día 3 : Asedio al bastión\n\`\`\``,
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
              <Calendar className="w-3.5 h-3.5" />
              <span>Cronología & Diagramas</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-50 mt-1">
              Línea de Tiempo y Genealogías
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Secuencias cronológicas interactivas y diagramación Mermaid de eras históricas y dinastías.
            </p>
          </div>

          <button
            onClick={handleNewEvent}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Evento</span>
          </button>
        </div>

        {/* View mode tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-200/60 dark:bg-neutral-900 rounded-xl w-fit text-xs">
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'visual'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Hitos y Eventos
          </button>
          <button
            onClick={() => setActiveTab('mermaid-timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'mermaid-timeline'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Workflow className="w-3.5 h-3.5 text-amber-500" />
            <span>Diagrama de Secuencia (Mermaid)</span>
          </button>
          <button
            onClick={() => setActiveTab('mermaid-genealogy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'mermaid-genealogy'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Árbol Genealógico y Alianzas</span>
          </button>
        </div>

        {/* Tab 1: Visual Interactive Timeline */}
        {activeTab === 'visual' && (
          <div className="relative pl-6 sm:pl-8 border-l-2 border-amber-500/30 dark:border-amber-500/20 space-y-8 my-6">
            {timelineDocs.map((event, idx) => (
              <div
                key={event.id}
                onClick={() => handleOpenDoc(event.id)}
                className="group relative cursor-pointer"
              >
                {/* Timeline node pip */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-amber-500 bg-white dark:bg-neutral-950 group-hover:scale-125 transition-transform" />

                <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">
                        {event.frontmatter.date || event.frontmatter.year || `Hito ${idx + 1}`}
                      </span>
                      {event.frontmatter.era && (
                        <span className="capitalize">{event.frontmatter.era}</span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(event.id);
                      }}
                      title="Eliminar evento de la cronología"
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-neutral-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {deleteConfirmId === event.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="my-2 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center justify-between gap-2 animate-in fade-in"
                    >
                      <span className="flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>¿Eliminar este acontecimiento?</span>
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
                            deleteDocument(event.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-[11px]"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}

                  <h3 className="font-serif font-bold text-lg text-neutral-900 dark:text-neutral-100 group-hover:text-amber-500 transition-colors">
                    {event.frontmatter.title}
                  </h3>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed line-clamp-3">
                    {event.content.replace(/```mermaid[\s\S]*?```/g, '').replace(/^#+ .*\n/, '').trim()}
                  </p>

                  <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-neutral-400" />
                      <span>{event.frontmatter.tags.join(', ')}</span>
                    </div>
                    <span className="text-amber-600 dark:text-amber-400 font-medium group-hover:underline">
                      Ver Ficha y Diagrama →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Chronological Sequence Mermaid */}
        {activeTab === 'mermaid-timeline' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Código Mermaid de Secuencia Histórica
                </span>
                <span className="text-xs text-neutral-400">Edición en tiempo real</span>
              </div>
              <textarea
                value={customMermaidTimeline}
                onChange={(e) => setCustomMermaidTimeline(e.target.value)}
                className="w-full h-36 font-mono text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 resize-y"
              />
            </div>

            <div className="p-2">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                Visualización Renderizada del Diagrama
              </h3>
              <MermaidRenderer chart={customMermaidTimeline} />
            </div>
          </div>
        )}

        {/* Tab 3: Genealogy & Alliance Graph */}
        {activeTab === 'mermaid-genealogy' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Código Mermaid de Linajes y Alianzas
                </span>
                <span className="text-xs text-neutral-400">Edición en tiempo real</span>
              </div>
              <textarea
                value={customGenealogy}
                onChange={(e) => setCustomGenealogy(e.target.value)}
                className="w-full h-36 font-mono text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 resize-y"
              />
            </div>

            <div className="p-2">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                Visualización Dinástica
              </h3>
              <MermaidRenderer chart={customGenealogy} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
