// EmptyState.js — schematic "drop zone" hint shown when the canvas is empty.

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MousePointerClick, LayoutGrid } from 'lucide-react';
import { TemplateGallery } from './TemplateGallery';

export const EmptyState = () => {
  const [galleryOpen, setGalleryOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[5] flex flex-col items-center justify-center text-center"
      >
        <div className="pointer-events-none relative grid place-items-center w-20 h-20 mb-5 border border-dashed border-cyan/40 animate-floaty">
          <MousePointerClick size={26} className="text-cyan" strokeWidth={1.75} />
          <span className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-cyan" />
          <span className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-cyan" />
          <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-cyan" />
          <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-cyan" />
        </div>
        <div className="pointer-events-none font-mono text-2xs tracking-[0.2em] text-cyan/70 mb-2">{'// EMPTY_CANVAS'}</div>
        <div className="pointer-events-none text-lg font-semibold text-paper">Draft your first pipeline</div>
        <div className="pointer-events-none mt-1.5 font-mono text-xs text-muted max-w-xs">
          Drag a node from the library, or start from a template.
        </div>
        <button
          onClick={() => setGalleryOpen(true)}
          className="mt-5 inline-flex items-center gap-2 h-9 px-4 font-mono text-xs uppercase tracking-widest
                     text-cyan border border-cyan/40 hover:bg-cyan/10 transition-colors"
        >
          <LayoutGrid size={14} /> Start from a template
        </button>
      </motion.div>

      <TemplateGallery open={galleryOpen} onClose={() => setGalleryOpen(false)} />
    </>
  );
};
