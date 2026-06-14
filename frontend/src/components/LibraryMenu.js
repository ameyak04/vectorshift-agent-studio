// LibraryMenu.js — dropdown of saved agents: load / duplicate / export / delete + import.

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Trash2, Copy, Download, Upload, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../store';
import { importRecord as readFile } from '../lib/storage';

const pad2 = (n) => String(n).padStart(2, '0');

export const LibraryMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const fileRef = useRef(null);

  const library = useStore((s) => s.library);
  const syncing = useStore((s) => s.syncing);
  const loadSaved = useStore((s) => s.loadSaved);
  const deleteSaved = useStore((s) => s.deleteSaved);
  const duplicateSaved = useStore((s) => s.duplicateSaved);
  const exportCurrent = useStore((s) => s.exportCurrent);
  const importRecord = useStore((s) => s.importRecord);
  const syncLibrary = useStore((s) => s.syncLibrary);

  useEffect(() => { syncLibrary(); }, [syncLibrary]);

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const record = await readFile(file);
      importRecord(record);
      toast.success(`Imported "${record.name || 'agent'}"`);
      setOpen(false);
    } catch (err) {
      toast.error(String(err.message || err));
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 h-10 px-3 font-mono text-xs uppercase tracking-widest text-[#9fb0c4] hover:text-paper hover:bg-[#1b2a3d] rounded-md transition-colors"
      >
        <FolderOpen size={14} />
        Library
        <span className="text-cyan tabular-nums">{library.length}</span>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 mt-2 w-80 panel-surface border border-linebright shadow-node z-50"
        >
          {/* registration tick */}
          <span className="pointer-events-none absolute top-1 left-1 w-2 h-2 border-t border-l border-cyan/50" />
          <span className="pointer-events-none absolute top-1 right-1 w-2 h-2 border-t border-r border-cyan/50" />

          <div className="relative flex items-center justify-between px-3 h-10 border-b border-line">
            <span className="font-mono text-2xs tracking-[0.22em] text-faint">{'// SAVED_AGENTS'}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xs text-cyan tabular-nums">{pad2(library.length)}</span>
              <button onClick={syncLibrary} className="text-muted hover:text-cyan transition-colors" title="Sync with backend">
                <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto custom-scrollbar">
            {library.length === 0 && (
              <div className="px-3 py-6 text-center font-mono text-2xs text-faint leading-relaxed">
                {'// EMPTY'}<br />
                <span className="text-muted">Hit <span className="text-cyan/80">Save</span> to store an agent.</span>
              </div>
            )}
            {library.map((rec) => (
              <div key={rec.id} className="group relative flex items-center gap-1 pl-4 pr-2 py-2 border-b border-line/50 hover:bg-ink/60 transition-colors">
                <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyan/0 group-hover:bg-cyan transition-colors" />
                <button onClick={() => { loadSaved(rec.id); setOpen(false); }} className="flex-1 text-left min-w-0">
                  <div className="text-sm text-paper truncate">{rec.name}</div>
                  <div className="font-mono text-[10px] text-faint tabular-nums">
                    {rec.graph?.nodes?.length || 0} nodes · {new Date(rec.updatedAt).toLocaleDateString()}
                  </div>
                </button>
                <button onClick={() => duplicateSaved(rec.id)} title="Duplicate" className="p-1.5 text-faint hover:text-cyan transition-colors">
                  <Copy size={13} />
                </button>
                <button onClick={() => deleteSaved(rec.id)} title="Delete" className="p-1.5 text-faint hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex border-t border-line">
            <button onClick={() => { exportCurrent(); }} className="flex-1 flex items-center justify-center gap-1.5 h-9 font-mono text-2xs uppercase tracking-widest text-muted hover:text-paper hover:bg-[#1b2a3d] transition-colors">
              <Download size={12} /> Export
            </button>
            <span className="w-px bg-line" />
            <button onClick={() => fileRef.current?.click()} className="flex-1 flex items-center justify-center gap-1.5 h-9 font-mono text-2xs uppercase tracking-widest text-muted hover:text-paper hover:bg-[#1b2a3d] transition-colors">
              <Upload size={12} /> Import
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onImport} />
          </div>
        </motion.div>
      )}
    </div>
  );
};
