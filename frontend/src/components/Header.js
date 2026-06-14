import { Workflow } from 'lucide-react';
import { useSubmitPipeline } from '../hooks/useSubmitPipeline';
import { Button } from './ui/Button';

const pad = (n) => String(n).padStart(2, '0');

export const Header = () => {
  const { run, loading, nodeCount, edgeCount } = useSubmitPipeline();

  return (
    <header className="panel-surface relative z-20 flex items-center gap-4 px-5 h-14 border-b border-line">
      {/* Brand monogram */}
      <div className="flex items-center gap-3">
        <div className="relative grid place-items-center w-9 h-9 border border-cyan/50 text-cyan">
          <Workflow size={17} strokeWidth={2} />
          {/* registration corner ticks */}
          <span className="absolute -top-px -left-px w-1.5 h-1.5 border-t border-l border-cyan" />
          <span className="absolute -top-px -right-px w-1.5 h-1.5 border-t border-r border-cyan" />
          <span className="absolute -bottom-px -left-px w-1.5 h-1.5 border-b border-l border-cyan" />
          <span className="absolute -bottom-px -right-px w-1.5 h-1.5 border-b border-r border-cyan" />
        </div>
        <div className="leading-none">
          <div className="font-mono text-sm font-semibold tracking-[0.22em] text-paper">VECTORSHIFT</div>
          <div className="font-mono text-2xs tracking-[0.18em] text-cyan/70 mt-1">{'// PIPELINE_BUILDER'}</div>
        </div>
      </div>

      <div className="flex-1" />

      {/* Telemetry readout */}
      <div className="hidden sm:flex items-center gap-3 font-mono text-2xs text-muted mr-1">
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

      {/* Run — amber action */}
      <Button
        variant="primary"
        size="md"
        onClick={run}
        isLoading={loading}
        className="font-mono uppercase tracking-widest bg-amber text-ink hover:bg-amber/90 shadow-amber/20"
      >
        {loading ? 'Running' : 'Run'}
      </Button>
    </header>
  );
};
