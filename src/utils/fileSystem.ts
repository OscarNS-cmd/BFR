import JSZip from 'jszip';
import { LoreDocument, ImageAsset } from '../types/lore';
import { parseFrontmatter, serializeMarkdown, calculateDocumentStats } from './frontmatter';

// Store reference to directory handle if granted
let activeDirectoryHandle: any = null;

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

export async function openLocalDirectory(): Promise<{
  docs: LoreDocument[];
  folderName: string;
} | null> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('Tu navegador no soporta File System Access API nativa. Puedes usar Importar ZIP o Archivos.');
  }

  try {
    const dirHandle = await (window as any).showDirectoryPicker({
      mode: 'readwrite',
    });
    activeDirectoryHandle = dirHandle;

    const docs: LoreDocument[] = [];
    await scanDirectoryRecursive(dirHandle, '', docs);

    return {
      docs,
      folderName: dirHandle.name,
    };
  } catch (err: any) {
    if (err.name === 'AbortError') return null;
    throw err;
  }
}

async function scanDirectoryRecursive(dirHandle: any, currentPath: string, docsList: LoreDocument[]) {
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file' && entry.name.endsWith('.md')) {
      const file = await entry.getFile();
      const text = await file.text();
      const relativePath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
      const { frontmatter, content } = parseFrontmatter(text);
      const stats = calculateDocumentStats(text);

      docsList.push({
        id: entry.name.replace(/\.md$/, '').toLowerCase().replace(/[^a-z0-9]/g, '-'),
        universeId: 'univ-local',
        fileName: entry.name,
        path: relativePath,
        frontmatter,
        content,
        rawMarkdown: text,
        wordCount: stats.wordCount,
        readingTimeMinutes: stats.readingTimeMinutes,
        lastModified: file.lastModified || Date.now(),
      });
    } else if (entry.kind === 'directory' && !entry.name.startsWith('.')) {
      const subPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
      await scanDirectoryRecursive(entry, subPath, docsList);
    }
  }
}

export async function saveDocumentToNativeDisk(doc: LoreDocument): Promise<boolean> {
  if (!activeDirectoryHandle) return false;

  try {
    const raw = serializeMarkdown(doc.frontmatter, doc.content);
    // Find or create path
    const parts = doc.path.split('/');
    let currentDir = activeDirectoryHandle;

    for (let i = 0; i < parts.length - 1; i++) {
      currentDir = await currentDir.getDirectoryHandle(parts[i], { create: true });
    }

    const fileHandle = await currentDir.getFileHandle(parts[parts.length - 1], { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(raw);
    await writable.close();
    return true;
  } catch (e) {
    console.error('Error saving to disk handle:', e);
    return false;
  }
}

/**
 * Trigger browser download for a single Markdown file.
 */
export function downloadMarkdownFile(doc: LoreDocument) {
  const content = serializeMarkdown(doc.frontmatter, doc.content);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = doc.fileName.endsWith('.md') ? doc.fileName : `${doc.fileName}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports all documents and metadata into a comprehensive ZIP archive organized by stories and subfolders.
 */
export async function exportLoreToZip(
  docs: LoreDocument[], 
  universeName = 'Grimorio-Lore',
  stories: Array<{ id: string; title: string }> = []
): Promise<void> {
  const zip = new JSZip();

  const storyMap = new Map(stories.map(s => [s.id, s.title]));

  const subfolderFolderNames: Record<string, string> = {
    chapters: '01_Capitulos',
    characters: '02_Personajes',
    locations: '03_Mundo_y_Ubicaciones',
    creatures: '04_Criaturas_y_Facciones',
    notes: '05_Lore_y_Apuntes',
  };

  docs.forEach((doc) => {
    const fullMarkdown = serializeMarkdown(doc.frontmatter, doc.content);
    const safeName = doc.fileName.endsWith('.md') ? doc.fileName : `${doc.fileName}.md`;
    
    let folder: JSZip = zip;
    if (doc.storyId && storyMap.has(doc.storyId)) {
      const safeStoryTitle = storyMap.get(doc.storyId)!.replace(/[/\\?%*:|"<>]/g, '_');
      const subDirName = doc.subfolder ? subfolderFolderNames[doc.subfolder] || doc.subfolder : 'General';
      folder = zip.folder(`Historias/${safeStoryTitle}/${subDirName}`)!;
    } else if (doc.subfolder && subfolderFolderNames[doc.subfolder]) {
      folder = zip.folder(`Lore_General/${subfolderFolderNames[doc.subfolder]}`)!;
    } else {
      const defaultFolder = doc.frontmatter.type === 'character' ? 'Personajes' :
        doc.frontmatter.type === 'creature' ? 'Bestiario' :
        doc.frontmatter.type === 'story' ? 'Capitulos' :
        doc.frontmatter.type === 'location' ? 'Lugares' : 'Notas';
      folder = zip.folder(defaultFolder)!;
    }

    folder.file(safeName, fullMarkdown);
  });

  // Also include project index manifest
  const manifest = {
    universeName,
    exportedAt: new Date().toISOString(),
    totalDocuments: docs.length,
    stories: stories,
    documents: docs.map((d) => ({
      id: d.id,
      title: d.frontmatter.title,
      type: d.frontmatter.type,
      tags: d.frontmatter.tags,
      storyId: d.storyId,
      subfolder: d.subfolder,
      path: d.path,
    })),
  };
  zip.file('grimorio_manifest.json', JSON.stringify(manifest, null, 2));

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${universeName.toLowerCase().replace(/\s+/g, '_')}_lore_pack.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a complete JSON snapshot for easy restore.
 */
export function exportUniverseJson(
  docs: LoreDocument[], 
  images: ImageAsset[], 
  universeName: string,
  universes?: any[],
  stories?: any[]
) {
  const data = {
    version: '2.0.0',
    universeName,
    exportedAt: new Date().toISOString(),
    universes: universes || [],
    stories: stories || [],
    documents: docs,
    images: images,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${universeName.toLowerCase().replace(/\s+/g, '_')}_backup.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
