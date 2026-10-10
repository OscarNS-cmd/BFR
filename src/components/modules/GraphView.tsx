import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Network, ZoomIn, ZoomOut, RefreshCw, Filter, Search, ArrowRight, Layers } from 'lucide-react';
import { useLore } from '../../context/LoreContext';
import { DocumentType, LoreDocument } from '../../types/lore';

interface SimNode {
  id: string;
  title: string;
  type: DocumentType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  linksCount: number;
}

interface SimLink {
  source: string;
  target: string;
}

const typeColorMap: Record<DocumentType, { fill: string; stroke: string; label: string }> = {
  character: { fill: '#10b981', stroke: '#059669', label: 'Personajes' },
  story: { fill: '#f59e0b', stroke: '#d97706', label: 'Historias' },
  creature: { fill: '#f43f5e', stroke: '#e11d48', label: 'Bestiario' },
  timeline: { fill: '#0ea5e9', stroke: '#0284c7', label: 'Cronología' },
  location: { fill: '#8b5cf6', stroke: '#7c3aed', label: 'Lugares' },
  faction: { fill: '#6366f1', stroke: '#4f46e5', label: 'Facciones' },
  note: { fill: '#737373', stroke: '#525252', label: 'Notas' },
};

export const GraphView: React.FC = () => {
  const { universeDocuments, setActiveDocId, setActiveModule } = useLore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedNode, setSelectedNode] = useState<SimNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
  const [activeTypes, setActiveTypes] = useState<Record<DocumentType, boolean>>({
    character: true,
    story: true,
    creature: true,
    timeline: true,
    location: true,
    faction: true,
    note: true,
  });

  const [search, setSearch] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Build nodes and edges
  const { nodes, links } = useMemo(() => {
    const rawNodes: SimNode[] = [];
    const rawLinks: SimLink[] = [];
    const validIds = new Set<string>();

    universeDocuments.forEach((doc) => {
      if (activeTypes[doc.frontmatter.type]) {
        validIds.add(doc.id);
      }
    });

    universeDocuments.forEach((doc, i) => {
      if (!validIds.has(doc.id)) return;

      const angle = (i / (universeDocuments.length || 1)) * 2 * Math.PI;
      const dist = 160 + (i % 3) * 80;

      rawNodes.push({
        id: doc.id,
        title: doc.frontmatter.title,
        type: doc.frontmatter.type,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: Math.max(8, Math.min(22, 10 + (doc.backlinks?.length || 0) * 3)),
        linksCount: (doc.backlinks?.length || 0) + (doc.outlinks?.length || 0),
      });

      // Outlinks
      if (doc.outlinks) {
        doc.outlinks.forEach((targetId) => {
          if (validIds.has(targetId) && targetId !== doc.id) {
            rawLinks.push({ source: doc.id, target: targetId });
          }
        });
      }
    });

    return { nodes: rawNodes, links: rawLinks };
  }, [universeDocuments, activeTypes]);

  // Simulation physics loop
  useEffect(() => {
    let animId: number;
    let iteration = 0;
    const maxIterations = 300;

    const tick = () => {
      if (iteration < maxIterations) {
        // Simple force layout
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const n1 = nodes[i];
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

            if (dist < 260) {
              const force = (260 - dist) / dist * 0.04;
              n1.vx -= dx * force;
              n1.vy -= dy * force;
              n2.vx += dx * force;
              n2.vy += dy * force;
            }
          }
        }

        // Link spring forces
        links.forEach((l) => {
          const s = nodes.find((n) => n.id === l.source);
          const t = nodes.find((n) => n.id === l.target);
          if (s && t) {
            const dx = t.x - s.x;
            const dy = t.y - s.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const targetDist = 120;
            const force = (dist - targetDist) * 0.008;

            s.vx += dx * force;
            s.vy += dy * force;
            t.vx -= dx * force;
            t.vy -= dy * force;
          }
        });

        // Center gravity and damping
        nodes.forEach((n) => {
          n.vx -= n.x * 0.002;
          n.vy -= n.y * 0.002;

          n.vx *= 0.85;
          n.vy *= 0.85;
          n.x += n.vx;
          n.y += n.vy;
        });

        iteration++;
      }

      draw();
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [nodes, links, zoom, pan, hoveredNode, selectedNode, search]);

  // Canvas drawing
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.save();

    // Center and transform
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    ctx.scale(zoom, zoom);

    // Draw Links
    links.forEach((link) => {
      const s = nodes.find((n) => n.id === link.source);
      const t = nodes.find((n) => n.id === link.target);
      if (!s || !t) return;

      const isHighlighted =
        (hoveredNode && (hoveredNode.id === s.id || hoveredNode.id === t.id)) ||
        (selectedNode && (selectedNode.id === s.id || selectedNode.id === t.id));

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.strokeStyle = isHighlighted ? '#f59e0b' : 'rgba(150, 150, 150, 0.2)';
      ctx.lineWidth = isHighlighted ? 2.5 : 1;
      ctx.stroke();
    });

    // Draw Nodes
    nodes.forEach((node) => {
      const isHovered = hoveredNode?.id === node.id;
      const isSelected = selectedNode?.id === node.id;
      const isMatch = search && node.title.toLowerCase().includes(search.toLowerCase());
      const typeInfo = typeColorMap[node.type] || typeColorMap.note;

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fillStyle = typeInfo.fill;
      ctx.fill();

      // Border ring
      ctx.strokeStyle = isSelected || isMatch ? '#ffffff' : isHovered ? '#f59e0b' : typeInfo.stroke;
      ctx.lineWidth = isSelected || isMatch ? 3.5 : isHovered ? 2.5 : 1.5;
      ctx.stroke();

      // Label
      if (zoom > 0.65 || isHovered || isSelected || isMatch) {
        ctx.font = `${isHovered || isSelected ? 'bold 11px' : '10px'} Plus Jakarta Sans, sans-serif`;
        ctx.fillStyle = '#e5e5e5';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(node.title, node.x, node.y + node.radius + 4);
      }
    });

    ctx.restore();
  };

  // Mouse interaction
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
      return;
    }

    // Hit test hovered node
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - canvas.width / 2 - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - canvas.height / 2 - pan.y) / zoom;

    const hit = nodes.find((n) => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 3;
    });

    setHoveredNode(hit || null);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
    }

    // Check click on node
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - canvas.width / 2 - pan.x) / zoom;
    const mouseY = (e.clientY - rect.top - canvas.height / 2 - pan.y) / zoom;

    const hit = nodes.find((n) => {
      const dx = n.x - mouseX;
      const dy = n.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 3;
    });

    if (hit) {
      setSelectedNode(hit);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((z) => Math.max(0.3, Math.min(3, z * zoomFactor)));
  };

  const handleOpenDoc = (id: string) => {
    setActiveDocId(id);
    setActiveModule('editor');
  };

  // Resize canvas to parent
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectedDocument = selectedNode ? universeDocuments.find((d: LoreDocument) => d.id === selectedNode.id) : null;

  return (
    <div className="relative w-full h-full bg-neutral-950 overflow-hidden flex flex-col">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 bg-neutral-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-neutral-800 pointer-events-auto shadow-lg">
          <div className="flex items-center gap-2 px-3 text-xs text-neutral-300 font-medium">
            <Network className="w-4 h-4 text-amber-500" />
            <span className="font-serif">Grafo de Lore</span>
            <span className="text-neutral-500 text-[11px] font-mono">({nodes.length} nodos)</span>
          </div>

          <div className="w-px h-4 bg-neutral-700" />

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar nodo..."
              className="pl-7 pr-2.5 py-1 text-xs rounded-lg bg-neutral-800 text-neutral-200 placeholder-neutral-500 border border-neutral-700/60 focus:outline-hidden focus:border-amber-500 w-36 sm:w-48"
            />
          </div>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="flex items-center gap-1 bg-neutral-900/90 backdrop-blur-md p-1 rounded-xl border border-neutral-800 pointer-events-auto shadow-lg text-neutral-300">
          <button
            onClick={() => setZoom((z) => Math.min(3, z * 1.2))}
            title="Acercar (+)"
            className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.3, z * 0.8))}
            title="Alejar (-)"
            className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            title="Restablecer Vista"
            className="p-1.5 rounded-lg hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Type Toggle Pills on Bottom-Left */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-1.5 bg-neutral-900/90 backdrop-blur-md p-2 rounded-xl border border-neutral-800 max-w-xl text-[11px]">
        {(Object.keys(typeColorMap) as DocumentType[]).map((type) => {
          const info = typeColorMap[type];
          const active = activeTypes[type];
          return (
            <button
              key={type}
              onClick={() => setActiveTypes((prev) => ({ ...prev, [type]: !prev[type] }))}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                active
                  ? 'bg-neutral-800 text-neutral-200 border border-neutral-700 shadow-xs'
                  : 'bg-transparent text-neutral-500 opacity-60 hover:opacity-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: info.fill }} />
              <span>{info.label}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Node Sidebar Inspector */}
      {selectedDocument && (
        <div className="absolute top-16 right-4 z-20 w-80 rounded-2xl border border-neutral-800 bg-neutral-900/95 backdrop-blur-md p-5 shadow-2xl text-neutral-100 animate-in fade-in slide-in-from-right-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
            <span className="capitalize font-mono">{selectedDocument.frontmatter.type}</span>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-neutral-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-neutral-800"
            >
              ✕
            </button>
          </div>

          <h3 className="font-serif font-bold text-lg text-white mb-2">
            {selectedDocument.frontmatter.title}
          </h3>

          {selectedDocument.frontmatter.image && (
            <img
              src={selectedDocument.frontmatter.image}
              alt=""
              className="w-full h-32 object-cover rounded-xl mb-3 border border-neutral-800"
            />
          )}

          <p className="text-xs text-neutral-300 leading-relaxed line-clamp-4 mb-4">
            {selectedDocument.content.replace(/^#+ .*\n/, '').replace(/\[!Infobox\]/g, '').trim()}
          </p>

          <div className="space-y-2 mb-4 text-xs">
            <div className="flex justify-between text-neutral-400 border-b border-neutral-800/80 pb-1">
              <span>Conexiones entrantes:</span>
              <span className="font-mono text-amber-400">{selectedDocument.backlinks?.length || 0}</span>
            </div>
            <div className="flex justify-between text-neutral-400 border-b border-neutral-800/80 pb-1">
              <span>Referencias salientes:</span>
              <span className="font-mono text-amber-400">{selectedDocument.outlinks?.length || 0}</span>
            </div>
          </div>

          <button
            onClick={() => handleOpenDoc(selectedDocument.id)}
            className="w-full flex items-center justify-center gap-2 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Abrir en el Editor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2D Canvas */}
      <div className="w-full h-full flex-1">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />
      </div>
    </div>
  );
};
