import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  LoreDocument,
  DocumentType,
  LoreFrontmatter,
  ActiveModule,
  EditorMode,
  ImageAsset,
  Universe,
  Story,
  StorySubfolderKey,
} from '../types/lore';
import { getInitialLoreDocuments, INITIAL_IMAGES } from '../data/defaultLore';
import { computeBidirectionalLinks, findDocumentByTarget } from '../utils/wikilinks';
import { parseFrontmatter, serializeMarkdown, calculateDocumentStats } from '../utils/frontmatter';
import { openLocalDirectory, saveDocumentToNativeDisk, exportLoreToZip, exportUniverseJson } from '../utils/fileSystem';
import {
  saveToOfflineDB,
  loadFromOfflineDB,
  requestAndroidPersistentStorage,
  getOfflineStorageStats,
  OfflineStorageStats,
} from '../utils/offlineStorage';

interface LoreContextType {
  // Universes
  universes: Universe[];
  activeUniverseId: string | null;
  activeUniverse: Universe | null;
  createUniverse: (name: string, description?: string) => Universe;
  renameUniverse: (id: string, name: string, description?: string) => void;
  deleteUniverse: (id: string) => void;
  setActiveUniverseId: (id: string | null) => void;

  // Stories
  stories: Story[];
  universeStories: Story[];
  activeStoryId: string | null;
  activeStory: Story | null;
  createStory: (title: string, synopsis?: string) => Story;
  renameStory: (id: string, title: string, synopsis?: string) => void;
  deleteStory: (id: string) => void;
  setActiveStoryId: (id: string | null) => void;

  // Documents
  documents: LoreDocument[];
  universeDocuments: LoreDocument[];
  storyDocuments: LoreDocument[];
  activeDocument: LoreDocument | null;
  activeDocId: string | null;
  setActiveDocId: (id: string | null) => void;
  createDocument: (data: {
    title: string;
    type?: DocumentType;
    storyId?: string | null;
    subfolder?: StorySubfolderKey;
    path?: string;
    initialContent?: string;
    tags?: string[];
  }) => LoreDocument;
  updateDocument: (id: string, newContent: string, newFrontmatter?: Partial<LoreFrontmatter>) => void;
  deleteDocument: (id: string) => void;
  navigateToTarget: (target: string) => void;

  // Navigation & Modules
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
  editorMode: EditorMode;
  setEditorMode: (mode: EditorMode) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  zenMode: boolean;
  toggleZenMode: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  selectedType: DocumentType | 'all';
  setSelectedType: (type: DocumentType | 'all') => void;

  // Images
  images: ImageAsset[];
  addImage: (image: Omit<ImageAsset, 'id' | 'addedAt'>) => void;
  deleteImage: (id: string) => void;

  // Storage / Native disk / Offline DB
  universeName: string;
  isDiskConnected: boolean;
  diskFolderName: string | null;
  hasUnsavedChanges: boolean;
  offlineStats: OfflineStorageStats | null;
  connectLocalDirectory: () => Promise<void>;
  exportZipArchive: () => Promise<void>;
  exportJsonBackup: () => void;
  importJsonBackup: (jsonData: any) => void;
  importLocalMarkdownFiles: (files: FileList | File[]) => Promise<void>;

  // Optional Demo Loader
  loadDemoUniverse: () => void;
}

const LoreContext = createContext<LoreContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEY_UNIVERSES = 'grimorio_universes_v2';
const STORAGE_KEY_ACTIVE_UNIVERSE = 'grimorio_active_universe_id_v2';
const STORAGE_KEY_STORIES = 'grimorio_stories_v2';
const STORAGE_KEY_ACTIVE_STORY = 'grimorio_active_story_id_v2';
const STORAGE_KEY_DOCS = 'grimorio_lore_docs_v2';
const STORAGE_KEY_IMAGES = 'grimorio_lore_images_v2';
const STORAGE_KEY_THEME = 'grimorio_theme_v2';

