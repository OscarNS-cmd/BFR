import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { useLore } from '../../context/LoreContext';

interface MermaidRendererProps {
  chart: string;
}

let mermaidInitialized = false;

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const { theme } = useLore();

  useEffect(() => {
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        themeVariables: {
          darkMode: theme === 'dark',
          primaryColor: theme === 'dark' ? '#262626' : '#f5f5f5',
          primaryTextColor: theme === 'dark' ? '#f5f5f5' : '#171717',
          primaryBorderColor: theme === 'dark' ? '#d97706' : '#b45309',
          lineColor: theme === 'dark' ? '#737373' : '#a3a3a3',
          secondaryColor: theme === 'dark' ? '#171717' : '#fafafa',
          tertiaryColor: theme === 'dark' ? '#404040' : '#e5e5e5',
        },
      });
      mermaidInitialized = true;
    } catch (e) {
      console.error('Error initializing mermaid', e);
    }
  }, [theme]);

  useEffect(() => {
    let isMounted = true;
    const cleanChart = chart.trim();

    if (!cleanChart) {
      setSvgContent('');
      setError(null);
      return;
    }

    const renderChart = async () => {
      try {
        const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, cleanChart);
        if (isMounted) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Error al compilar el diagrama Mermaid');
          setSvgContent('');
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, theme]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (error) {
    return (
      <div className="my-4 rounded-lg border border-amber-900/40 bg-amber-950/20 p-4 text-xs font-mono text-amber-300">
        <div className="flex items-center gap-2 mb-2 text-amber-400 font-sans font-medium">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span>Diagrama Mermaid (Sintaxis en edición)</span>
        </div>
        <pre className="overflow-x-auto p-2 bg-neutral-900/60 rounded text-neutral-300">{chart}</pre>
      </div>
    );
  }

  return (
    <div className="group relative my-6 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-4 transition-colors">
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          title="Copiar código Mermaid"
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors shadow-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copiado' : 'Código'}</span>
        </button>
      </div>

      <div
        ref={containerRef}
        className="mermaid-viewport flex justify-center items-center overflow-x-auto py-2 [&>svg]:max-w-full [&>svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
};
