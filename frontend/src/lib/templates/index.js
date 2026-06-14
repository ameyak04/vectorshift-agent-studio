// templates/index.js — starter pipelines for the gallery.
// Each: { id, name, description, tags, icon, graph: { nodes, edges, nodeIDs, evals } }
// Templates set deliberate per-node models to showcase model configuration.

import { Telescope, PenLine, GitBranch, BarChart3 } from 'lucide-react';
import { sampleNodes, sampleEdges, sampleNodeIDs, sampleEvals } from '../samplePipeline';

const edge = (id, source, sourceHandle, target, targetHandle) => ({
  id, source, sourceHandle, target, targetHandle, type: 'smoothstep', animated: true,
});

// 1. Research Assistant — the autonomous-trajectory showpiece (reuses the sample).
const researchAssistant = {
  id: 'research-assistant',
  name: 'Research Assistant',
  description: 'An autonomous agent that picks between web search and a calculator at runtime — watch the live trajectory.',
  tags: ['agent', 'tools', 'trajectory'],
  icon: Telescope,
  graph: { nodes: sampleNodes, edges: sampleEdges, nodeIDs: sampleNodeIDs, evals: sampleEvals },
};

// 2. Content Writer — prompt chaining with a different model per step.
const contentWriter = {
  id: 'content-writer',
  name: 'Content Writer',
  description: 'Topic → outline (Claude Haiku) → full draft (Claude Sonnet) → markdown. Prompt-chaining with per-step model choice.',
  tags: ['chain', 'llm', 'multi-model'],
  icon: PenLine,
  graph: {
    nodes: [
      { id: 'customInput-1', type: 'customInput', position: { x: 60, y: 220 },
        data: { id: 'customInput-1', nodeType: 'customInput', inputName: 'topic', inputType: 'Text',
                inputValue: 'The rise of autonomous AI agents in production software' } },
      { id: 'llm-1', type: 'llm', position: { x: 380, y: 120 },
        data: { id: 'llm-1', nodeType: 'llm', model: 'claude-haiku', temperature: '0.4',
                system: 'You are an expert content strategist. Given a topic, produce a tight bullet-point outline (5-7 points). Output only the outline.' } },
      { id: 'llm-2', type: 'llm', position: { x: 720, y: 120 },
        data: { id: 'llm-2', nodeType: 'llm', model: 'claude-sonnet', temperature: '0.8',
                system: 'You are a skilled writer. Expand the given outline into an engaging, well-structured article in markdown.' } },
      { id: 'markdownOutput-1', type: 'markdownOutput', position: { x: 1060, y: 220 },
        data: { id: 'markdownOutput-1', nodeType: 'markdownOutput' } },
      { id: 'note-1', type: 'note', position: { x: 380, y: 360 },
        data: { id: 'note-1', nodeType: 'note', note: 'Prompt chaining: the outline model (fast/cheap) feeds the draft model (smarter). Swap models on each LLM node.' } },
    ],
    edges: [
      edge('e-1', 'customInput-1', 'customInput-1-value', 'llm-1', 'llm-1-prompt'),
      edge('e-2', 'llm-1', 'llm-1-response', 'llm-2', 'llm-2-prompt'),
      edge('e-3', 'llm-2', 'llm-2-response', 'markdownOutput-1', 'markdownOutput-1-input'),
    ],
    nodeIDs: { customInput: 1, llm: 2, markdownOutput: 1, note: 1 },
    evals: [
      { id: 'cw-1', name: 'Produces a draft', inputs: { 'customInput-1': 'Benefits of unit testing' },
        assertion: { type: 'regex', target_node: 'llm-2', expected: '\\w+' } },
    ],
  },
};

