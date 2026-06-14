// useSubmitPipeline.js
// ------------------------------------------------------------------
// Encapsulates submitting the current pipeline to the backend and
// surfacing the result. Shared so any control (e.g. the header Run
// button) can trigger a run and reflect loading state.
// ------------------------------------------------------------------

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useStore } from '../store';
import { shallow } from 'zustand/shallow';
import { ResultToast } from '../components/ResultToast';
import { api } from '../services/api';

const selector = (s) => ({ nodes: s.nodes, edges: s.edges });

export const useSubmitPipeline = () => {
  const { nodes, edges } = useStore(selector, shallow);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async () => {
    if (loading) return;
    if (nodes.length === 0) {
      toast.warning('Nothing to run', {
        description: 'Drag a node onto the canvas first.',
      });
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Analyzing pipeline…');

    try {
      const { num_nodes, num_edges, is_dag, execution_trace } = await api.parsePipeline(nodes, edges);

      toast.dismiss(toastId);
      toast.custom(
        (t) => (
          <ResultToast
            numNodes={num_nodes}
            numEdges={num_edges}
            isDag={is_dag}
            executionTrace={execution_trace}
            onClose={() => toast.dismiss(t)}
          />
        ),
        { duration: Infinity }
      );
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Could not reach the backend', {
        description: 'Run it with:  cd backend && uvicorn app.main:app --reload',
        duration: 7000,
      });
    } finally {
      setLoading(false);
    }
  }, [loading, nodes, edges]);

  return { run, loading, nodeCount: nodes.length, edgeCount: edges.length };
};
