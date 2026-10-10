import React, { useState, useRef } from 'react';
import { Image, Upload, Copy, Check, Maximize2, Trash2, Tag, Plus, ExternalLink } from 'lucide-react';
import { useLore } from '../../context/LoreContext';
import { ImageAsset } from '../../types/lore';

export const GalleryModule: React.FC = () => {
  const { images, addImage, deleteImage, documents, navigateToTarget } = useLore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<ImageAsset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'all', label: 'Todas las Imágenes' },
    { id: 'character', label: 'Personajes' },
    { id: 'creature', label: 'Bestiario' },
    { id: 'location', label: 'Lugares & Ciudadelas' },
    { id: 'artifact', label: 'Reliquias & Objetos' },
    { id: 'map', label: 'Mapas Cartográficos' },
  ];

  const filteredImages = images.filter((img) =>
    selectedCategory === 'all' ? true : img.category === selectedCategory
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const result = loadEvt.target?.result as string;
        if (result) {
          addImage({
            name: file.name.replace(/\.[^/.]+$/, ''),
            url: result,
            category: 'other',
            tags: ['local', 'usuario'],
          });
        }
      };
      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyMarkdownSnippet = (img: ImageAsset) => {
    const snippet = `![${img.name}](${img.url} "${img.name}")`;
    navigator.clipboard.writeText(snippet);
    setCopiedId(img.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="h-full overflow-y-auto p-6 lg:p-8 bg-neutral-50/50 dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium uppercase tracking-wider">
              <Image className="w-3.5 h-3.5" />
              <span>Bóveda Visual del Universo</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-50 mt-1">
              Galería de Imágenes & Assets
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Indexación automática de retratos, paisajes y artefactos. Copia en un clic el código Markdown para tus notas.
            </p>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>Subir Imagen Local</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden shadow-xs hover:border-amber-500/50 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image preview */}
                <div
                  className="relative aspect-4/3 w-full bg-neutral-950 overflow-hidden cursor-pointer"
                  onClick={() => setLightboxImg(img)}
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="p-2 rounded-lg bg-neutral-900/80 text-white hover:bg-neutral-800 transition-colors">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <h3 className="font-serif font-semibold text-sm text-neutral-900 dark:text-neutral-100 truncate">
                    {img.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 capitalize">
                    <span>{img.category}</span>
                    <span>·</span>
                    <span>{new Date(img.addedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

                {/* Action buttons */}
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900/90 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => copyMarkdownSnippet(img)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                      copiedId === img.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-200/80 dark:bg-neutral-800 hover:bg-amber-600 hover:text-white text-neutral-800 dark:text-neutral-200'
                    }`}
                    title="Copiar snippet: ![Nombre](ruta)"
                  >
                    {copiedId === img.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === img.id ? '¡Copiado!' : 'Copiar Markdown'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`¿Eliminar la imagen "${img.name}" de la galería?`)) {
                        deleteImage(img.id);
                      }
                    }}
                    title="Eliminar de la galería"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setLightboxImg(null)}
        >
          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={lightboxImg.url}
              alt={lightboxImg.name}
              className="max-w-full max-h-[80vh] rounded-xl object-contain shadow-2xl border border-neutral-800"
            />
            <p className="mt-3 text-sm text-neutral-200 font-serif font-bold">
              {lightboxImg.name}
            </p>
            <button
              onClick={() => setLightboxImg(null)}
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
