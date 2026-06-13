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

const BACKEND_URL = 'http://localhost:8000/pipelines/parse';

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
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);

      const { num_nodes, num_edges, is_dag } = await res.json();

      toast.dismiss(toastId);
      toast.custom(
        (t) => (
          <ResultToast
            numNodes={num_nodes}
            numEdges={num_edges}
            isDag={is_dag}
            onClose={() => toast.dismiss(t)}
          />
        ),
        { duration: 6000 }
      );
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Could not reach the backend', {
        description: 'Run it with:  cd backend && uvicorn main:app --reload',
        duration: 7000,
      });
    } finally {
      setLoading(false);
    }
  }, [loading, nodes, edges]);

  return { run, loading, nodeCount: nodes.length, edgeCount: edges.length };
};
