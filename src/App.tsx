/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LoreProvider, useLore } from './context/LoreContext';
import { DesktopTitlebar } from './components/layout/DesktopTitlebar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { MarkdownEditor } from './components/editor/MarkdownEditor';
import { StoriesModule } from './components/modules/StoriesModule';
import { CharactersModule } from './components/modules/CharactersModule';
import { TimelineModule } from './components/modules/TimelineModule';
import { BestiaryModule } from './components/modules/BestiaryModule';
import { GraphView } from './components/modules/GraphView';
import { GalleryModule } from './components/modules/GalleryModule';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { SearchModal } from './components/modals/SearchModal';
import { NewDocumentModal } from './components/modals/NewDocumentModal';
import { ImportExportModal } from './components/modals/ImportExportModal';
import { AndroidAppModal } from './components/modals/AndroidAppModal';
import { ManageUniverseModal } from './components/modals/ManageUniverseModal';
import { ManageStoryModal } from './components/modals/ManageStoryModal';
import { DocumentType, StorySubfolderKey } from './types/lore';

const MainAppContent: React.FC = () => {
  const { universes, activeUniverse, activeModule, zenMode } = useLore();
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNewDocOpen, setIsNewDocOpen] = useState<boolean>(false);
  const [newDocDefaultType, setNewDocDefaultType] = useState<DocumentType>('note');
  const [newDocDefaultStoryId, setNewDocDefaultStoryId] = useState<string | null>(null);
  const [newDocDefaultSubfolder, setNewDocDefaultSubfolder] = useState<StorySubfolderKey | undefined>(undefined);
  const [isImportExportOpen, setIsImportExportOpen] = useState<boolean>(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);
  const [isManageUniverseOpen, setIsManageUniverseOpen] = useState<boolean>(false);
  const [isManageStoryOpen, setIsManageStoryOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K / Cmd+K: Open Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      // Ctrl+N / Cmd+N: New Document
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !e.shiftKey) {
        e.preventDefault();
        setNewDocDefaultType('note');
        setNewDocDefaultSubfolder(undefined);
        setIsNewDocOpen(true);
      }
      // Ctrl+\ : Toggle Sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenNewDoc = (
    type?: DocumentType,
    storyId?: string | null,
    subfolder?: StorySubfolderKey
  ) => {
    setNewDocDefaultType(type || 'note');
    setNewDocDefaultStoryId(storyId !== undefined ? storyId : null);
    setNewDocDefaultSubfolder(subfolder);
    setIsNewDocOpen(true);
  };

  // Clean Initial State: Show Welcome screen if no universe exists
  if (universes.length === 0 || !activeUniverse) {
    return (
      <>
        <WelcomeScreen
          onOpenImportModal={() => setIsImportExportOpen(true)}
          onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
        />
        <ImportExportModal
          isOpen={isImportExportOpen}
          onClose={() => setIsImportExportOpen(false)}
        />
        <AndroidAppModal
          isOpen={isAndroidModalOpen}
          onClose={() => setIsAndroidModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col h-dvh w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans select-none">
      {/* Titlebar (Hidden in Zen writing mode) */}
      {!zenMode && (
        <DesktopTitlebar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenImportExport={() => setIsImportExportOpen(true)}
          onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
          onOpenManageUniverseModal={() => setIsManageUniverseOpen(true)}
          onOpenManageStoryModal={() => setIsManageStoryOpen(true)}
          onToggleMobileDrawer={() => setMobileDrawerOpen((prev) => !prev)}
        />
      )}

      {/* Main Workspace Frame */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Sidebar / Mobile Drawer (Hidden in Zen mode) */}
        {!zenMode && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
            mobileOpen={mobileDrawerOpen}
            onCloseMobile={() => setMobileDrawerOpen(false)}
            onOpenNewDocModal={handleOpenNewDoc}
            onOpenManageUniverseModal={() => setIsManageUniverseOpen(true)}
            onOpenManageStoryModal={() => setIsManageStoryOpen(true)}
          />
        )}

        {/* Dynamic Viewport Module */}
        <main className="flex-1 min-w-0 h-full overflow-hidden relative">
          {activeModule === 'editor' && <MarkdownEditor />}
          {activeModule === 'stories' && <StoriesModule />}
          {activeModule === 'characters' && <CharactersModule />}
          {activeModule === 'timeline' && <TimelineModule />}
          {activeModule === 'bestiary' && <BestiaryModule />}
          {activeModule === 'graph' && <GraphView />}
          {activeModule === 'gallery' && <GalleryModule />}
        </main>
      </div>

      {/* Android & Mobile Bottom Navigation Bar */}
      {!zenMode && (
        <MobileBottomNav
          onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
        />
      )}

      {/* Modals */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <NewDocumentModal
        isOpen={isNewDocOpen}
        onClose={() => setIsNewDocOpen(false)}
        defaultType={newDocDefaultType}
        defaultStoryId={newDocDefaultStoryId}
        defaultSubfolder={newDocDefaultSubfolder}
      />
      <ManageUniverseModal
        isOpen={isManageUniverseOpen}
        onClose={() => setIsManageUniverseOpen(false)}
      />
      <ManageStoryModal
        isOpen={isManageStoryOpen}
        onClose={() => setIsManageStoryOpen(false)}
      />
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
      />
      <AndroidAppModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LoreProvider>
      <MainAppContent />
    </LoreProvider>
  );
}
