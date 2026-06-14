// nodeCatalog.js
// ------------------------------------------------------------------
// Single source of truth for every node in the app. Both the canvas
// (ui.js -> nodeTypes) and the sidebar palette are derived from this
// one array, so adding a node is a single entry here + its component.
// ------------------------------------------------------------------

import { Inbox, Send, Bot, FileText, Sigma, Globe, Filter, StickyNote, Timer, BrainCircuit, Wrench } from 'lucide-react';

import { InputNode } from '../nodes/inputNode';
import { OutputNode } from '../nodes/outputNode';
import { LLMNode } from '../nodes/llmNode';
import { TextNode } from '../nodes/textNode';
import { MathNode } from '../nodes/mathNode';
import { ApiNode } from '../nodes/apiNode';
import { FilterNode } from '../nodes/filterNode';
import { NoteNode } from '../nodes/noteNode';
import { TimerNode } from '../nodes/timerNode';
import { WebSearchNode } from '../nodes/webSearchNode';
import { MarkdownOutputNode } from '../nodes/markdownOutputNode';
import { AgentNode } from '../nodes/agentNode';
import { ToolNode } from '../nodes/toolNode';

export const NODE_CATALOG = [
  { type: 'agent',        label: 'Agent',  icon: BrainCircuit,category: 'agent',  section: 'Agents',            component: AgentNode,  description: 'Autonomous agent loop' },
  { type: 'tool',         label: 'Tool',   icon: Wrench,     category: 'tool',   section: 'Logic',             component: ToolNode,   description: 'Agentic tool schema' },
  { type: 'customInput',  label: 'Input',  icon: Inbox,      category: 'input',  section: 'Inputs & Outputs', component: InputNode,  description: 'Pipeline entry point' },
  { type: 'customOutput', label: 'Output', icon: Send,       category: 'output', section: 'Inputs & Outputs', component: OutputNode, description: 'Pipeline result' },
  { type: 'markdownOutput', label: 'MD Output', icon: FileText, category: 'output', section: 'Inputs & Outputs', component: MarkdownOutputNode, description: 'Markdown result' },
  { type: 'llm',          label: 'LLM',    icon: Bot,        category: 'llm',    section: 'AI',               component: LLMNode,    description: 'Language model call' },
  { type: 'text',         label: 'Text',   icon: FileText,   category: 'text',   section: 'AI',               component: TextNode,   description: 'Template with variables' },
  { type: 'webSearch',    label: 'Search', icon: Globe,      category: 'api',    section: 'AI',               component: WebSearchNode, description: 'DuckDuckGo Search' },
  { type: 'math',         label: 'Math',   icon: Sigma,      category: 'math',   section: 'Logic',            component: MathNode,   description: 'Arithmetic on inputs' },
  { type: 'filter',       label: 'Filter', icon: Filter,     category: 'filter', section: 'Logic',            component: FilterNode, description: 'Conditional pass-through' },
  { type: 'api',          label: 'API',    icon: Globe,      category: 'api',    section: 'Utilities',        component: ApiNode,    description: 'HTTP request' },
  { type: 'note',         label: 'Note',   icon: StickyNote, category: 'note',   section: 'Utilities',        component: NoteNode,   description: 'Sticky comment' },
  { type: 'timer',        label: 'Timer',  icon: Timer,      category: 'timer',  section: 'Utilities',        component: TimerNode,  description: 'Delay the flow' },
];

// type -> React Flow component map.
export const nodeTypes = NODE_CATALOG.reduce((acc, n) => {
  acc[n.type] = n.component;
  return acc;
}, {});

// Ordered list of sections for the sidebar.
export const NODE_SECTIONS = NODE_CATALOG.reduce((acc, n) => {
  if (!acc.includes(n.section)) acc.push(n.section);
  return acc;
}, []);
