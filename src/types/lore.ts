export type DocumentType = 
  | 'story' 
  | 'character' 
  | 'creature' 
  | 'timeline' 
  | 'faction' 
  | 'location' 
  | 'note';

export type DocumentStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

export type DangerLevel = 'Inofensivo' | 'Moderado' | 'Peligroso' | 'Letal' | 'Cataclísmico';

export type StorySubfolderKey = 
  | 'chapters'    // 📖 Capítulos
  | 'characters'  // 👤 Personajes (específicos de esta historia)
  | 'locations'   // 🌍 Mundo y Ubicaciones
  | 'creatures'   // 🐉 Criaturas y Facciones
  | 'notes';      // 📜 Lore / Apuntes

export interface SubfolderDefinition {
  key: StorySubfolderKey;
  label: string;
  iconName: string;
  emoji: string;
  defaultType: DocumentType;
  description: string;
}

export const STORY_SUBFOLDERS: SubfolderDefinition[] = [
  {
    key: 'chapters',
    label: 'Capítulos',
    iconName: 'BookOpen',
    emoji: '📖',
    defaultType: 'story',
    description: 'Manuscritos, capítulos y escenas de la trama',
  },
  {
    key: 'characters',
    label: 'Personajes',
    iconName: 'Users',
    emoji: '👤',
    defaultType: 'character',
    description: 'Fichas de personajes específicos de esta historia',
  },
  {
    key: 'locations',
    label: 'Mundo y Ubicaciones',
    iconName: 'Globe',
    emoji: '🌍',
    defaultType: 'location',
    description: 'Ciudades, regiones, fortalezas y geografía',
  },
  {
    key: 'creatures',
    label: 'Criaturas y Facciones',
    iconName: 'Skull',
    emoji: '🐉',
    defaultType: 'creature',
    description: 'Bestias, monstruos, clanes y facciones',
  },
  {
    key: 'notes',
    label: 'Lore / Apuntes',
    iconName: 'Scroll',
    emoji: '📜',
    defaultType: 'note',
    description: 'Reglas de magia, mitos, notas y cronología',
  },
];

export interface Universe {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  lastModified: number;
}

export interface Story {
  id: string;
  universeId: string;
  title: string;
  synopsis?: string;
  status?: DocumentStatus;
  createdAt: number;
  lastModified: number;
  order?: number;
}

export interface LoreFrontmatter {
  title: string;
  type: DocumentType;
  tags: string[];
  status?: DocumentStatus;
  date?: string; // Era or world date e.g. "Era de las Sombras 318"
  image?: string;
  summary?: string;
  // Specific character metadata
  faction?: string;
  race?: string;
  role?: string;
  attributes?: Record<string, string>;
  relationships?: Array<{ target: string; relation: string }>;
  // Specific creature metadata
  danger_level?: DangerLevel;
  habitat?: string;
  diet?: string;
  weaknesses?: string;
  // Specific story metadata
  book?: string;
  arc?: string;
  chapterNumber?: number;
  pov?: string;
  wordCountTarget?: number;
  // Specific timeline metadata
  era?: string;
  year?: number | string;
  order?: number;
  // Generic custom properties
  [key: string]: unknown;
}

export interface LoreDocument {
  id: string;
  universeId: string;
  storyId?: string | null;
  subfolder?: StorySubfolderKey;
  fileName: string; // e.g. "Capitulo-1.md"
  path: string; // e.g. "Historias/Libro-1/Capitulos/Capitulo-1.md"
  frontmatter: LoreFrontmatter;
  content: string; // Raw markdown body without frontmatter
  rawMarkdown: string; // Complete text including YAML header
  wordCount: number;
  readingTimeMinutes: number;
  lastModified: number;
  backlinks?: string[]; // IDs of other documents referencing this one
  outlinks?: string[]; // Titles or IDs referenced by this document
}

export interface GraphNode {
  id: string;
  title: string;
  type: DocumentType;
  group: string;
  val: number; // importance / link count
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
}

export interface ImageAsset {
  id: string;
  universeId?: string;
  name: string;
  url: string;
  tags: string[];
  category: 'character' | 'creature' | 'location' | 'artifact' | 'map' | 'other';
  linkedDocs?: string[];
  width?: number;
  height?: number;
  addedAt: number;
}

export type ActiveModule = 
  | 'editor' 
  | 'stories' 
  | 'characters' 
  | 'timeline' 
  | 'bestiary' 
  | 'graph' 
  | 'gallery';

export type EditorMode = 'split' | 'wysiwyg' | 'raw';

