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

const selector = (s) => ({ 
  nodes: s.nodes, 
  edges: s.edges, 
  setActiveNode: s.setActiveNode,
  updateNodeField: s.updateNodeField,
  startRun: s.startRun,
  recordStep: s.recordStep,
  finishRun: s.finishRun
});

export const useSubmitPipeline = () => {
  const { nodes, edges, setActiveNode, updateNodeField, startRun, recordStep, finishRun } = useStore(selector, shallow);
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
    startRun();
    const toastId = toast.loading('Executing Pipeline Stream...');
    
    let summaryData = null;
    let executionTrace = {};

    try {
      await api.streamPipeline(nodes, edges, (event) => {
        if (event.type === 'summary') {
          summaryData = event;
        } else if (event.type === 'node_start') {
          setActiveNode(event.node_id);
        } else if (event.type === 'node_complete') {
          executionTrace[event.node_id] = event.output;
          updateNodeField(event.node_id, 'execution_result', event.output);
          setActiveNode(null);
          recordStep(event);
        } else if (event.type === 'agent_thought') {
          setActiveNode(event.agent_id);
          recordStep(event);
        } else if (event.type === 'tool_call') {
          setActiveNode(event.tool_node_id);
          recordStep(event);
        } else if (event.type === 'tool_result') {
          updateNodeField(event.tool_node_id, 'execution_result', event.result);
          recordStep(event);
        } else if (event.type === 'agent_final') {
          executionTrace[event.agent_id] = event.output;
          updateNodeField(event.agent_id, 'execution_result', event.output);
          recordStep(event);
          setActiveNode(null);
        } else if (event.type === 'error') {
          toast.error(event.message);
        } else if (event.type === 'done') {
          setActiveNode(null);
        }
      });

      toast.dismiss(toastId);
      finishRun(summaryData);
      
      if (summaryData) {
        toast.success(`Pipeline executed! ${summaryData.is_dag ? '(Valid DAG)' : ''}`);
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error('Pipeline streaming failed', {
        description: String(err),
        duration: 7000,
      });
      finishRun({ error: String(err) });
      setActiveNode(null);
    } finally {
      setLoading(false);
      setActiveNode(null);
    }
  }, [loading, nodes, edges, setActiveNode, updateNodeField, startRun, recordStep, finishRun]);

  return { run, loading, nodeCount: nodes.length, edgeCount: edges.length };
};
