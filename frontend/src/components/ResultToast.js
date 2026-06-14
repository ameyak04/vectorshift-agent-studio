import { CheckCircle2, AlertTriangle, X, Terminal } from 'lucide-react';

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between border border-line bg-ink/50 px-3 py-2">
    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">{label}</span>
    <span className="font-mono text-sm font-semibold tabular-nums text-paper">{value}</span>
  </div>
);

export const ResultToast = ({ numNodes, numEdges, isDag, executionTrace, onClose }) => {
  const ok = isDag;
  const color = ok ? '#34d399' : '#f5a524';

  return (
    <div className="panel-surface w-[420px] border border-line shadow-2xl rounded-md overflow-hidden bg-[#0c121c]">
      {/* header strip */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-line bg-ink/30">
        {ok ? (
          <CheckCircle2 size={16} style={{ color }} strokeWidth={2.25} />
        ) : (
          <AlertTriangle size={16} style={{ color }} strokeWidth={2.25} />
        )}
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper font-semibold">
          Execution_Report
        </span>
        <button
          onClick={onClose}
          className="ml-auto text-slate-400 hover:text-paper transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Row label="Nodes" value={numNodes} />
          <Row label="Edges" value={numEdges} />
        </div>
        <div
          className="flex items-center justify-between px-3 py-2 border rounded-sm"
          style={{ background: `${color}12`, borderColor: `${color}55` }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color }}>
            DAG Status
          </span>
          <span className="font-mono text-xs font-semibold" style={{ color }}>
            {ok ? 'VALID · ACYCLIC' : 'INVALID · CYCLE'}
          </span>
        </div>
        
        {executionTrace && (
          <div className="mt-2 flex flex-col border border-line rounded-sm overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-ink border-b border-line">
              <Terminal size={12} className="text-cyan" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan">Node_Output_Trace</span>
            </div>
            <div className="p-3 max-h-[300px] overflow-y-auto bg-ink/40 space-y-3 custom-scrollbar">
              {Object.entries(executionTrace).map(([nodeId, output]) => (
                <div key={nodeId} className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-amber/80 tracking-wider">[{nodeId}]</span>
                  <div className="font-mono text-xs text-slate-300 bg-[#0a0e14] border border-[#1b2a3d] p-2 rounded whitespace-pre-wrap leading-relaxed">
                    {output}
                  </div>
                </div>
              ))}
              {Object.keys(executionTrace).length === 0 && (
                <div className="text-xs text-slate-500 font-mono italic">No nodes executed.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
