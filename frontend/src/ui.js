// ui.js
// The drafting canvas — React Flow with a blueprint grid + instrument chrome.
// --------------------------------------------------

import { useState, useRef, useCallback, useMemo } from 'react';
import ReactFlow, { Controls, Background, MiniMap, BackgroundVariant, MarkerType } from 'reactflow';
import { AnimatePresence } from 'framer-motion';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { nodeTypes, NODE_CATALOG } from './lib/nodeCatalog';
import { CATEGORY_ACCENTS } from './nodes/BaseNode';
import { EmptyState } from './components/EmptyState';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };

const TYPE_ACCENT = NODE_CATALOG.reduce((acc, n) => {
  acc[n.type] = CATEGORY_ACCENTS[n.category] || CATEGORY_ACCENTS.default;
  return acc;
}, {});

// L-shaped registration mark, drafting-table style.
const RegMark = ({ className }) => (
  <span className={`pointer-events-none absolute w-3.5 h-3.5 ${className}`} />
);

const selector = (state) => ({
  nodes: state.nodes,
  baseEdges: state.edges,
  trajectory: state.trajectory,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const {
    nodes,
    baseEdges,
    trajectory,
    getNodeID,
    addNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useStore(selector, shallow);

  const edges = useMemo(() => {
    const trajectoryEdges = trajectory
      .filter((step) => step.type === 'tool_call')
      .map((step) => ({
        id: `traj-${step.agent_id}-${step.tool_node_id}-${step.step}`,
        source: step.agent_id,
        target: step.tool_node_id,
        type: 'smoothstep',
        animated: true,
        label: `Step ${step.step}`,
        labelStyle: { fill: '#c084fc', fontWeight: 700, fontFamily: 'monospace', fontSize: 10 },
        labelBgStyle: { fill: '#0c121c', stroke: '#c084fc', strokeWidth: 1 },
        style: { stroke: '#c084fc', strokeWidth: 2, strokeDasharray: '4 4' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#c084fc' }
      }));
    return [...baseEdges, ...trajectoryEdges];
  }, [baseEdges, trajectory]);

  const getInitNodeData = (nodeID, type) => ({ id: nodeID, nodeType: `${type}` });

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      if (event?.dataTransfer?.getData('application/reactflow')) {
        const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
        const type = appData?.nodeType;
        if (typeof type === 'undefined' || !type) return;

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const nodeID = getNodeID(type);
        addNode({ id: nodeID, type, position, data: getInitNodeData(nodeID, type) });
      }
    },
    [reactFlowInstance, addNode, getNodeID]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div ref={reactFlowWrapper} className="grain absolute inset-0 bg-ink overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        connectionLineType="smoothstep"
        defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
        fitView
      >
        {/* Panning blueprint grid: fine + major rulings */}
        <Background id="fine" variant={BackgroundVariant.Lines} gap={28} color="rgba(34,211,238,0.05)" />
        <Background id="major" variant={BackgroundVariant.Lines} gap={140} color="rgba(34,211,238,0.10)" lineWidth={1} />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          maskColor="rgba(10, 14, 20, 0.82)"
          nodeColor={(n) => TYPE_ACCENT[n.type] || '#22d3ee'}
          nodeStrokeColor="transparent"
          nodeBorderRadius={2}
          style={{ background: '#0c121c' }}
        />
      </ReactFlow>

      {/* Instrument chrome (static, above grid, below nodes) */}
      <div className="pointer-events-none absolute inset-3 z-[2]">
        <RegMark className="top-0 left-0 border-t border-l border-cyan/40" />
        <RegMark className="top-0 right-0 border-t border-r border-cyan/40" />
        <RegMark className="bottom-0 left-0 border-b border-l border-cyan/40" />
        <RegMark className="bottom-0 right-0 border-b border-r border-cyan/40" />
        <div className="absolute top-0 left-5 font-mono text-2xs tracking-[0.2em] text-cyan/40">
          {'// CANVAS · GRID_28'}
        </div>
      </div>

      <AnimatePresence>{nodes.length === 0 && <EmptyState />}</AnimatePresence>
    </div>
  );
};
