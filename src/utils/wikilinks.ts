import { LoreDocument } from '../types/lore';

export interface WikiLinkMatch {
  raw: string;
  target: string;
  label: string;
  index: number;
}

/**
 * Extracts all [[Target]] and [[Target|Label]] occurrences in markdown text.
 */
export function extractWikiLinks(text: string): WikiLinkMatch[] {
  const regex = /\[\[([^[\]|]+)(?:\|([^[\]]+))?\]\]/g;
  const matches: WikiLinkMatch[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const target = match[1].trim();
    const label = match[2] ? match[2].trim() : target;
    matches.push({
      raw: match[0],
      target,
      label,
      index: match.index,
    });
  }

  return matches;
}

/**
 * Resolves a target string to a document in the library (case-insensitive, by title, fileName or id).
 */
export function findDocumentByTarget(target: string, docs: LoreDocument[]): LoreDocument | undefined {
  const norm = target.toLowerCase().trim();
  return docs.find(
    (d) =>
      d.id.toLowerCase() === norm ||
      d.frontmatter.title.toLowerCase() === norm ||
      d.fileName.toLowerCase() === norm ||
      d.fileName.toLowerCase() === `${norm}.md`
  );
}

/**
 * Recalculates all outlinks and backlinks across the entire lore library.
 */
export function computeBidirectionalLinks(docs: LoreDocument[]): LoreDocument[] {
  // Map of docId -> Set of docIds that reference it
  const backlinksMap: Record<string, Set<string>> = {};
  docs.forEach((d) => {
    backlinksMap[d.id] = new Set();
  });

  // Calculate outlinks and register backlinks
  const updatedDocs = docs.map((doc) => {
    const rawMatches = extractWikiLinks(doc.content);
    const outlinksSet = new Set<string>();

    for (const match of rawMatches) {
      const referenced = findDocumentByTarget(match.target, docs);
      if (referenced) {
        outlinksSet.add(referenced.id);
        if (backlinksMap[referenced.id] && referenced.id !== doc.id) {
          backlinksMap[referenced.id].add(doc.id);
        }
      }
    }

    // Also check relationships from frontmatter
    if (doc.frontmatter.relationships) {
      for (const rel of doc.frontmatter.relationships) {
        const referenced = findDocumentByTarget(rel.target, docs);
        if (referenced) {
          outlinksSet.add(referenced.id);
          if (backlinksMap[referenced.id] && referenced.id !== doc.id) {
            backlinksMap[referenced.id].add(doc.id);
          }
        }
      }
    }

    return {
      ...doc,
      outlinks: Array.from(outlinksSet),
    };
  });

  // Attach resolved backlinks
  return updatedDocs.map((doc) => ({
    ...doc,
    backlinks: Array.from(backlinksMap[doc.id] || []),
  }));
}

/**
 * Extracts preview excerpts where the link is mentioned in the source document.
 */
export function getContextExcerpt(content: string, targetTitle: string, maxLength = 160): string {
  const regex = new RegExp(`\\[\\[${escapeRegex(targetTitle)}(?:\\|[^\\]]+)?\\]\\]`, 'i');
  const match = regex.exec(content);

  if (!match) {
    // If not direct wikilink, look for the title word
    const textIndex = content.toLowerCase().indexOf(targetTitle.toLowerCase());
    if (textIndex === -1) return content.slice(0, maxLength).trim() + '...';
    const start = Math.max(0, textIndex - 40);
    const end = Math.min(content.length, textIndex + targetTitle.length + 80);
    return (start > 0 ? '...' : '') + content.slice(start, end).replace(/\n+/g, ' ').trim() + (end < content.length ? '...' : '');
  }

  const start = Math.max(0, match.index - 50);
  const end = Math.min(content.length, match.index + match[0].length + 80);
  const excerpt = content.slice(start, end).replace(/\n+/g, ' ').trim();

  return (start > 0 ? '...' : '') + excerpt + (end < content.length ? '...' : '');
}

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
