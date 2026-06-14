import { useState } from 'react';
import { Workflow, Trash2, LayoutGrid, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useSubmitPipeline } from '../hooks/useSubmitPipeline';
import { Button } from './ui/Button';
import { useStore } from '../store';
import { TemplateGallery } from './TemplateGallery';
import { LibraryMenu } from './LibraryMenu';

const pad = (n) => String(n).padStart(2, '0');

export const Header = () => {
  const { run, loading, nodeCount, edgeCount } = useSubmitPipeline();
  const clearPipeline = useStore((s) => s.clearPipeline);
  const currentName = useStore((s) => s.currentName);
  const setCurrentName = useStore((s) => s.setCurrentName);
  const saveCurrent = useStore((s) => s.saveCurrent);

  const [galleryOpen, setGalleryOpen] = useState(false);

  const onSave = () => {
    let name = currentName;
    if (!name || name === 'Untitled pipeline') {
      name = window.prompt('Name this agent:', 'My Agent');
      if (!name) return;
    }
    saveCurrent(name);
    toast.success(`Saved "${name}"`);
  };

  return (
    <>
      <header className="panel-surface relative z-20 flex items-center gap-3 px-5 h-14 border-b border-line">
        {/* Brand monogram */}
        <div className="flex items-center gap-3">
          <div className="relative grid place-items-center w-9 h-9 border border-cyan/50 text-cyan">
            <Workflow size={17} strokeWidth={2} />
            <span className="absolute -top-px -left-px w-1.5 h-1.5 border-t border-l border-cyan" />
            <span className="absolute -top-px -right-px w-1.5 h-1.5 border-t border-r border-cyan" />
            <span className="absolute -bottom-px -left-px w-1.5 h-1.5 border-b border-l border-cyan" />
            <span className="absolute -bottom-px -right-px w-1.5 h-1.5 border-b border-r border-cyan" />
          </div>
          <div className="leading-none">
            <div className="font-mono text-sm font-semibold tracking-[0.22em] text-paper">VECTORSHIFT</div>
            <div className="font-mono text-2xs tracking-[0.18em] text-cyan/70 mt-1">{'// AGENT_STUDIO'}</div>
          </div>
        </div>

        {/* Editable pipeline name — breadcrumb readout */}
        <div className="ml-3 hidden sm:flex items-center group">
          <span className="font-mono text-faint mr-1.5 select-none">/</span>
          <input
            value={currentName}
            onChange={(e) => setCurrentName(e.target.value)}
            spellCheck={false}
            title="Rename pipeline"
            className="w-44 bg-transparent border-b border-line/40 hover:border-line focus:border-cyan/60 outline-none
                       font-mono text-xs text-paper py-1 transition-colors truncate"
          />
        </div>

        <div className="flex-1" />

        {/* Studio cluster */}
        <Button
          variant="ghost" size="md" onClick={() => setGalleryOpen(true)}
          className="font-mono uppercase tracking-widest text-[#9fb0c4] flex items-center gap-2"
        >
          <LayoutGrid size={14} /> Templates
        </Button>

        <Button
          variant="ghost" size="md" onClick={onSave}
          className="font-mono uppercase tracking-widest text-[#9fb0c4] flex items-center gap-2"
        >
          <Save size={14} /> Save
        </Button>

        <LibraryMenu />

        <span className="w-px h-6 bg-line mx-1" />

        {/* Telemetry readout */}
        <div className="hidden md:flex items-center gap-3 font-mono text-2xs text-muted mr-1">
          <span className="flex items-center gap-1.5">
            <span className="text-slate-500 tracking-widest">NODES</span>
            <span className="text-cyan tabular-nums">{pad(nodeCount)}</span>
          </span>
          <span className="w-px h-4 bg-line" />
          <span className="flex items-center gap-1.5">
            <span className="text-slate-500 tracking-widest">EDGES</span>
            <span className="text-cyan tabular-nums">{pad(edgeCount)}</span>
          </span>
        </div>

        <Button
          variant="ghost" size="md" onClick={clearPipeline}
          disabled={loading || (nodeCount === 0 && edgeCount === 0)}
          className="font-mono uppercase tracking-widest text-muted hover:text-red-400 hover:bg-red-400/10 flex items-center gap-2"
        >
          <Trash2 size={14} /> Clear
        </Button>

        <Button
          variant="primary" size="md" onClick={run} isLoading={loading}
          className="font-mono uppercase tracking-widest bg-amber text-ink hover:bg-amber/90 shadow-amber/20"
        >
          {loading ? 'Running' : 'Run'}
        </Button>
      </header>

      <TemplateGallery open={galleryOpen} onClose={() => setGalleryOpen(false)} />
    </>
  );
};
