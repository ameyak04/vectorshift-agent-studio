export const sampleNodes = [
  // Agent Pipeline
  { id: 'customInput-1', type: 'customInput', position: { x: 50, y: 150 },
    data: { id: 'customInput-1', nodeType: 'customInput', inputName: 'goal', inputType: 'Text', inputValue: 'Find the current population of the world and multiply it by 10.' } },
    
  { id: 'tool-1', type: 'tool', position: { x: 50, y: 350 },
    data: { id: 'tool-1', nodeType: 'tool', toolName: 'search_web', toolKind: 'web_search', toolDesc: 'Search the internet for facts.' } },
    
  { id: 'tool-2', type: 'tool', position: { x: 50, y: 580 },
    data: { id: 'tool-2', nodeType: 'tool', toolName: 'calculator', toolKind: 'calculator', toolDesc: 'Calculate mathematical expressions.' } },

  { id: 'agent-1', type: 'agent', position: { x: 450, y: 200 },
    data: { id: 'agent-1', nodeType: 'agent' } },

  { id: 'markdownOutput-1', type: 'markdownOutput', position: { x: 800, y: 200 },
    data: { id: 'markdownOutput-1', nodeType: 'markdownOutput' } },

  // Note
  { id: 'note-1', type: 'note', position: { x: 800, y: 50 },
    data: { id: 'note-1', nodeType: 'note', note: 'Agent builder demo! Click "Run" to watch the agent loop through these tools dynamically.' } },
];

const edge = (id, source, sourceHandle, target, targetHandle) => ({
  id, source, sourceHandle, target, targetHandle, type: 'smoothstep', animated: true,
});

export const sampleEdges = [
  edge('e-prompt', 'customInput-1', 'customInput-1-value', 'agent-1', 'agent-1-prompt'),
  edge('e-tool1', 'tool-1', 'tool-1-handle', 'agent-1', 'agent-1-tools'),
  edge('e-tool2', 'tool-2', 'tool-2-handle', 'agent-1', 'agent-1-tools'),
  edge('e-out', 'agent-1', 'agent-1-response', 'markdownOutput-1', 'markdownOutput-1-input'),
];

export const sampleNodeIDs = {
  customInput: 1,
  customOutput: 0,
  markdownOutput: 1,
  text: 0,
  llm: 0,
  math: 0,
  api: 0,
  filter: 0,
  timer: 0,
  note: 1,
  agent: 1,
  tool: 2
};

export const sampleEvals = [
  {
    id: "case-1",
    name: "World Population Math",
    inputs: { "customInput-1": "Find the current population of the world and multiply it by 10." },
    assertion: { type: "regex", target_node: "agent-1", expected: "([0-9]+)" }
  },
  {
    id: "case-2",
    name: "Simple Greeting",
    inputs: { "customInput-1": "Just say hello!" },
    assertion: { type: "contains", target_node: "agent-1", expected: "hello" }
  }
];
