import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { shallow } from 'zustand/shallow';
import { X, Clock, Activity, Code2, Bot, Wrench, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../services/api';

const selector = (s) => ({
  nodes: s.nodes,
  edges: s.edges,
  trajectory: s.trajectory,
  run: s.run,
  evals: s.evals,
  setEvalRunning: s.setEvalRunning,
  setEvalResults: s.setEvalResults
});

export const Inspector = () => {
  const { nodes, edges, trajectory, run, evals, setEvalRunning, setEvalResults } = useStore(selector, shallow);
  const [activeTab, setActiveTab] = useState('trace'); // 'trace' or 'evals'

  if (run.status === 'idle') return null;

  const totalTokens = trajectory.reduce((acc, step) => acc + (step.tokens || 0), 0);
  const latestTime = trajectory.length > 0 ? trajectory[trajectory.length - 1].t : 0;
  
  return (
    <motion.div 
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute top-14 right-0 bottom-0 w-96 bg-surface border-l border-line shadow-2xl flex flex-col z-40 overflow-hidden"
    >
      <div className="flex-none p-4 border-b border-line bg-ink/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-mono text-sm font-semibold tracking-widest text-paper flex items-center gap-2">
            <Activity size={16} className="text-cyan" />
            INSPECTOR
          </h2>
          <div className="flex gap-2">
            {run.status === 'running' && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber/10 border border-amber/20 text-[10px] font-mono text-amber animate-pulse">
                RUNNING
              </span>
            )}
            {run.status === 'complete' && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-mono text-green-400">
                <CheckCircle2 size={12} /> COMPLETE
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
          <div className="p-2 rounded bg-surface border border-line flex flex-col gap-1">
            <span className="text-slate-500">LATENCY</span>
            <span className="text-paper">{latestTime > 0 ? `${latestTime.toFixed(2)}s` : '--'}</span>
          </div>
          <div className="p-2 rounded bg-surface border border-line flex flex-col gap-1">
            <span className="text-slate-500">TOKENS (EST)</span>
            <span className="text-paper">{totalTokens > 0 ? `~${totalTokens}` : '--'}</span>
          </div>
        </div>
      </div>

      <div className="flex border-b border-line">
        <button 
          onClick={() => setActiveTab('trace')}
          className={`flex-1 px-4 py-2 font-mono text-[10px] uppercase tracking-widest ${activeTab === 'trace' ? 'text-cyan border-b-2 border-cyan bg-cyan/5' : 'text-slate-500 hover:text-paper hover:bg-white/5'}`}
        >
          Trace Logs
        </button>
        <button 
          onClick={() => setActiveTab('evals')}
          className={`flex-1 px-4 py-2 font-mono text-[10px] uppercase tracking-widest ${activeTab === 'evals' ? 'text-cyan border-b-2 border-cyan bg-cyan/5' : 'text-slate-500 hover:text-paper hover:bg-white/5'}`}
        >
          Evals
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {activeTab === 'trace' && (
          <div className="flex flex-col gap-4">
            {trajectory.length === 0 && run.status === 'running' && (
              <div className="text-center text-slate-500 font-mono text-xs mt-10">Waiting for agent...</div>
            )}
            {trajectory.map((step, idx) => (
              <div key={idx} className="relative pl-6">
                <div className="absolute left-[11px] top-5 bottom-[-20px] w-px bg-line" />
                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-surface border border-line grid place-items-center z-10 text-slate-400">
                  {step.type === 'agent_thought' ? <Bot size={12} className="text-[#c084fc]" /> :
                   step.type === 'tool_call' ? <Wrench size={12} className="text-[#5eead4]" /> :
                   step.type === 'tool_result' ? <Code2 size={12} className="text-slate-300" /> :
                   step.type === 'agent_final' ? <FileText size={12} className="text-[#22d3ee]" /> :
                   <Activity size={12} />}
                </div>

                <div className="bg-surface border border-line rounded p-2.5 font-mono text-[10px]">
                  <div className="flex justify-between text-slate-500 mb-1.5">
                    <span className="uppercase tracking-widest font-semibold" style={{
                      color: step.type === 'agent_thought' ? '#c084fc' :
                             step.type === 'tool_call' ? '#5eead4' :
                             step.type === 'agent_final' ? '#22d3ee' : '#94a3b8'
                    }}>
                      {step.type.replace('_', ' ')}
                    </span>
                    <span className="flex items-center gap-1 opacity-70">
                      <Clock size={10} /> {step.t.toFixed(2)}s
                    </span>
                  </div>

                  {step.type === 'tool_call' && (
                    <div className="text-paper break-all">
                      <span className="text-cyan">{step.tool_name}</span>({JSON.stringify(step.args)})
                    </div>
                  )}

                  {step.type === 'tool_result' && (
                    <div className="text-slate-400 line-clamp-4 mt-1 bg-ink/50 p-1.5 rounded">
                      {step.result}
                    </div>
                  )}

                  {(step.type === 'agent_thought' || step.type === 'agent_final' || step.type === 'node_complete') && (
                    <div className="text-paper whitespace-pre-wrap">
                      {step.thought || step.output}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {run.status === 'complete' && (
              <div className="relative pl-6 pt-2">
                <div className="absolute left-0 top-3 w-6 h-6 rounded-full bg-surface border border-line grid place-items-center z-10 text-green-500">
                  <CheckCircle2 size={12} />
                </div>
                <div className="font-mono text-xs text-green-500/80 pt-1">Execution Finished</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'evals' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs text-paper uppercase tracking-widest">Test Cases</div>
              <button 
                onClick={async () => {
                  if (evals.running || evals.cases.length === 0) return;
                  setEvalRunning(true);
                  try {
                    const res = await api.evaluatePipeline(nodes, edges, evals.cases);
                    setEvalResults(res.results || []);
                  } catch (e) {
                    toast.error("Eval failed: " + e.message);
                  } finally {
                    setEvalRunning(false);
                  }
                }}
                disabled={evals.running || evals.cases.length === 0}
                className="px-3 py-1 rounded bg-cyan/10 border border-cyan/30 text-cyan text-[10px] font-mono hover:bg-cyan/20 disabled:opacity-50 transition-colors"
              >
                {evals.running ? 'RUNNING...' : 'RUN EVALS'}
              </button>
            </div>

            {evals.results && evals.results.length > 0 && (
              <div className="flex items-center justify-center p-4 bg-surface border border-line rounded mb-2">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-line stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path 
                      className={`${evals.results.filter(r => r.passed).length === evals.cases.length ? 'text-green-500' : 'text-amber'} stroke-current transition-all duration-1000`} 
                      strokeWidth="3" 
                      strokeDasharray={`${(evals.results.filter(r => r.passed).length / evals.cases.length) * 100}, 100`} 
                      fill="none" 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                    <div className="text-sm font-bold text-paper">{evals.results.filter(r => r.passed).length}/{evals.cases.length}</div>
                    <div className="text-[8px] text-slate-500">PASS</div>
                  </div>
                </div>
              </div>
            )}

            {evals.cases.length === 0 && (
              <div className="text-center text-slate-500 font-mono text-xs mt-10">No eval cases defined.</div>
            )}

            {evals.cases.map((c, i) => {
              const res = evals.results?.find(r => r.case_id === c.id);
              return (
                <div key={i} className="bg-surface border border-line rounded p-3 font-mono text-[10px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-cyan font-semibold">{c.name}</span>
                    {res ? (
                      res.passed ? 
                        <span className="text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded flex items-center gap-1"><CheckCircle2 size={10}/> PASS</span> : 
                        <span className="text-amber bg-amber/10 px-1.5 py-0.5 rounded flex items-center gap-1"><X size={10}/> FAIL</span>
                    ) : (
                      <span className="text-slate-500">IDLE</span>
                    )}
                  </div>
                  
                  <div className="text-slate-400 mb-1 flex items-center gap-1 opacity-70">
                    <Activity size={10}/> Assertion: {c.assertion.type}
                  </div>
                  <div className="text-paper bg-ink/50 p-1.5 rounded truncate">{c.assertion.expected}</div>

                  {res && !res.passed && (
                    <div className="mt-2 pt-2 border-t border-line">
                      <div className="text-red-400 mb-1 opacity-70">Actual Output:</div>
                      <div className="text-slate-300 bg-red-400/5 p-1.5 rounded line-clamp-3 break-all border border-red-400/10">{res.actual}</div>
                    </div>
                  )}
                  {res && res.latency > 0 && (
                    <div className="mt-2 text-right text-slate-500 opacity-70 flex justify-end items-center gap-1">
                      <Clock size={10} /> {res.latency.toFixed(2)}s
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