// 3. Support Triage — routing: classify an incoming message into a category.
const supportTriage = {
  id: 'support-triage',
  name: 'Support Triage',
  description: 'Classify an incoming support message into a category, then route it. Ships with eval cases that check the label.',
  tags: ['router', 'classify', 'evals'],
  icon: GitBranch,
  graph: {
    nodes: [
      { id: 'customInput-1', type: 'customInput', position: { x: 60, y: 200 },
        data: { id: 'customInput-1', nodeType: 'customInput', inputName: 'message', inputType: 'Text',
                inputValue: 'I was charged twice for my subscription this month, please refund me.' } },
      { id: 'llm-1', type: 'llm', position: { x: 400, y: 200 },
        data: { id: 'llm-1', nodeType: 'llm', model: 'claude-haiku', temperature: '0',
                system: 'Classify the support message into exactly one category: billing, technical, or general. Respond with only the single lowercase category word.' } },
      { id: 'customOutput-1', type: 'customOutput', position: { x: 760, y: 200 },
        data: { id: 'customOutput-1', nodeType: 'customOutput', outputName: 'category', outputType: 'Text' } },
      { id: 'note-1', type: 'note', position: { x: 400, y: 360 },
        data: { id: 'note-1', nodeType: 'note', note: 'Routing pattern. Open the Evals tab and Run all — cases assert the predicted label.' } },
    ],
    edges: [
      edge('e-1', 'customInput-1', 'customInput-1-value', 'llm-1', 'llm-1-prompt'),
      edge('e-2', 'llm-1', 'llm-1-response', 'customOutput-1', 'customOutput-1-value'),
    ],
    nodeIDs: { customInput: 1, llm: 1, customOutput: 1, note: 1 },
    evals: [
      { id: 'st-1', name: 'Billing issue', inputs: { 'customInput-1': 'You charged my card twice, I want a refund.' },
        assertion: { type: 'contains', target_node: 'llm-1', expected: 'billing' } },
      { id: 'st-2', name: 'Technical issue', inputs: { 'customInput-1': 'The app crashes every time I upload a file.' },
        assertion: { type: 'contains', target_node: 'llm-1', expected: 'technical' } },
      { id: 'st-3', name: 'General question', inputs: { 'customInput-1': 'What are your business hours?' },
        assertion: { type: 'contains', target_node: 'llm-1', expected: 'general' } },
    ],
  },
};

// 4. Data Analyst — agent with calculator + http_get tools.
const dataAnalyst = {
  id: 'data-analyst',
  name: 'Data Analyst',
  description: 'An agent that fetches data and crunches numbers using a calculator and an HTTP tool.',
  tags: ['agent', 'tools', 'data'],
  icon: BarChart3,
  graph: {
    nodes: [
      { id: 'customInput-1', type: 'customInput', position: { x: 50, y: 150 },
        data: { id: 'customInput-1', nodeType: 'customInput', inputName: 'question', inputType: 'Text',
                inputValue: 'If revenue is 2,340 and grows 15%, what is the new total plus a 1000 bonus?' } },
      { id: 'tool-1', type: 'tool', position: { x: 50, y: 350 },
        data: { id: 'tool-1', nodeType: 'tool', toolName: 'calculator', toolKind: 'calculator', toolDesc: 'Evaluate a math expression.' } },
      { id: 'tool-2', type: 'tool', position: { x: 50, y: 560 },
        data: { id: 'tool-2', nodeType: 'tool', toolName: 'fetch_url', toolKind: 'http_get', toolDesc: 'Fetch the contents of a URL.' } },
      { id: 'agent-1', type: 'agent', position: { x: 450, y: 200 },
        data: { id: 'agent-1', nodeType: 'agent', model: 'gemini-flash', temperature: '0.3', maxSteps: '6',
                instructions: 'You are a precise data analyst. Use the calculator for any arithmetic and show the final number clearly.' } },
      { id: 'markdownOutput-1', type: 'markdownOutput', position: { x: 800, y: 200 },
        data: { id: 'markdownOutput-1', nodeType: 'markdownOutput' } },
    ],
    edges: [
      edge('e-prompt', 'customInput-1', 'customInput-1-value', 'agent-1', 'agent-1-prompt'),
      edge('e-tool1', 'tool-1', 'tool-1-handle', 'agent-1', 'agent-1-tools'),
      edge('e-tool2', 'tool-2', 'tool-2-handle', 'agent-1', 'agent-1-tools'),
      edge('e-out', 'agent-1', 'agent-1-response', 'markdownOutput-1', 'markdownOutput-1-input'),
    ],
    nodeIDs: { customInput: 1, markdownOutput: 1, agent: 1, tool: 2 },
    evals: [
      { id: 'da-1', name: 'Returns a number', inputs: { 'customInput-1': 'What is 12 * 12?' },
        assertion: { type: 'regex', target_node: 'agent-1', expected: '144' } },
    ],
  },
};

export const TEMPLATES = [researchAssistant, contentWriter, supportTriage, dataAnalyst];

export const getTemplate = (id) => TEMPLATES.find((t) => t.id === id);
