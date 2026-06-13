// ResultToast.js — blueprint readout card shown after the backend analyzes a pipeline.

import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between border border-line bg-ink/50 px-3 py-2">
    <span className="font-mono text-2xs uppercase tracking-[0.18em] text-faint">{label}</span>
    <span className="font-mono text-base font-semibold tabular-nums text-paper">{value}</span>
  </div>
);

export const ResultToast = ({ numNodes, numEdges, isDag, onClose }) => {
  const ok = isDag;
  const color = ok ? '#34d399' : '#f5a524';

  return (
    <div className="panel-surface w-[300px] border border-line shadow-node">
      {/* header strip */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-line">
        {ok ? (
          <CheckCircle2 size={16} style={{ color }} strokeWidth={2.25} />
        ) : (
          <AlertTriangle size={16} style={{ color }} strokeWidth={2.25} />
        )}
        <span className="font-mono text-2xs uppercase tracking-[0.18em] text-paper">
          Pipeline_Analyzed
        </span>
        <button
          onClick={onClose}
          className="ml-auto text-faint hover:text-paper transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-2">
        <Row label="Nodes" value={numNodes} />
        <Row label="Edges" value={numEdges} />
        <div
          className="flex items-center justify-between px-3 py-2.5 border"
          style={{ background: `${color}12`, borderColor: `${color}55` }}
        >
          <span className="font-mono text-2xs uppercase tracking-[0.18em]" style={{ color }}>
            DAG
          </span>
          <span className="font-mono text-xs font-semibold" style={{ color }}>
            {ok ? 'VALID · ACYCLIC' : 'INVALID · CYCLE'}
          </span>
        </div>
      </div>
    </div>
  );
};
