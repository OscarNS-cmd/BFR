import { LoreFrontmatter, DocumentType, DocumentStatus, DangerLevel } from '../types/lore';

export interface ParsedMarkdown {
  frontmatter: LoreFrontmatter;
  content: string;
}

/**
 * Parses markdown text into YAML frontmatter and body content.
 */
export function parseFrontmatter(rawText: string): ParsedMarkdown {
  const normalized = rawText.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

  if (!match) {
    // No frontmatter found, infer title from first header or empty
    const firstHeader = normalized.match(/^#\s+(.+)$/m);
    const title = firstHeader ? firstHeader[1].trim() : 'Sin Título';
    return {
      frontmatter: {
        title,
        type: 'note',
        tags: [],
      },
      content: normalized,
    };
  }

  const yamlBlock = match[1];
  const content = match[2].trim();
  const frontmatter: LoreFrontmatter = {
    title: 'Sin Título',
    type: 'note',
    tags: [],
  };

  const lines = yamlBlock.split('\n');
  let currentKey = '';
  let inAttributes = false;
  let inRelationships = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Check nested attributes
    if (inAttributes) {
      if (line.startsWith('  ') || line.startsWith('\t')) {
        const subMatch = trimmed.match(/^([^:]+):\s*(.*)$/);
        if (subMatch) {
          const subKey = subMatch[1].trim();
          const subVal = cleanYamlValue(subMatch[2].trim());
          if (!frontmatter.attributes) frontmatter.attributes = {};
          frontmatter.attributes[subKey] = subVal;
          continue;
        }
      } else {
        inAttributes = false;
      }
    }

    // Check nested relationships
    if (inRelationships) {
      if (line.startsWith('  -') || line.startsWith('\t-') || line.startsWith('-')) {
        const itemLine = trimmed.replace(/^-+\s*/, '');
        const targetMatch = itemLine.match(/target:\s*"?([^",]+)"?/i);
        const relMatch = itemLine.match(/relation:\s*"?([^",]+)"?/i);
        if (targetMatch) {
          if (!frontmatter.relationships) frontmatter.relationships = [];
          frontmatter.relationships.push({
            target: targetMatch[1].trim(),
            relation: relMatch ? relMatch[1].trim() : 'relacionado con',
          });
          continue;
        }
      } else {
        inRelationships = false;
      }
    }

    // Top-level key: value
    const matchLine = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (matchLine) {
      const key = matchLine[1].trim().toLowerCase();
      const val = matchLine[2].trim();
      currentKey = key;

      if (key === 'attributes') {
        inAttributes = true;
        if (!frontmatter.attributes) frontmatter.attributes = {};
        continue;
      }

      if (key === 'relationships') {
        inRelationships = true;
        if (!frontmatter.relationships) frontmatter.relationships = [];
        continue;
      }

      if (key === 'tags') {
        if (val.startsWith('[') && val.endsWith(']')) {
          const inner = val.slice(1, -1);
          frontmatter.tags = inner
            .split(',')
            .map((t) => t.trim().replace(/^['"]|['"]$/g, ''))
            .filter(Boolean);
        } else if (val) {
          frontmatter.tags = [cleanYamlValue(val)];
        } else {
          // List format might follow on next lines
          frontmatter.tags = [];
        }
      } else if (key === 'title') {
        frontmatter.title = cleanYamlValue(val);
      } else if (key === 'type') {
        const tVal = cleanYamlValue(val).toLowerCase();
        const validTypes: DocumentType[] = ['story', 'character', 'creature', 'timeline', 'faction', 'location', 'note'];
        frontmatter.type = validTypes.includes(tVal as DocumentType) ? (tVal as DocumentType) : 'note';
      } else if (key === 'status') {
        const sVal = cleanYamlValue(val).toLowerCase();
        const validStatuses: DocumentStatus[] = ['draft', 'in_progress', 'completed', 'archived'];
        frontmatter.status = validStatuses.includes(sVal as DocumentStatus) ? (sVal as DocumentStatus) : 'draft';
      } else if (key === 'danger_level') {
        frontmatter.danger_level = cleanYamlValue(val) as DangerLevel;
      } else if (key === 'date') {
        frontmatter.date = cleanYamlValue(val);
      } else if (key === 'image') {
        frontmatter.image = cleanYamlValue(val);
      } else if (key === 'summary') {
        frontmatter.summary = cleanYamlValue(val);
      } else if (key === 'faction') {
        frontmatter.faction = cleanYamlValue(val);
      } else if (key === 'race') {
        frontmatter.race = cleanYamlValue(val);
      } else if (key === 'role') {
        frontmatter.role = cleanYamlValue(val);
      } else if (key === 'habitat') {
        frontmatter.habitat = cleanYamlValue(val);
      } else if (key === 'diet') {
        frontmatter.diet = cleanYamlValue(val);
      } else if (key === 'weaknesses') {
        frontmatter.weaknesses = cleanYamlValue(val);
      } else if (key === 'book') {
        frontmatter.book = cleanYamlValue(val);
      } else if (key === 'arc') {
        frontmatter.arc = cleanYamlValue(val);
      } else if (key === 'chapternumber') {
        frontmatter.chapterNumber = parseInt(cleanYamlValue(val), 10) || undefined;
      } else if (key === 'pov') {
        frontmatter.pov = cleanYamlValue(val);
      } else if (key === 'wordcounttarget') {
        frontmatter.wordCountTarget = parseInt(cleanYamlValue(val), 10) || undefined;
      } else if (key === 'era') {
        frontmatter.era = cleanYamlValue(val);
      } else if (key === 'year') {
        frontmatter.year = cleanYamlValue(val);
      } else {
        frontmatter[key] = cleanYamlValue(val);
      }
    } else if (currentKey === 'tags' && trimmed.startsWith('-')) {
      const tag = cleanYamlValue(trimmed.replace(/^-\s*/, ''));
      if (tag && !frontmatter.tags.includes(tag)) {
        frontmatter.tags.push(tag);
      }
    }
  }

  return { frontmatter, content };
}

function cleanYamlValue(val: string): string {
  let v = val.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v;
}

/**
 * Serializes frontmatter and content back into standard Markdown with YAML block.
 */
export function serializeMarkdown(frontmatter: LoreFrontmatter, content: string): string {
  const lines: string[] = ['---'];
  lines.push(`title: "${frontmatter.title || 'Sin Título'}"`);
  lines.push(`type: ${frontmatter.type || 'note'}`);

  if (frontmatter.status) {
    lines.push(`status: ${frontmatter.status}`);
  }

  if (frontmatter.tags && frontmatter.tags.length > 0) {
    lines.push(`tags: [${frontmatter.tags.map((t) => `"${t}"`).join(', ')}]`);
  }

  if (frontmatter.date) lines.push(`date: "${frontmatter.date}"`);
  if (frontmatter.image) lines.push(`image: "${frontmatter.image}"`);
  if (frontmatter.summary) lines.push(`summary: "${frontmatter.summary}"`);
  if (frontmatter.faction) lines.push(`faction: "${frontmatter.faction}"`);
  if (frontmatter.race) lines.push(`race: "${frontmatter.race}"`);
  if (frontmatter.role) lines.push(`role: "${frontmatter.role}"`);

  // Creature metadata
  if (frontmatter.danger_level) lines.push(`danger_level: "${frontmatter.danger_level}"`);
  if (frontmatter.habitat) lines.push(`habitat: "${frontmatter.habitat}"`);
  if (frontmatter.diet) lines.push(`diet: "${frontmatter.diet}"`);
  if (frontmatter.weaknesses) lines.push(`weaknesses: "${frontmatter.weaknesses}"`);

  // Story metadata
  if (frontmatter.book) lines.push(`book: "${frontmatter.book}"`);
  if (frontmatter.arc) lines.push(`arc: "${frontmatter.arc}"`);
  if (frontmatter.chapterNumber !== undefined) lines.push(`chapterNumber: ${frontmatter.chapterNumber}`);
  if (frontmatter.pov) lines.push(`pov: "${frontmatter.pov}"`);
  if (frontmatter.wordCountTarget !== undefined) lines.push(`wordCountTarget: ${frontmatter.wordCountTarget}`);

  // Timeline metadata
  if (frontmatter.era) lines.push(`era: "${frontmatter.era}"`);
  if (frontmatter.year !== undefined) lines.push(`year: "${frontmatter.year}"`);

  // Attributes
  if (frontmatter.attributes && Object.keys(frontmatter.attributes).length > 0) {
    lines.push('attributes:');
    for (const [k, v] of Object.entries(frontmatter.attributes)) {
      lines.push(`  ${k}: "${v}"`);
    }
  }

  // Relationships
  if (frontmatter.relationships && frontmatter.relationships.length > 0) {
    lines.push('relationships:');
    for (const rel of frontmatter.relationships) {
      lines.push(`  - target: "${rel.target}"`);
      lines.push(`    relation: "${rel.relation}"`);
    }
  }

  lines.push('---');
  lines.push('');
  lines.push(content.trim());

  return lines.join('\n');
}

/**
 * Calculates word count and reading time.
 */
export function calculateDocumentStats(text: string): { wordCount: number; readingTimeMinutes: number } {
  const clean = text
    .replace(/^---\n[\s\S]*?\n---\n?/, '') // remove YAML
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/<[^>]+>/g, '') // remove HTML tags
    .trim();

  if (!clean) return { wordCount: 0, readingTimeMinutes: 1 };

  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return { wordCount, readingTimeMinutes };
}
