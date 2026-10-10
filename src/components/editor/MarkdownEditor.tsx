import React, { useState, useRef, useEffect } from 'react';
import {
  Columns2,
  BookOpen,
  Code,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Table,
  Link2,
  Image,
  Sparkles,
  Save,
  Clock,
  FileText,
  ChevronRight,
  Tag,
  Maximize2,
  Minimize2,
  ArrowUpRight,
  Workflow,
  Trash2,
} from 'lucide-react';
import { useLore } from '../../context/LoreContext';
import { MarkdownRenderer } from './MarkdownRenderer';
import { extractWikiLinks, getContextExcerpt } from '../../utils/wikilinks';

export const MarkdownEditor: React.FC = () => {
  const {
    activeDocument,
    updateDocument,
    deleteDocument,
    editorMode,
    setEditorMode,
    zenMode,
    toggleZenMode,
    navigateToTarget,
    universeDocuments,
    hasUnsavedChanges,
  } = useLore();

  const [localContent, setLocalContent] = useState<string>('');
  const [showLinkAutocomplete, setShowLinkAutocomplete] = useState<boolean>(false);
  const [linkQuery, setLinkQuery] = useState<string>('');
  const [cursorPos, setCursorPos] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync active document content
  useEffect(() => {
    if (activeDocument) {
      setLocalContent(activeDocument.content);
    }
  }, [activeDocument?.id]);

  if (!activeDocument) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-neutral-500">
        <FileText className="w-12 h-12 mb-3 stroke-[1.2] opacity-40 text-amber-500" />
        <h3 className="font-serif text-lg font-medium text-neutral-300">Ningún documento seleccionado</h3>
        <p className="text-xs text-neutral-500 max-w-sm mt-1">
          Selecciona una nota en el explorador lateral o crea una nueva para comenzar a tejer el lore.
        </p>
      </div>
    );
  }

  // Handle typing in editor and [[ autocompletion
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const selPos = e.target.selectionStart;
    setLocalContent(val);
    setCursorPos(selPos);

    // Save to context
    updateDocument(activeDocument.id, val);

    // Check if user is typing [[
    const textBefore = val.slice(0, selPos);
    const lastOpenIndex = textBefore.lastIndexOf('[[');
    const lastCloseIndex = textBefore.lastIndexOf(']]');

    if (lastOpenIndex !== -1 && lastOpenIndex > lastCloseIndex) {
      const query = textBefore.slice(lastOpenIndex + 2);
      if (!query.includes('\n')) {
        setLinkQuery(query);
        setShowLinkAutocomplete(true);
        return;
      }
    }
    setShowLinkAutocomplete(false);
  };

  // Insert wiki link from autocomplete
  const insertWikiLink = (targetTitle: string) => {
    if (!textareaRef.current) return;
    const val = localContent;
    const textBefore = val.slice(0, cursorPos);
    const textAfter = val.slice(cursorPos);
    const lastOpenIndex = textBefore.lastIndexOf('[[');

    if (lastOpenIndex !== -1) {
      const prefix = textBefore.slice(0, lastOpenIndex);
      const newText = `${prefix}[[${targetTitle}]]${textAfter}`;
      setLocalContent(newText);
      updateDocument(activeDocument.id, newText);
      setShowLinkAutocomplete(false);

      setTimeout(() => {
        if (textareaRef.current) {
          const newPos = prefix.length + targetTitle.length + 4;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      }, 50);
    }
  };

  // Helper toolbar insertion
  const insertFormatting = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selText = localContent.substring(start, end);
    const replacement = `${prefix}${selText || 'texto'}${suffix}`;

    const newContent = localContent.substring(0, start) + replacement + localContent.substring(end);
    setLocalContent(newContent);
    updateDocument(activeDocument.id, newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selText.length || 5));
    }, 50);
  };

  const insertSnippet = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newContent = localContent.substring(0, start) + snippet + localContent.substring(start);
    setLocalContent(newContent);
    updateDocument(activeDocument.id, newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 50);
  };

  // Filter documents for wiki autocomplete
  const matchingDocs = universeDocuments.filter((d) =>
    d.frontmatter.title.toLowerCase().includes(linkQuery.toLowerCase())
  );

  // Backlinks calculation: find documents that link to this one
  const backlinks = universeDocuments.filter((d) =>
    (d.outlinks || []).includes(activeDocument.id)
  );

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-neutral-950 transition-colors ${zenMode ? 'fixed inset-0 z-50 p-6' : ''}`}>
      {/* Top Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-900/50 backdrop-blur-xs shrink-0 gap-3">
        {/* Left: Breadcrumb & Title */}
        <div className="flex items-center gap-2 min-w-0 text-xs">
          <span className="capitalize font-mono text-neutral-500">{activeDocument.frontmatter.type}</span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-xs sm:max-w-md">
            {activeDocument.frontmatter.title}
          </span>
          {hasUnsavedChanges && (
            <span className="text-[10px] font-mono text-amber-500 animate-pulse">Guardando...</span>
          )}
        </div>

        {/* Center: Formatting Actions (Visible in Split or Raw mode) */}
        {editorMode !== 'wysiwyg' && (
          <div className="hidden lg:flex items-center gap-1 border-x border-neutral-200 dark:border-neutral-800 px-3">
            <button
              onClick={() => insertFormatting('**', '**')}
              title="Negrita (Ctrl+B)"
              className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('*', '*')}
              title="Cursiva (Ctrl+I)"
              className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('# ')}
              title="Encabezado 1"
              className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('## ')}
              title="Encabezado 2"
              className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-3.5 bg-neutral-300 dark:bg-neutral-700 mx-1" />
            <button
              onClick={() => insertFormatting('[[', ']]')}
              title="Enlace Wiki [[NombreDePagina]]"
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>WikiLink</span>
            </button>
            <button
              onClick={() => insertSnippet('\n| Atributo | Detalle |\n| :--- | :--- |\n| Dato 1 | Valor 1 |\n')}
              title="Insertar Tabla"
              className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertSnippet('\n```mermaid\ngraph TD\n  A[Origen] --> B[Destino]\n```\n')}
              title="Insertar Diagrama Mermaid"
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>Mermaid</span>
            </button>
          </div>
        )}

        {/* Right: View mode controls & Zen */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-neutral-200/60 dark:bg-neutral-800/80 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setEditorMode('split')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                editorMode === 'split'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Vista Dividida (Editor + Vista Previa)"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dual</span>
            </button>
            <button
              onClick={() => setEditorMode('wysiwyg')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                editorMode === 'wysiwyg'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Modo Lectura Enriquecida"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lectura</span>
            </button>
            <button
              onClick={() => setEditorMode('raw')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                editorMode === 'raw'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Solo Código Markdown"
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Código</span>
            </button>
          </div>

          <button
            onClick={toggleZenMode}
            className={`p-1.5 rounded-lg border transition-colors ${
              zenMode
                ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
            }`}
            title={zenMode ? 'Salir del Modo Zen' : 'Modo Zen sin distracciones'}
          >
            {zenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => {
              if (window.confirm(`¿Estás seguro de eliminar permanentemente "${activeDocument.frontmatter.title}"?`)) {
                deleteDocument(activeDocument.id);
              }
            }}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-rose-500/50 hover:bg-rose-500/10 text-neutral-500 hover:text-rose-500 transition-colors"
            title="Eliminar este documento"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Touch Formatting Bar (Android / Tablets) */}
      {editorMode !== 'wysiwyg' && (
        <div className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900/70 overflow-x-auto shrink-0 text-xs">
          <button
            onClick={() => insertFormatting('**', '**')}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1 shrink-0"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('*', '*')}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1 shrink-0"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('# ')}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1 shrink-0"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('## ')}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1 shrink-0"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertFormatting('[[', ']]')}
            className="px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-500 border border-amber-500/30 font-medium flex items-center gap-1 shrink-0"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>WikiLink</span>
          </button>
          <button
            onClick={() => insertSnippet('\n| Atributo | Detalle |\n| :--- | :--- |\n| Dato 1 | Valor 1 |\n')}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1 shrink-0"
          >
            <Table className="w-3.5 h-3.5" />
            <span>Tabla</span>
          </button>
          <button
            onClick={() => insertSnippet('\n```mermaid\ngraph TD\n  A[Origen] --> B[Destino]\n```\n')}
            className="px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1 shrink-0"
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Mermaid</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row relative overflow-hidden">
        {/* Editor Pane (in Split or Raw mode) */}
        {(editorMode === 'split' || editorMode === 'raw') && (
          <div
            className={`flex flex-col ${
              editorMode === 'split'
                ? 'h-1/2 md:h-full w-full md:w-1/2 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800'
                : 'h-full w-full'
            }`}
          >
            <div className="relative flex-1 h-full">
              <textarea
                ref={textareaRef}
                value={localContent}
                onChange={handleContentChange}
                placeholder="Escribe el lore de tu universo... Usa [[NombreDeNota]] para vincular."
                className="w-full h-full p-4 sm:p-6 resize-none font-mono text-xs sm:text-sm leading-relaxed bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-200 focus:outline-hidden selection:bg-amber-500/20"
                spellCheck={false}
              />

              {/* WikiLink Autocompletion Popup */}
              {showLinkAutocomplete && matchingDocs.length > 0 && (
                <div className="absolute left-4 sm:left-10 top-14 sm:top-20 z-40 w-64 sm:w-72 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Vincular Nota ([[])</span>
                    <span className="font-mono">{matchingDocs.length}</span>
                  </div>
                  <div className="max-h-56 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
                    {matchingDocs.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => insertWikiLink(doc.frontmatter.title)}
                        className="w-full px-3 py-2 text-left hover:bg-amber-500/10 transition-colors flex items-center justify-between group"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate group-hover:text-amber-500">
                            {doc.frontmatter.title}
                          </p>
                          <p className="text-[10px] text-neutral-500 capitalize">{doc.frontmatter.type}</p>
                        </div>
                        <ArrowUpRight className="w-3 h-3 text-neutral-400 group-hover:text-amber-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Preview / WYSIWYG Pane */}
        {(editorMode === 'split' || editorMode === 'wysiwyg') && (
          <div
            className={`overflow-y-auto ${
              editorMode === 'split' ? 'h-1/2 md:h-full w-full md:w-1/2' : 'h-full w-full max-w-4xl mx-auto'
            } p-4 sm:p-6 lg:p-8 bg-neutral-50/40 dark:bg-neutral-950/70`}
          >
            <div className="max-w-3xl mx-auto">
              {/* Frontmatter metadata chips */}
              <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-neutral-500">
                <span className="capitalize">{activeDocument.frontmatter.type}</span>
                <span>·</span>
                <span>{activeDocument.wordCount} palabras</span>
                <span>·</span>
                <span>~{activeDocument.readingTimeMinutes} min de lectura</span>
                {activeDocument.frontmatter.date && (
                  <>
                    <span>·</span>
                    <span>{activeDocument.frontmatter.date}</span>
                  </>
                )}
              </div>

              {/* Rendered Markdown */}
              <MarkdownRenderer
                content={localContent}
                frontmatter={activeDocument.frontmatter}
                onNavigate={navigateToTarget}
              />

              {/* Backlinks Panel (Menciones y Referencias Inversas) */}
              <div className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                <h4 className="font-serif font-semibold text-sm text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-amber-500" />
                  Menciones y Vínculos Bidireccionales ({backlinks.length})
                </h4>
                {backlinks.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic">
                    Ninguna otra nota enlaza a esta todavía. Usa <code className="text-amber-500">[[{activeDocument.frontmatter.title}]]</code> en cualquier nota para crear un puente.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {backlinks.map((bDoc) => (
                      <div
                        key={bDoc.id}
                        onClick={() => navigateToTarget(bDoc.frontmatter.title)}
                        className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-amber-500/50 bg-white dark:bg-neutral-900/60 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-amber-500 truncate">
                            {bDoc.frontmatter.title}
                          </span>
                          <span className="text-[10px] text-neutral-500 capitalize">{bDoc.frontmatter.type}</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                          {getContextExcerpt(bDoc.content, activeDocument.frontmatter.title)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editor Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 bg-neutral-100/50 dark:bg-neutral-900/50 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3 h-3 text-neutral-400" />
            <span className="tabular-nums">{activeDocument.wordCount}</span> palabras
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-neutral-400" />
            <span className="tabular-nums">{activeDocument.readingTimeMinutes}</span> min lectura
          </span>
          <span>UTF-8 · Markdown (.md)</span>
        </div>

        <div className="flex items-center gap-3">
          {activeDocument.frontmatter.tags && activeDocument.frontmatter.tags.length > 0 && (
            <span className="flex items-center gap-1 truncate max-w-xs">
              <Tag className="w-3 h-3 text-neutral-400" />
              {activeDocument.frontmatter.tags.join(', ')}
            </span>
          )}
          <span>Línea {localContent.slice(0, cursorPos).split('\n').length}</span>
        </div>
      </div>
    </div>
  );
};
