import React from 'react';
import { Book, FileEdit, Users, Network, Smartphone } from 'lucide-react';
import { useLore } from '../../context/LoreContext';

interface MobileBottomNavProps {
  onOpenAndroidModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenAndroidModal,
}) => {
  const { activeModule, setActiveModule } = useLore();

  return (
    <nav
      aria-label="Navegación móvil de Android"
      className="md:hidden h-14 bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 grid grid-cols-5 items-center shrink-0 select-none z-30"
    >
      <button
        onClick={() => setActiveModule('stories')}
        className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
          activeModule === 'stories'
            ? 'text-amber-400 font-semibold'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Book className="w-4 h-4" />
        <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Historias</span>
      </button>

      <button
        onClick={() => setActiveModule('editor')}
        className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
          activeModule === 'editor'
            ? 'text-amber-400 font-semibold'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <FileEdit className="w-4 h-4" />
        <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Editor</span>
      </button>

      <button
        onClick={() => setActiveModule('characters')}
        className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
          activeModule === 'characters'
            ? 'text-amber-400 font-semibold'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Users className="w-4 h-4" />
        <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Personajes</span>
      </button>

      <button
        onClick={() => setActiveModule('graph')}
        className={`min-h-[48px] flex flex-col items-center justify-center transition-colors ${
          activeModule === 'graph'
            ? 'text-amber-400 font-semibold'
            : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Network className="w-4 h-4" />
        <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">Grafo</span>
      </button>

      <button
        onClick={onOpenAndroidModal}
        className="min-h-[48px] flex flex-col items-center justify-center text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        <Smartphone className="w-4 h-4" />
        <span className="text-[10px] font-medium tracking-tight mt-0.5 whitespace-nowrap">Android</span>
      </button>
    </nav>
  );
};
