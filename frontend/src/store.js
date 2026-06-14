// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';
import { sampleNodes, sampleEdges, sampleNodeIDs, sampleEvals } from './lib/samplePipeline';
import {
    loadLibrary, saveToLibrary, removeFromLibrary, mergeLibrary,
    loadAutosave, writeAutosave, newId, exportRecord,
} from './lib/storage';
import { api } from './services/api';

// Pick the initial canvas: restore the user's autosaved work, else the sample.
const autosaved = loadAutosave();
const initialGraph = autosaved && autosaved.nodes?.length
  ? autosaved
  : { nodes: sampleNodes, edges: sampleEdges, nodeIDs: sampleNodeIDs, evals: sampleEvals, name: 'Research Assistant', id: null };

export const useStore = create((set, get) => {
  const persist = () => {
    const { nodes, edges, nodeIDs, evals, currentName, currentId } = get();
    writeAutosave({ nodes, edges, nodeIDs, evals: evals.cases, name: currentName, id: currentId });
  };

  return {
    nodes: initialGraph.nodes,
    edges: initialGraph.edges,
    nodeIDs: initialGraph.nodeIDs || {},
    activeNodeId: null,

    // Studio meta
    currentName: initialGraph.name || 'Untitled pipeline',
    currentId: initialGraph.id || null,
    library: loadLibrary(),
    syncing: false,

    // Agent execution state
    trajectory: [],
    run: { status: 'idle', summary: null, steps: 0, nodeOutputs: {}, costs: {} },
    evals: { cases: initialGraph.evals || [], results: [], running: false },

    setActiveNode: (id) => set({ activeNodeId: id }),
    setEvals: (cases) => { set((s) => ({ evals: { ...s.evals, cases } })); persist(); },
    setEvalRunning: (running) => set((s) => ({ evals: { ...s.evals, running } })),
    setEvalResults: (results) => set((s) => ({ evals: { ...s.evals, results } })),

    startRun: () => set({ run: { status: 'running', summary: null, steps: 0, nodeOutputs: {}, costs: {} }, trajectory: [], activeNodeId: null }),
    recordStep: (stepInfo) => set((s) => ({
      trajectory: [...s.trajectory, stepInfo],
      run: { ...s.run, steps: s.run.steps + 1 }
    })),
    finishRun: (summary) => set((s) => ({ run: { ...s.run, status: 'complete', summary }, activeNodeId: null })),

    // ---- Studio: load / save / library ----

    setCurrentName: (name) => { set({ currentName: name }); persist(); },

    // Unified loader for templates and saved agents.
    loadGraph: (graph, meta = {}) => {
      set({
        nodes: graph.nodes || [],
        edges: graph.edges || [],
        nodeIDs: graph.nodeIDs || {},
        evals: { cases: graph.evals || [], results: [], running: false },
        currentName: meta.name || graph.name || 'Untitled pipeline',
        currentId: meta.id || null,
        activeNodeId: null,
        trajectory: [],
        run: { status: 'idle', summary: null, steps: 0, nodeOutputs: {}, costs: {} },
      });
      persist();
    },

    saveCurrent: (name, description = '') => {
      const { nodes, edges, nodeIDs, evals, currentId } = get();
      const id = currentId || newId();
      const record = {
        id,
        name: name || get().currentName || 'Untitled pipeline',
        description,
        updatedAt: Date.now(),
        graph: { nodes, edges, nodeIDs, evals: evals.cases },
      };
      const library = saveToLibrary(record);
      set({ library, currentId: id, currentName: record.name });
      persist();
      // best-effort backend mirror
      api.saveAgent(record).catch(() => {});
      return record;
    },

    loadSaved: (id) => {
      const rec = get().library.find((r) => r.id === id);
      if (rec) get().loadGraph(rec.graph, { name: rec.name, id: rec.id });
    },

    deleteSaved: (id) => {
      const library = removeFromLibrary(id);
      set({ library, currentId: get().currentId === id ? null : get().currentId });
      api.deleteAgent(id).catch(() => {});
    },

    duplicateSaved: (id) => {
      const rec = get().library.find((r) => r.id === id);
      if (!rec) return;
      const copy = { ...rec, id: newId(), name: `${rec.name} (copy)`, updatedAt: Date.now() };
      const library = saveToLibrary(copy);
      set({ library });
      api.saveAgent(copy).catch(() => {});
    },

    renameSaved: (id, name) => {
      const rec = get().library.find((r) => r.id === id);
      if (!rec) return;
      const updated = { ...rec, name, updatedAt: Date.now() };
      const library = saveToLibrary(updated);
      set({ library, currentName: get().currentId === id ? name : get().currentName });
      api.saveAgent(updated).catch(() => {});
    },

    exportCurrent: () => {
      const { nodes, edges, nodeIDs, evals, currentName, currentId } = get();
      exportRecord({
        id: currentId || newId(),
        name: currentName,
        updatedAt: Date.now(),
        graph: { nodes, edges, nodeIDs, evals: evals.cases },
      });
    },

    importRecord: (record) => {
      if (!record?.graph) throw new Error('Not a valid agent file');
      const id = newId();
      const rec = { ...record, id, updatedAt: Date.now() };
      const library = saveToLibrary(rec);
      set({ library });
      get().loadGraph(rec.graph, { name: rec.name, id });
    },

    // Pull backend records and merge into local library (last-write-wins).
    syncLibrary: async () => {
      set({ syncing: true });
      try {
        const remote = await api.listAgents();
        set({ library: mergeLibrary(remote), syncing: false });
      } catch {
        set({ syncing: false });
      }
    },

    clearPipeline: () => {
      set({ nodes: [], edges: [], nodeIDs: {}, activeNodeId: null, currentName: 'Untitled pipeline', currentId: null,
            trajectory: [], run: { status: 'idle', summary: null, steps: 0, nodeOutputs: {}, costs: {} },
            evals: { cases: [], results: [], running: false } });
      persist();
    },

    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },
    addNode: (node) => {
        set({ nodes: [...get().nodes, node] });
        persist();
    },
    removeNode: (id) => {
        set({
            nodes: get().nodes.filter((n) => n.id !== id),
            edges: get().edges.filter((e) => e.source !== id && e.target !== id)
        });
        persist();
    },
    onNodesChange: (changes) => {
      set({ nodes: applyNodeChanges(changes, get().nodes) });
      persist();
    },
    onEdgesChange: (changes) => {
      set({ edges: applyEdgeChanges(changes, get().edges) });
      persist();
    },
    onConnect: (connection) => {
      set({
        edges: addEdge({...connection, type: 'smoothstep', animated: true, markerEnd: {type: MarkerType.Arrow, height: '20px', width: '20px'}}, get().edges),
      });
      persist();
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, [fieldName]: fieldValue } }
            : node
        ),
      });
      persist();
    },
  };
});
