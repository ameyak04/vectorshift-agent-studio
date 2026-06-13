// PaletteItem.js — a draggable node card in the blueprint sidebar palette.

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { CATEGORY_ACCENTS } from '../nodes/BaseNode';

export const PaletteItem = ({ type, label, icon: Icon, category, description }) => {
  const accent = CATEGORY_ACCENTS[category] || CATEGORY_ACCENTS.default;

  const onDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType: type }));
    event.dataTransfer.effectAllowed = 'move';
    event.currentTarget.style.cursor = 'grabbing';
  };

  return (
    <motion.div
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      draggable
      onDragStart={onDragStart}
      onDragEnd={(e) => (e.currentTarget.style.cursor = 'grab')}
      className="group relative flex items-center gap-2.5 pl-2.5 pr-2 py-2 border border-transparent
                 cursor-grab select-none transition-colors hover:bg-hover hover:border-line"
    >
      {/* left accent tick */}
      <span
        className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-0 group-hover:h-5 transition-all"
        style={{ background: accent }}
      />
      <span
        className="grid place-items-center w-7 h-7 shrink-0 border"
        style={{ color: accent, borderColor: `${accent}55`, background: `${accent}12` }}
      >
        <Icon size={15} strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-paper leading-tight">{label}</div>
        <div className="font-mono text-2xs text-faint leading-tight truncate">{description}</div>
      </div>
      <Plus size={13} className="text-faint/0 group-hover:text-cyan transition-colors shrink-0" />
    </motion.div>
  );
};
