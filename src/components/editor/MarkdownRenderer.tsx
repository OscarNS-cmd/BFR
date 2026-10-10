import React, { useState } from 'react';
import { LoreFrontmatter } from '../../types/lore';
import { InfoboxCard } from './InfoboxCard';
import { MermaidRenderer } from './MermaidRenderer';
import { Maximize2, ExternalLink, Link2 } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  frontmatter: LoreFrontmatter;
  onNavigate: (target: string) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, frontmatter, onNavigate }) => {
  const [lightboxImage, setLightboxImage] = useState<{ url: string; alt: string } | null>(null);

  // Parse lines and render blocks
  const renderContentBlocks = () => {
    // Check if [!Infobox] is in the content
    const hasInfoboxTag = content.includes('[!Infobox]');
    const cleanedContent = content.replace(/\[!Infobox\]/g, '');

    // Split content into blocks by mermaid code blocks and regular text
    const parts: React.ReactNode[] = [];
    const mermaidRegex = /```mermaid([\s\S]*?)```/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // Render Infobox at top right if requested or if character/creature/location
    const renderInfobox = hasInfoboxTag || ['character', 'creature', 'location'].includes(frontmatter.type);

    while ((match = mermaidRegex.exec(cleanedContent)) !== null) {
      // Text before mermaid
      const textBefore = cleanedContent.substring(lastIndex, match.index);
      if (textBefore.trim()) {
        parts.push(renderTextMarkdown(textBefore, `text-${lastIndex}`));
      }

      // Mermaid diagram
      const chartCode = match[1].trim();
      parts.push(<MermaidRenderer key={`mermaid-${match.index}`} chart={chartCode} />);

      lastIndex = mermaidRegex.lastIndex;
    }

    // Remaining text
    const remainingText = cleanedContent.substring(lastIndex);
    if (remainingText.trim()) {
      parts.push(renderTextMarkdown(remainingText, `text-${lastIndex}`));
    }

    return (
      <div className="relative">
        {renderInfobox && <InfoboxCard frontmatter={frontmatter} onNavigate={onNavigate} />}
        <div className="prose-container space-y-4">{parts}</div>
      </div>
    );
  };

  // Parses headings, tables, blockquotes, lists, images, and paragraphs
  const renderTextMarkdown = (rawText: string, keyPrefix: string) => {
    const lines = rawText.split('\n');
    const nodes: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) {
        i++;
        continue;
      }

      // Tables detection: starts with | and next line has |-
      if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('|-')) {
        const tableLines: string[] = [line, lines[i + 1]];
        i += 2;
        while (i < lines.length && lines[i].includes('|')) {
          tableLines.push(lines[i]);
          i++;
        }
        nodes.push(renderTable(tableLines, `${keyPrefix}-table-${i}`));
        continue;
      }

      // Blockquote (> )
      if (trimmed.startsWith('>')) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('>')) {
          quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
          i++;
        }
        nodes.push(
          <blockquote
            key={`${keyPrefix}-quote-${i}`}
            className="my-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/60 p-4 text-neutral-700 dark:text-neutral-300 italic font-serif"
          >
            {quoteLines.map((ql, qidx) => (
              <p key={qidx} className="my-1">
                {renderInline(ql)}
              </p>
            ))}
          </blockquote>
        );
        continue;
      }

      // Code blocks (generic non-mermaid ```)
      if (trimmed.startsWith('```')) {
        const lang = trimmed.replace(/^```/, '').trim();
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        nodes.push(
          <pre
            key={`${keyPrefix}-code-${i}`}
            className="my-4 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900 p-4 text-xs font-mono text-neutral-200"
          >
            {lang && <div className="text-[10px] uppercase text-neutral-500 mb-1">{lang}</div>}
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        continue;
      }

      // Headings
      if (trimmed.startsWith('#')) {
        const hMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (hMatch) {
          const level = hMatch[1].length;
          const text = hMatch[2];
          nodes.push(renderHeading(level, text, `${keyPrefix}-h-${i}`));
          i++;
          continue;
        }
      }

      // Lists (- or * or 1.)
      if (/^[-*]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
        const listItems: { text: string; isOrdered: boolean; checked?: boolean }[] = [];
        const isOrdered = /^\d+\.\s+/.test(trimmed);

        while (
          i < lines.length &&
          (/^[-*]\s+/.test(lines[i].trim()) || /^\d+\.\s+/.test(lines[i].trim()))
        ) {
          const lTrim = lines[i].trim();
          let itemText = lTrim.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
          let checked: boolean | undefined = undefined;

          // Task list check
          if (itemText.startsWith('[ ] ')) {
            checked = false;
            itemText = itemText.substring(4);
          } else if (itemText.startsWith('[x] ') || itemText.startsWith('[X] ')) {
            checked = true;
            itemText = itemText.substring(4);
          }

          listItems.push({ text: itemText, isOrdered, checked });
          i++;
        }

        nodes.push(
          <div key={`${keyPrefix}-list-${i}`} className="my-3">
            {isOrdered ? (
              <ol className="list-decimal list-inside space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
                {listItems.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {renderInline(item.text)}
                  </li>
                ))}
              </ol>
            ) : (
              <ul className="space-y-1.5 text-sm text-neutral-700 dark:text-neutral-300">
                {listItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    {item.checked !== undefined ? (
                      <input
                        type="checkbox"
                        checked={item.checked}
                        readOnly
                        className="mt-1 h-3.5 w-3.5 rounded border-neutral-300 dark:border-neutral-700 text-amber-600 focus:ring-0"
                      />
                    ) : (
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                    )}
                    <span>{renderInline(item.text)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
        continue;
      }

      // Standalone Image: ![Alt text](url "caption")
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)$/);
      if (imgMatch) {
        const alt = imgMatch[1];
        const url = imgMatch[2];
        const caption = imgMatch[3] || alt;
        nodes.push(renderImageCard(url, alt, caption, `${keyPrefix}-img-${i}`));
        i++;
        continue;
      }

      // Horizontal Rule
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        nodes.push(
          <hr
            key={`${keyPrefix}-hr-${i}`}
            className="my-6 border-0 h-px bg-neutral-200 dark:bg-neutral-800"
          />
        );
        i++;
        continue;
      }

      // Regular Paragraph
      nodes.push(
        <p
          key={`${keyPrefix}-p-${i}`}
          className="text-neutral-800 dark:text-neutral-200 text-sm leading-relaxed"
        >
          {renderInline(trimmed)}
        </p>
      );
      i++;
    }

    return <div key={keyPrefix}>{nodes}</div>;
  };

  // Render Heading
  const renderHeading = (level: number, text: string, key: string) => {
    const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const inlineContent = renderInline(text);

    switch (level) {
      case 1:
        return (
          <h1
            key={key}
            id={slug}
            className="font-serif font-bold text-2xl sm:text-3xl tracking-tight text-neutral-900 dark:text-neutral-50 pt-2 pb-1 border-b border-neutral-200 dark:border-neutral-800"
          >
            {inlineContent}
          </h1>
        );
      case 2:
        return (
          <h2
            key={key}
            id={slug}
            className="font-serif font-semibold text-lg sm:text-xl text-neutral-900 dark:text-neutral-100 mt-6 mb-2 tracking-wide flex items-center gap-2"
          >
            {inlineContent}
          </h2>
        );
      case 3:
        return (
          <h3
            key={key}
            id={slug}
            className="font-sans font-semibold text-base text-neutral-800 dark:text-neutral-200 mt-4 mb-1"
          >
            {inlineContent}
          </h3>
        );
      default:
        return (
          <h4
            key={key}
            id={slug}
            className="font-sans font-medium text-sm text-neutral-700 dark:text-neutral-300 mt-3 mb-1 uppercase tracking-wider text-xs"
          >
            {inlineContent}
          </h4>
        );
    }
  };

  // Render Table
  const renderTable = (lines: string[], key: string) => {
    const headerRow = lines[0]
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    const dataRows = lines.slice(2).map((row) =>
      row
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim())
    );

    return (
      <div
        key={key}
        className="my-5 overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs"
      >
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-100 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
              {headerRow.map((cell, idx) => (
                <th key={idx} className="py-2.5 px-3 font-semibold tracking-wide">
                  {renderInline(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60">
            {dataRows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors text-neutral-800 dark:text-neutral-200"
              >
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="py-2.5 px-3 align-top leading-snug">
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render standalone image card with caption and lightbox trigger
  const renderImageCard = (url: string, alt: string, caption: string, key: string) => {
    return (
      <figure
        key={key}
        className="my-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 overflow-hidden shadow-xs group"
      >
        <div className="relative overflow-hidden cursor-pointer" onClick={() => setLightboxImage({ url, alt })}>
          <img
            src={url}
            alt={alt}
            className="w-full max-h-[460px] object-cover group-hover:scale-102 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-lg bg-neutral-900/80 text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-xs">
              <Maximize2 className="w-3.5 h-3.5" /> Ampliar Imagen
            </span>
          </div>
        </div>
        {caption && (
          <figcaption className="p-3 text-center text-xs text-neutral-500 dark:text-neutral-400 italic border-t border-neutral-200 dark:border-neutral-800">
            {renderInline(caption)}
          </figcaption>
        )}
      </figure>
    );
  };

  // Inline formatting parser: Bold, Italics, Code, WikiLinks [[Target|Label]], Links [text](url)
  const renderInline = (text: string): React.ReactNode => {
    if (!text) return null;

    // Tokenize
    const tokens: React.ReactNode[] = [];
    let current = text;
    let index = 0;

    // Combined regex for inline elements
    // 1: [[Target|Label]]
    // 2: ![alt](url)
    // 3: [text](url)
    // 4: `code`
    // 5: **bold**
    // 6: *italic*
    const inlineRegex = /(\[\[([^[\]|]+)(?:\|([^[\]]+))?\]\])|(!\[(.*?)\]\((.*?)\))|(\[([^[\]]+)\]\(([^)]+)\))|(`([^`]+)`)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = inlineRegex.exec(current)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(current.substring(lastIndex, match.index));
      }

      // Check which group matched:
      if (match[1]) {
        // WikiLink: [[Target|Label]]
        const target = match[2].trim();
        const label = match[3] ? match[3].trim() : target;
        tokens.push(
          <button
            key={`wiki-${index++}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(target);
            }}
            title={`Abrir nota: ${target}`}
            className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline decoration-amber-500/40 hover:decoration-amber-500 transition-colors mx-0.5"
          >
            <Link2 className="w-3 h-3 opacity-70" />
            <span>{label}</span>
          </button>
        );
      } else if (match[4]) {
        // Inline image ![alt](url)
        const alt = match[5];
        const url = match[6];
        tokens.push(
          <img
            key={`img-${index++}`}
            src={url}
            alt={alt}
            className="inline-block max-h-8 max-w-16 object-contain rounded align-middle mx-1"
            referrerPolicy="no-referrer"
          />
        );
      } else if (match[7]) {
        // Standard link [text](url)
        const linkText = match[8];
        const url = match[9];
        tokens.push(
          <a
            key={`link-${index++}`}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 text-sky-600 dark:text-sky-400 hover:underline mx-0.5"
          >
            <span>{linkText}</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        );
      } else if (match[10]) {
        // Inline code `code`
        const code = match[11];
        tokens.push(
          <code
            key={`code-${index++}`}
            className="rounded bg-neutral-200/70 dark:bg-neutral-800 px-1.5 py-0.5 text-[12px] font-mono text-neutral-800 dark:text-neutral-200 border border-neutral-300/50 dark:border-neutral-700/50"
          >
            {code}
          </code>
        );
      } else if (match[12]) {
        // Bold **text**
        tokens.push(
          <strong key={`bold-${index++}`} className="font-semibold text-neutral-900 dark:text-neutral-100">
            {match[13]}
          </strong>
        );
      } else if (match[14]) {
        // Italic *text*
        tokens.push(
          <em key={`italic-${index++}`} className="italic text-neutral-800 dark:text-neutral-200">
            {match[15]}
          </em>
        );
      }

      lastIndex = inlineRegex.lastIndex;
    }

    if (lastIndex < current.length) {
      tokens.push(current.substring(lastIndex));
    }

    return <>{tokens}</>;
  };

  return (
    <div className="relative font-sans text-neutral-900 dark:text-neutral-100">
      {renderContentBlocks()}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={lightboxImage.url}
              alt={lightboxImage.alt}
              className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl border border-neutral-800"
            />
            {lightboxImage.alt && (
              <p className="mt-3 text-sm text-neutral-300 text-center font-serif">
                {lightboxImage.alt}
              </p>
            )}
            <button
              onClick={() => setLightboxImage(null)}
              className="mt-4 px-4 py-1.5 text-xs rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
            >
              Cerrar (Esc)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
