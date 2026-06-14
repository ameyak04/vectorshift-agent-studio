// TemplateGallery.js — blueprint sheet of starter pipelines.

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { TEMPLATES } from '../lib/templates';
import { useStore } from '../store';

const pad2 = (n) => String(n).padStart(2, '0');

// L-shaped registration tick.
const Reg = ({ className }) => <span className={`pointer-events-none absolute w-2.5 h-2.5 ${className}`} />;

export const TemplateGallery = ({ open, onClose }) => {
  const loadGraph = useStore((s) => s.loadGraph);

  const pick = (t) => {
    loadGraph(t.graph, { name: t.name, id: null });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="grain panel-surface relative z-10 w-full max-w-3xl border border-linebright shadow-node overflow-hidden"
          >
            {/* registration marks */}
            <Reg className="top-1.5 left-1.5 border-t border-l border-cyan/50" />
            <Reg className="top-1.5 right-1.5 border-t border-r border-cyan/50" />
            <Reg className="bottom-1.5 left-1.5 border-b border-l border-cyan/50" />
            <Reg className="bottom-1.5 right-1.5 border-b border-r border-cyan/50" />

            {/* header */}
            <div className="relative flex items-center justify-between px-6 h-14 border-b border-line">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-2xs tracking-[0.24em] text-cyan/80">{'// TEMPLATE_GALLERY'}</span>
                <span className="font-mono text-2xs text-faint tabular-nums">{pad2(TEMPLATES.length)} SHEETS</span>
              </div>
              <button onClick={onClose} className="grid place-items-center w-7 h-7 border border-line text-muted hover:text-paper hover:border-linebright transition-colors">
                <X size={15} />
              </button>
            </div>

            {/* sheet */}
            <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3 p-6 max-h-[68vh] overflow-y-auto custom-scrollbar">
              {TEMPLATES.map((t, i) => {
                const Icon = t.icon;
                return (
                  <motion.button
                    key={t.id}
                    onClick={() => pick(t)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -2 }}
                    className="group relative text-left p-4 pl-5 bg-ink/50 border border-line hover:border-cyan/50 transition-colors flex flex-col gap-2.5"
                  >
                    {/* left accent rail */}
                    <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyan/0 group-hover:bg-cyan transition-colors" />
                    {/* hover corner ticks */}
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-cyan/0 group-hover:border-cyan/60 transition-colors" />

                    <div className="flex items-center gap-2.5">
                      <span className="grid place-items-center w-8 h-8 shrink-0 border border-cyan/30 bg-cyan/10 text-cyan rounded-[3px]">
                        <Icon size={16} strokeWidth={2} />
                      </span>
                      <span className="font-semibold text-paper leading-tight">{t.name}</span>
                      <span className="ml-auto font-mono text-2xs text-faint tabular-nums group-hover:text-cyan/70 transition-colors">
                        T_{pad2(i + 1)}
                      </span>
                    </div>

                    <p className="text-xs text-muted leading-relaxed">{t.description}</p>

                    <div className="flex items-center justify-between mt-0.5">
                      <div className="flex flex-wrap gap-1.5">
                        {t.tags.map((tag) => (
                          <span key={tag} className="font-mono text-[10px] uppercase tracking-wider text-cyan/70 border border-cyan/20 px-1.5 py-0.5">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <span className="font-mono text-[10px] text-faint tabular-nums shrink-0 ml-2">{t.graph.nodes.length} nodes</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* footer hint */}
            <div className="relative px-6 h-10 flex items-center border-t border-line font-mono text-2xs text-faint">
              <span className="text-cyan/70">SELECT</span><span className="mx-1.5">a sheet to load it onto the canvas.</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