export const LoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    return saved === 'light' ? 'light' : 'dark';
  });

  const [zenMode, setZenMode] = useState<boolean>(false);

  // 1. Universes state (Clean initial state by default: empty array)
  const [universes, setUniverses] = useState<Universe[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_UNIVERSES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse saved universes:', e);
      }
    }
    return [];
  });

  // Active Universe ID
  const [activeUniverseId, setActiveUniverseIdState] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_UNIVERSE);
    return saved || null;
  });

  // 2. Stories state (Clean initial state by default: empty array)
  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STORIES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse saved stories:', e);
      }
    }
    return [];
  });

  // Active Story ID
  const [activeStoryId, setActiveStoryIdState] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_STORY);
    return saved || null;
  });

  // 3. Documents state (Clean initial state by default: empty array)
  const [documents, setDocuments] = useState<LoreDocument[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DOCS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return computeBidirectionalLinks(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved docs:', e);
      }
    }
    return [];
  });

  // 4. Images state (Clean initial state by default: empty array)
  const [images, setImages] = useState<ImageAsset[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_IMAGES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Failed to parse saved images:', e);
      }
    }
    return [];
  });

  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<ActiveModule>('stories');
  const [editorMode, setEditorMode] = useState<EditorMode>('split');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentType | 'all'>('all');
  const [isDiskConnected, setIsDiskConnected] = useState<boolean>(false);
  const [diskFolderName, setDiskFolderName] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [offlineStats, setOfflineStats] = useState<OfflineStorageStats | null>(null);

  // Request Android/Chromium Persistent Storage and hydrate from IndexedDB if localStorage was evicted
  useEffect(() => {
    let mounted = true;
    async function initOfflineEngine() {
      await requestAndroidPersistentStorage();

      // Hydrate from IndexedDB if localStorage was empty
      if (universes.length === 0) {
        const idbUniverses = await loadFromOfflineDB<Universe[]>(STORAGE_KEY_UNIVERSES);
        if (mounted && idbUniverses && idbUniverses.length > 0) {
          setUniverses(idbUniverses);
          const idbActiveUniv = await loadFromOfflineDB<string>(STORAGE_KEY_ACTIVE_UNIVERSE);
          setActiveUniverseIdState(idbActiveUniv || idbUniverses[0].id);
        }
      }
      if (stories.length === 0) {
        const idbStories = await loadFromOfflineDB<Story[]>(STORAGE_KEY_STORIES);
        if (mounted && idbStories && idbStories.length > 0) {
          setStories(idbStories);
        }
      }
      if (documents.length === 0) {
        const idbDocs = await loadFromOfflineDB<LoreDocument[]>(STORAGE_KEY_DOCS);
        if (mounted && idbDocs && idbDocs.length > 0) {
          setDocuments(computeBidirectionalLinks(idbDocs));
        }
      }
      if (images.length === 0) {
        const idbImages = await loadFromOfflineDB<ImageAsset[]>(STORAGE_KEY_IMAGES);
        if (mounted && idbImages && idbImages.length > 0) {
          setImages(idbImages);
        }
      }

      const stats = await getOfflineStorageStats();
      if (mounted) setOfflineStats(stats);
    }

    initOfflineEngine();
    return () => {
      mounted = false;
    };
  }, []);

  // Apply theme to html root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  // Ensure active universe exists; if not, select first available or null
  useEffect(() => {
    if (universes.length === 0) {
      setActiveUniverseIdState(null);
      localStorage.removeItem(STORAGE_KEY_ACTIVE_UNIVERSE);
      return;
    }
    if (!activeUniverseId || !universes.some((u) => u.id === activeUniverseId)) {
      const nextId = universes[0].id;
      setActiveUniverseIdState(nextId);
      localStorage.setItem(STORAGE_KEY_ACTIVE_UNIVERSE, nextId);
      saveToOfflineDB(STORAGE_KEY_ACTIVE_UNIVERSE, nextId);
    }
  }, [universes, activeUniverseId]);

  // Ensure active story is valid for current universe
  useEffect(() => {
    if (!activeUniverseId) {
      setActiveStoryIdState(null);
      localStorage.removeItem(STORAGE_KEY_ACTIVE_STORY);
      return;
    }
    const currentUniverseStories = stories.filter((s) => s.universeId === activeUniverseId);
    if (currentUniverseStories.length === 0) {
      setActiveStoryIdState(null);
      localStorage.removeItem(STORAGE_KEY_ACTIVE_STORY);
      return;
    }
    if (!activeStoryId || !currentUniverseStories.some((s) => s.id === activeStoryId)) {
      const nextStoryId = currentUniverseStories[0].id;
      setActiveStoryIdState(nextStoryId);
      localStorage.setItem(STORAGE_KEY_ACTIVE_STORY, nextStoryId);
      saveToOfflineDB(STORAGE_KEY_ACTIVE_STORY, nextStoryId);
    }
  }, [stories, activeUniverseId, activeStoryId]);

  // Save universes to local storage + IndexedDB whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_UNIVERSES, JSON.stringify(universes));
    } catch (e) {
      console.warn('Error saving universes to localStorage', e);
    }
    saveToOfflineDB(STORAGE_KEY_UNIVERSES, universes);
  }, [universes]);

  // Save stories to local storage + IndexedDB whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STORIES, JSON.stringify(stories));
    } catch (e) {
      console.warn('Error saving stories to localStorage', e);
    }
    saveToOfflineDB(STORAGE_KEY_STORIES, stories);
  }, [stories]);

  // Save documents to local storage + IndexedDB whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(documents));
    } catch (e) {
      console.warn('Error saving docs to localStorage', e);
    }
    saveToOfflineDB(STORAGE_KEY_DOCS, documents).then(() => {
      getOfflineStorageStats().then(setOfflineStats);
    });
  }, [documents]);

  // Save images to local storage + IndexedDB
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_IMAGES, JSON.stringify(images));
    } catch (e) {
      console.warn('Error saving images to localStorage', e);
    }
    saveToOfflineDB(STORAGE_KEY_IMAGES, images);
  }, [images]);

  // Set active universe id helper
  const setActiveUniverseId = useCallback((id: string | null) => {
    setActiveUniverseIdState(id);
    if (id) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_UNIVERSE, id);
      // Auto select first story if exists
      const univStories = stories.filter((s) => s.universeId === id);
      if (univStories.length > 0) {
        setActiveStoryIdState(univStories[0].id);
        localStorage.setItem(STORAGE_KEY_ACTIVE_STORY, univStories[0].id);
      } else {
        setActiveStoryIdState(null);
        localStorage.removeItem(STORAGE_KEY_ACTIVE_STORY);
      }
      // Reset active document
      const firstDoc = documents.find((d) => d.universeId === id);
      setActiveDocId(firstDoc ? firstDoc.id : null);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_UNIVERSE);
      setActiveStoryIdState(null);
      setActiveDocId(null);
    }
  }, [stories, documents]);

  // Set active story id helper
  const setActiveStoryId = useCallback((id: string | null) => {
    setActiveStoryIdState(id);
    if (id) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_STORY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_STORY);
    }
  }, []);

  // Active Universe object
  const activeUniverse = useMemo(() => {
    if (!activeUniverseId) return null;
    return universes.find((u) => u.id === activeUniverseId) || null;
  }, [universes, activeUniverseId]);

  // Stories belonging to the active universe
  const universeStories = useMemo(() => {
    if (!activeUniverseId) return [];
    return stories.filter((s) => s.universeId === activeUniverseId);
  }, [stories, activeUniverseId]);

  // Active Story object
  const activeStory = useMemo(() => {
    if (!activeStoryId || !activeUniverseId) return null;
    return stories.find((s) => s.id === activeStoryId && s.universeId === activeUniverseId) || null;
  }, [stories, activeStoryId, activeUniverseId]);

  // Documents belonging to the active universe
  const universeDocuments = useMemo(() => {
    if (!activeUniverseId) return [];
    return documents.filter((d) => d.universeId === activeUniverseId);
  }, [documents, activeUniverseId]);

  // Documents belonging to the active story
  const storyDocuments = useMemo(() => {
    if (!activeUniverseId || !activeStoryId) return [];
    return documents.filter((d) => d.universeId === activeUniverseId && d.storyId === activeStoryId);
  }, [documents, activeUniverseId, activeStoryId]);

  // Active document object
  const activeDocument = useMemo(() => {
    if (!activeDocId || !activeUniverseId) return null;
    return documents.find((d) => d.id === activeDocId && d.universeId === activeUniverseId) || null;
  }, [documents, activeDocId, activeUniverseId]);

  const setTheme = useCallback((newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
  }, []);

  const toggleZenMode = useCallback(() => {
    setZenMode((prev) => !prev);
  }, []);

  // --- UNIVERSE CRUD ---
  const createUniverse = useCallback((name: string, description?: string): Universe => {
    const trimmed = name.trim() || 'Nuevo Universo';
    const id = `univ-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newUniverse: Universe = {
      id,
      name: trimmed,
      description: description?.trim() || '',
      createdAt: Date.now(),
      lastModified: Date.now(),
    };

    setUniverses((prev) => [newUniverse, ...prev]);
    setActiveUniverseId(newUniverse.id);
    setActiveModule('stories');
    return newUniverse;
  }, [setActiveUniverseId]);

  const renameUniverse = useCallback((id: string, name: string, description?: string) => {
    setUniverses((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          return {
            ...u,
            name: name.trim() || u.name,
            description: description !== undefined ? description.trim() : u.description,
            lastModified: Date.now(),
          };
        }
        return u;
      })
    );
  }, []);

  const deleteUniverse = useCallback((id: string) => {
    setUniverses((prev) => prev.filter((u) => u.id !== id));
    setStories((prev) => prev.filter((s) => s.universeId !== id));
    setDocuments((prev) => prev.filter((d) => d.universeId !== id));
    setImages((prev) => prev.filter((img) => img.universeId !== id));

    if (activeUniverseId === id) {
      setUniverses((curr) => {
        const remaining = curr.filter((u) => u.id !== id);
        const nextId = remaining.length > 0 ? remaining[0].id : null;
        setActiveUniverseId(nextId);
        return curr;
      });
    }
  }, [activeUniverseId, setActiveUniverseId]);

  // --- STORY CRUD ---
  const createStory = useCallback((title: string, synopsis?: string): Story => {
    if (!activeUniverseId) {
      throw new Error('No hay un universo activo seleccionado.');
    }
    const trimmedTitle = title.trim() || 'Nueva Historia';
    const id = `story-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newStory: Story = {
      id,
      universeId: activeUniverseId,
      title: trimmedTitle,
      synopsis: synopsis?.trim() || '',
      status: 'in_progress',
      createdAt: Date.now(),
      lastModified: Date.now(),
      order: stories.filter((s) => s.universeId === activeUniverseId).length + 1,
    };

    setStories((prev) => [...prev, newStory]);
    setActiveStoryId(newStory.id);
    return newStory;
  }, [activeUniverseId, stories, setActiveStoryId]);

  const renameStory = useCallback((id: string, title: string, synopsis?: string) => {
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            title: title.trim() || s.title,
            synopsis: synopsis !== undefined ? synopsis.trim() : s.synopsis,
            lastModified: Date.now(),
          };
        }
        return s;
      })
    );
  }, []);

  const deleteStory = useCallback((id: string) => {
    setStories((prev) => prev.filter((s) => s.id !== id));
    setDocuments((prev) => prev.filter((d) => d.storyId !== id));

    if (activeStoryId === id) {
      const remainingStories = stories.filter((s) => s.universeId === activeUniverseId && s.id !== id);
      setActiveStoryId(remainingStories.length > 0 ? remainingStories[0].id : null);
    }
  }, [activeStoryId, activeUniverseId, stories, setActiveStoryId]);

  // --- DOCUMENT CRUD ---
  const updateDocument = useCallback((id: string, newContent: string, newFrontmatter?: Partial<LoreFrontmatter>) => {
    setDocuments((prevDocs) => {
      const idx = prevDocs.findIndex((d) => d.id === id);
      if (idx === -1) return prevDocs;

      const current = prevDocs[idx];
      const mergedFrontmatter: LoreFrontmatter = {
        ...current.frontmatter,
        ...(newFrontmatter || {}),
      };

      const rawMarkdown = serializeMarkdown(mergedFrontmatter, newContent);
      const stats = calculateDocumentStats(rawMarkdown);

      const updated: LoreDocument = {
        ...current,
        frontmatter: mergedFrontmatter,
        content: newContent,
        rawMarkdown,
        wordCount: stats.wordCount,
        readingTimeMinutes: stats.readingTimeMinutes,
        lastModified: Date.now(),
      };

      // Save to native disk if connected
      saveDocumentToNativeDisk(updated).catch(console.error);

      const nextDocs = [...prevDocs];
      nextDocs[idx] = updated;
      return computeBidirectionalLinks(nextDocs);
    });

    setHasUnsavedChanges(true);
    setTimeout(() => setHasUnsavedChanges(false), 800);
  }, []);

  const createDocument = useCallback(
    ({
      title,
      type = 'note',
      storyId,
      subfolder,
      path,
      initialContent = '',
      tags = [],
    }: {
      title: string;
      type?: DocumentType;
      storyId?: string | null;
      subfolder?: StorySubfolderKey;
      path?: string;
      initialContent?: string;
      tags?: string[];
    }): LoreDocument => {
      if (!activeUniverseId) {
        throw new Error('Selecciona o crea un universo primero.');
      }

      const targetStoryId = storyId !== undefined ? storyId : activeStoryId;
      
      // Auto-determine subfolder if not provided
      let targetSubfolder: StorySubfolderKey = subfolder || 'notes';
      if (!subfolder) {
        if (type === 'story') targetSubfolder = 'chapters';
        else if (type === 'character') targetSubfolder = 'characters';
        else if (type === 'location') targetSubfolder = 'locations';
        else if (type === 'creature' || type === 'faction') targetSubfolder = 'creatures';
        else targetSubfolder = 'notes';
      }

      // Auto-determine type if subfolder was provided
      let finalType: DocumentType = type;
      if (subfolder) {
        if (subfolder === 'chapters') finalType = 'story';
        else if (subfolder === 'characters') finalType = 'character';
        else if (subfolder === 'locations') finalType = 'location';
        else if (subfolder === 'creatures') finalType = 'creature';
        else if (subfolder === 'notes') finalType = 'note';
      }

      const baseId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const fileName = `${title.replace(/[/\\?%*:|"<>]/g, '-')}.md`;
      const finalPath = path || `${targetSubfolder}/${fileName}`;

      const frontmatter: LoreFrontmatter = {
        title,
        type: finalType,
        tags,
        status: 'draft',
        date: new Date().getFullYear().toString(),
      };

      // Add default template content if empty
      let contentBody = initialContent;
      if (!contentBody) {
        if (targetSubfolder === 'characters' || finalType === 'character') {
          frontmatter.race = 'Humano';
          frontmatter.role = 'Protagonista';
          contentBody = `[!Infobox]\n\n# ${title}\n\n## Biografía y Orígenes\nEscribe aquí la historia y contexto de este personaje...\n\n## Rasgos y Habilidades\n- Rasgo principal\n- Motivación\n\n## Relaciones\n- Vínculos con otros personajes o facciones.`;
        } else if (targetSubfolder === 'creatures' || finalType === 'creature') {
          frontmatter.danger_level = 'Moderado';
          frontmatter.habitat = 'Tierras Salvajes';
          contentBody = `[!Infobox]\n\n# ${title}\n\n## Registro de la Criatura o Facción\nDescripción de origen, anatomía y comportamiento...\n\n### Habilidades y Peligros\n- Fortalezas\n- Puntos débiles\n\n### Recursos y Botín\n- Elementos cosechables o reliquias.`;
        } else if (targetSubfolder === 'locations' || finalType === 'location') {
          contentBody = `[!Infobox]\n\n# ${title}\n\n## Geografía y Entorno\nDescripción de la ubicación, arquitectura y clima...\n\n### Historia y Lugares Clave\n- Hitos importantes\n- Habitantes y autoridades.`;
        } else if (targetSubfolder === 'chapters' || finalType === 'story') {
          frontmatter.wordCountTarget = 2500;
          frontmatter.pov = 'Tercera persona';
          contentBody = `# ${title}\n\nEl viento soplaba con fuerza sobre el horizonte...\n\n### Escena 1\nDetalles del conflicto o inicio del capítulo...\n\n### Objetivos Narrativos\n- Objetivo central de la escena.`;
        } else {
          contentBody = `# ${title}\n\nEscribe aquí tus notas, reglas de mundo o detalles de lore. Puedes vincular otros conceptos usando \`[[NombreDeNota]]\`.`;
        }
      }

      const rawMarkdown = serializeMarkdown(frontmatter, contentBody);
      const stats = calculateDocumentStats(rawMarkdown);

      const newDoc: LoreDocument = {
        id: baseId,
        universeId: activeUniverseId,
        storyId: targetStoryId,
        subfolder: targetSubfolder,
        fileName,
        path: finalPath,
        frontmatter,
        content: contentBody,
        rawMarkdown,
        wordCount: stats.wordCount,
        readingTimeMinutes: stats.readingTimeMinutes,
        lastModified: Date.now(),
      };

      setDocuments((prev) => {
        const next = [...prev, newDoc];
        return computeBidirectionalLinks(next);
      });

      setActiveDocId(newDoc.id);
      setActiveModule('editor');

      // Save to native disk if connected
      saveDocumentToNativeDisk(newDoc).catch(console.error);

      return newDoc;
    },
    [activeUniverseId, activeStoryId]
  );

  const deleteDocument = useCallback(
    (id: string) => {
      setDocuments((prev) => {
        const next = prev.filter((d) => d.id !== id);
        return computeBidirectionalLinks(next);
      });

      if (activeDocId === id) {
        setDocuments((curr) => {
          const remaining = curr.filter((d) => d.universeId === activeUniverseId && d.id !== id);
          setActiveDocId(remaining.length > 0 ? remaining[0].id : null);
          return curr;
        });
      }
    },
    [activeDocId, activeUniverseId]
  );

  const navigateToTarget = useCallback(
    (target: string) => {
      const found = findDocumentByTarget(target, universeDocuments);
      if (found) {
        setActiveDocId(found.id);
        setActiveModule('editor');
      } else {
        const confirmCreate = window.confirm(`La nota "[[${target}]]" no existe aún en este universo. ¿Deseas crearla ahora?`);
        if (confirmCreate) {
          createDocument({
            title: target,
            type: 'note',
            subfolder: 'notes',
          });
        }
      }
    },
    [universeDocuments, createDocument]
  );

  // --- IMAGE MANAGEMENT ---
  const addImage = useCallback((image: Omit<ImageAsset, 'id' | 'addedAt'>) => {
    const newImg: ImageAsset = {
      ...image,
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      universeId: activeUniverseId || undefined,
      addedAt: Date.now(),
    };
    setImages((prev) => [newImg, ...prev]);
  }, [activeUniverseId]);

  const deleteImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  // --- DISK AND EXPORT/IMPORT ---
  const connectLocalDirectory = useCallback(async () => {
    try {
      const result = await openLocalDirectory();
      if (!result) return;

      if (result.docs.length > 0) {
        const linked = computeBidirectionalLinks(result.docs.map((d) => ({
          ...d,
          universeId: activeUniverseId || 'univ-local',
        })));
        setDocuments(linked);
        setActiveDocId(linked[0].id);
        setIsDiskConnected(true);
        setDiskFolderName(result.folderName);
      } else {
        setIsDiskConnected(true);
        setDiskFolderName(result.folderName);
      }
    } catch (err: any) {
      alert(`Error al abrir carpeta: ${err.message}`);
    }
  }, [activeUniverseId]);

  const exportZipArchive = useCallback(async () => {
    const univName = activeUniverse ? activeUniverse.name : 'Grimorio-Lore';
    await exportLoreToZip(universeDocuments, univName, universeStories);
  }, [activeUniverse, universeDocuments, universeStories]);

  const exportJsonBackup = useCallback(() => {
    const univName = activeUniverse ? activeUniverse.name : 'Grimorio-Completo';
    exportUniverseJson(documents, images, univName, universes, stories);
  }, [activeUniverse, documents, images, universes, stories]);

  const importJsonBackup = useCallback((data: any) => {
    try {
      if (!data) return;
      if (Array.isArray(data.universes) && data.universes.length > 0) {
        setUniverses(data.universes);
        setActiveUniverseIdState(data.universes[0].id);
      } else if (data.universeName) {
        const fallbackUniv: Universe = {
          id: `univ-${Date.now()}`,
          name: data.universeName,
          createdAt: Date.now(),
          lastModified: Date.now(),
        };
        setUniverses([fallbackUniv]);
        setActiveUniverseIdState(fallbackUniv.id);
      }

      if (Array.isArray(data.stories)) {
        setStories(data.stories);
      }

      if (Array.isArray(data.documents)) {
        const importedDocs = computeBidirectionalLinks(data.documents);
        setDocuments(importedDocs);
        if (importedDocs.length > 0) setActiveDocId(importedDocs[0].id);
      }

      if (Array.isArray(data.images)) {
        setImages(data.images);
      }
    } catch (e: any) {
      alert(`Error al importar copia de seguridad: ${e.message}`);
    }
  }, []);

  const importLocalMarkdownFiles = useCallback(async (files: FileList | File[]) => {
    if (!activeUniverseId) {
      alert('Por favor selecciona o crea un Universo antes de importar archivos.');
      return;
    }

    const newDocs: LoreDocument[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.endsWith('.md')) {
        const text = await file.text();
        const { frontmatter, content } = parseFrontmatter(text);
        const stats = calculateDocumentStats(text);
        const baseId = `doc-${Date.now()}-${file.name.replace(/\.md$/, '').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

        let subfolder: StorySubfolderKey = 'notes';
        if (frontmatter.type === 'story') subfolder = 'chapters';
        else if (frontmatter.type === 'character') subfolder = 'characters';
        else if (frontmatter.type === 'location') subfolder = 'locations';
        else if (frontmatter.type === 'creature') subfolder = 'creatures';

        newDocs.push({
          id: baseId,
          universeId: activeUniverseId,
          storyId: activeStoryId,
          subfolder,
          fileName: file.name,
          path: file.name,
          frontmatter,
          content,
          rawMarkdown: text,
          wordCount: stats.wordCount,
          readingTimeMinutes: stats.readingTimeMinutes,
          lastModified: file.lastModified || Date.now(),
        });
      }
    }

    if (newDocs.length > 0) {
      setDocuments((prev) => {
        const map = new Map<string, LoreDocument>();
        prev.forEach((d) => map.set(d.id, d));
        newDocs.forEach((d) => map.set(d.id, d));
        return computeBidirectionalLinks(Array.from(map.values()));
      });
      setActiveDocId(newDocs[0].id);
    }
  }, [activeUniverseId, activeStoryId]);

  // Demo loader (Only when explicitly triggered by user)
  const loadDemoUniverse = useCallback(() => {
    const demoUniv: Universe = {
      id: 'univ-demo-aethelgard',
      name: 'Aethelgard: El Ocaso de las Cenizas',
      description: 'Mundo de fantasía oscura azotado por el Cataclismo del Núcleo Astral.',
      createdAt: Date.now(),
      lastModified: Date.now(),
    };

    const demoStory1: Story = {
      id: 'story-demo-libro-1',
      universeId: demoUniv.id,
      title: 'Libro 1: El Despertar de la Ceniza',
      synopsis: 'La travesía del príncipe Valerius tras la caída del Bastión de Cenizas.',
      status: 'in_progress',
      createdAt: Date.now(),
      lastModified: Date.now(),
      order: 1,
    };

    const demoStory2: Story = {
      id: 'story-demo-libro-2',
      universeId: demoUniv.id,
      title: 'Spin-off: Crónicas del Cónclave Astral',
      synopsis: 'Conspiraciones políticas en las torres de obsidiana del norte.',
      status: 'draft',
      createdAt: Date.now(),
      lastModified: Date.now(),
      order: 2,
    };

    const initialDocs = getInitialLoreDocuments().map((d) => {
      let subfolder: StorySubfolderKey = 'notes';
      if (d.frontmatter.type === 'story') subfolder = 'chapters';
      else if (d.frontmatter.type === 'character') subfolder = 'characters';
      else if (d.frontmatter.type === 'location') subfolder = 'locations';
      else if (d.frontmatter.type === 'creature') subfolder = 'creatures';

      return {
        ...d,
        universeId: demoUniv.id,
        storyId: demoStory1.id,
        subfolder,
      };
    });

    setUniverses((prev) => [demoUniv, ...prev.filter((u) => u.id !== demoUniv.id)]);
    setStories((prev) => [...prev.filter((s) => s.universeId !== demoUniv.id), demoStory1, demoStory2]);
    setDocuments((prev) => computeBidirectionalLinks([...prev.filter((d) => d.universeId !== demoUniv.id), ...initialDocs]));
    setImages((prev) => [...prev, ...INITIAL_IMAGES.map((img) => ({ ...img, universeId: demoUniv.id }))]);

    setActiveUniverseId(demoUniv.id);
    setActiveStoryId(demoStory1.id);
    if (initialDocs.length > 0) {
      setActiveDocId(initialDocs[0].id);
    }
    setActiveModule('stories');
  }, [setActiveUniverseId, setActiveStoryId]);

  return (
    <LoreContext.Provider
      value={{
        universes,
        activeUniverseId,
        activeUniverse,
        createUniverse,
        renameUniverse,
        deleteUniverse,
        setActiveUniverseId,

        stories,
        universeStories,
        activeStoryId,
        activeStory,
        createStory,
        renameStory,
        deleteStory,
        setActiveStoryId,

        documents,
        universeDocuments,
        storyDocuments,
        activeDocument,
        activeDocId,
        setActiveDocId,
        createDocument,
        updateDocument,
        deleteDocument,
        navigateToTarget,

        activeModule,
        setActiveModule,
        editorMode,
        setEditorMode,
        theme,
        setTheme,
        zenMode,
        toggleZenMode,
        searchQuery,
        setSearchQuery,
        selectedTag,
        setSelectedTag,
        selectedType,
        setSelectedType,

        images,
        addImage,
        deleteImage,

        universeName: activeUniverse?.name || 'Grimorio',
        isDiskConnected,
        diskFolderName,
        hasUnsavedChanges,
        offlineStats,
        connectLocalDirectory,
        exportZipArchive,
        exportJsonBackup,
        importJsonBackup,
        importLocalMarkdownFiles,

        loadDemoUniverse,
      }}
    >
      {children}
    </LoreContext.Provider>
  );
};

export function useLore() {
  const context = useContext(LoreContext);
  if (!context) {
    throw new Error('useLore must be used within a LoreProvider');
  }
  return context;
}

