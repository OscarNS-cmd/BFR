import React from 'react';
import { Shield, Sparkles, AlertTriangle, MapPin, Skull, Heart, User, Compass } from 'lucide-react';
import { LoreFrontmatter, DangerLevel } from '../../types/lore';
import { useLore } from '../../context/LoreContext';

interface InfoboxCardProps {
  frontmatter: LoreFrontmatter;
  onNavigate: (target: string) => void;
}

export const InfoboxCard: React.FC<InfoboxCardProps> = ({ frontmatter, onNavigate }) => {
  const { title, type, image, faction, race, role, danger_level, habitat, diet, weaknesses, attributes, relationships, status, date } = frontmatter;

  const getDangerBadge = (level?: DangerLevel) => {
    if (!level) return null;
    const colors: Record<DangerLevel, string> = {
      Inofensivo: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50',
      Moderado: 'text-sky-400 bg-sky-950/40 border-sky-800/50',
      Peligroso: 'text-amber-400 bg-amber-950/40 border-amber-800/50',
      Letal: 'text-rose-400 bg-rose-950/40 border-rose-800/50',
      Cataclísmico: 'text-purple-400 bg-purple-950/40 border-purple-800/50',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded border ${colors[level] || 'text-neutral-300'}`}>
        <AlertTriangle className="w-3 h-3 shrink-0" />
        Peligro: {level}
      </span>
    );
  };

  const getStatusBadge = (st?: string) => {
    if (!st) return null;
    const labels: Record<string, string> = {
      completed: 'Completado',
      in_progress: 'En Progreso',
      draft: 'Borrador',
      archived: 'Archivado',
    };
    return (
      <span className="text-xs text-neutral-400 font-mono uppercase tracking-wider">
        {labels[st] || st}
      </span>
    );
  };

  return (
    <aside className="my-4 sm:my-2 sm:float-right sm:ml-6 sm:mb-6 w-full sm:w-80 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/90 shadow-md backdrop-blur-xs overflow-hidden transition-all text-neutral-900 dark:text-neutral-100 text-sm">
      {/* Top Header */}
      <div className="bg-neutral-100 dark:bg-neutral-800/70 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 text-center">
        <h3 className="font-serif font-bold text-base tracking-wide text-neutral-900 dark:text-neutral-100">
          {title}
        </h3>
        <div className="flex items-center justify-center gap-2 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="capitalize">{type}</span>
          {date && (
            <>
              <span>·</span>
              <span>{date}</span>
            </>
          )}
        </div>
      </div>

      {/* Featured Image */}
      {image && (
        <div className="relative aspect-4/3 w-full bg-neutral-950 overflow-hidden border-b border-neutral-200 dark:border-neutral-800">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Graceful fallback
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Primary badges */}
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800/60 flex flex-wrap gap-2 items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/30">
        {danger_level ? getDangerBadge(danger_level) : <span />}
        {status && getStatusBadge(status)}
      </div>

      {/* Core Properties List */}
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-xs">
        {role && (
          <div className="flex py-2 px-3">
            <span className="w-28 text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-1.5 shrink-0">
              <User className="w-3.5 h-3.5 opacity-70" /> Rol
            </span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">{role}</span>
          </div>
        )}

        {faction && (
          <div className="flex py-2 px-3">
            <span className="w-28 text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-1.5 shrink-0">
              <Shield className="w-3.5 h-3.5 opacity-70" /> Facción
            </span>
            <button
              onClick={() => onNavigate(faction)}
              className="text-left font-medium text-amber-600 dark:text-amber-400 hover:underline"
            >
              {faction}
            </button>
          </div>
        )}

        {race && (
          <div className="flex py-2 px-3">
            <span className="w-28 text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-1.5 shrink-0">
              <Sparkles className="w-3.5 h-3.5 opacity-70" /> Raza / Linaje
            </span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">{race}</span>
          </div>
        )}

        {habitat && (
          <div className="flex py-2 px-3">
            <span className="w-28 text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-1.5 shrink-0">
              <MapPin className="w-3.5 h-3.5 opacity-70" /> Hábitat
            </span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">{habitat}</span>
          </div>
        )}

        {diet && (
          <div className="flex py-2 px-3">
            <span className="w-28 text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-1.5 shrink-0">
              <Heart className="w-3.5 h-3.5 opacity-70" /> Dieta
            </span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">{diet}</span>
          </div>
        )}

        {weaknesses && (
          <div className="flex py-2 px-3">
            <span className="w-28 text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-1.5 shrink-0">
              <Skull className="w-3.5 h-3.5 opacity-70" /> Debilidad
            </span>
            <span className="font-medium text-rose-600 dark:text-rose-400">{weaknesses}</span>
          </div>
        )}

        {/* Custom attributes */}
        {attributes &&
          Object.entries(attributes).map(([key, value]) => (
            <div key={key} className="flex py-2 px-3">
              <span className="w-28 text-neutral-500 dark:text-neutral-400 font-medium shrink-0">
                {key}
              </span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">{value}</span>
            </div>
          ))}
      </div>

      {/* Relationships */}
      {relationships && relationships.length > 0 && (
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
            Vínculos y Conexiones
          </div>
          <div className="space-y-1.5">
            {relationships.map((rel, idx) => (
              <div key={idx} className="text-xs flex items-baseline justify-between gap-2">
                <button
                  onClick={() => onNavigate(rel.target)}
                  className="font-medium text-amber-600 dark:text-amber-400 hover:underline text-left shrink-0"
                >
                  [[{rel.target}]]
                </button>
                <span className="text-neutral-500 dark:text-neutral-400 text-[11px] text-right truncate">
                  {rel.relation}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
