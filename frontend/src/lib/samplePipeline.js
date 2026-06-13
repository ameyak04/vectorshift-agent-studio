// samplePipeline.js
// ------------------------------------------------------------------
// A starter pipeline loaded on first open. It deliberately exercises
// every feature so the app demonstrates itself:
//   - all 9 node types (input, output, llm, text, math, api, filter,
//     timer, note)
//   - the Text node's dynamic {{variable}} handles (3 variables)
//   - multi-input handle nodes (LLM: system+prompt, Math: a+b)
//   - a standalone node with no handles (Note)
//   - a valid DAG, so "Run" reports is_dag: true
// ------------------------------------------------------------------

export const sampleNodes = [
  // Inputs (column 0)
  { id: 'customInput-1', type: 'customInput', position: { x: 40, y: 40 },
    data: { id: 'customInput-1', nodeType: 'customInput', inputName: 'name', inputType: 'Text' } },
  { id: 'customInput-2', type: 'customInput', position: { x: 40, y: 230 },
    data: { id: 'customInput-2', nodeType: 'customInput', inputName: 'age', inputType: 'Text' } },
  { id: 'customInput-3', type: 'customInput', position: { x: 40, y: 420 },
    data: { id: 'customInput-3', nodeType: 'customInput', inputName: 'topic', inputType: 'Text' } },
  { id: 'api-1', type: 'api', position: { x: 40, y: 600 },
    data: { id: 'api-1', nodeType: 'api', method: 'GET', url: 'https://api.vectorshift.ai/context' } },

  // Transform (column 1)
  { id: 'text-1', type: 'text', position: { x: 380, y: 60 },
    data: { id: 'text-1', nodeType: 'text', text: 'Hi {{name}}, you are {{age}}. Topic: {{topic}}' } },
  { id: 'math-1', type: 'math', position: { x: 380, y: 380 },
    data: { id: 'math-1', nodeType: 'math', operation: 'add' } },
  { id: 'timer-1', type: 'timer', position: { x: 380, y: 600 },
    data: { id: 'timer-1', nodeType: 'timer', delay: '5', unit: 'seconds' } },

  // Logic / model (column 2)
  { id: 'llm-1', type: 'llm', position: { x: 800, y: 80 },
    data: { id: 'llm-1', nodeType: 'llm' } },
  { id: 'filter-1', type: 'filter', position: { x: 800, y: 400 },
    data: { id: 'filter-1', nodeType: 'filter', condition: 'result > 0' } },
  { id: 'note-1', type: 'note', position: { x: 800, y: 600 },
    data: { id: 'note-1', nodeType: 'note', note: 'Sample pipeline — every node type, wired into a DAG.' } },

  // Outputs (column 3)
  { id: 'customOutput-1', type: 'customOutput', position: { x: 1180, y: 110 },
    data: { id: 'customOutput-1', nodeType: 'customOutput', outputName: 'completion', outputType: 'Text' } },
  { id: 'customOutput-2', type: 'customOutput', position: { x: 1180, y: 420 },
    data: { id: 'customOutput-2', nodeType: 'customOutput', outputName: 'score', outputType: 'Text' } },
];

const edge = (id, source, sourceHandle, target, targetHandle) => ({
  id, source, sourceHandle, target, targetHandle, type: 'smoothstep', animated: true,
});

export const sampleEdges = [
  // inputs -> text variables
  edge('e-name', 'customInput-1', 'customInput-1-value', 'text-1', 'text-1-var-name'),
  edge('e-age', 'customInput-2', 'customInput-2-value', 'text-1', 'text-1-var-age'),
  edge('e-topic', 'customInput-3', 'customInput-3-value', 'text-1', 'text-1-var-topic'),
  // text + api -> llm (prompt + system)
  edge('e-prompt', 'text-1', 'text-1-output', 'llm-1', 'llm-1-prompt'),
  edge('e-system', 'api-1', 'api-1-response', 'llm-1', 'llm-1-system'),
  // llm -> output
  edge('e-completion', 'llm-1', 'llm-1-response', 'customOutput-1', 'customOutput-1-value'),
  // numeric branch: inputs -> math -> filter -> timer -> output
  edge('e-math-a', 'customInput-1', 'customInput-1-value', 'math-1', 'math-1-a'),
  edge('e-math-b', 'customInput-2', 'customInput-2-value', 'math-1', 'math-1-b'),
  edge('e-filter', 'math-1', 'math-1-result', 'filter-1', 'filter-1-in'),
  edge('e-timer', 'filter-1', 'filter-1-out', 'timer-1', 'timer-1-in'),
  edge('e-score', 'timer-1', 'timer-1-out', 'customOutput-2', 'customOutput-2-value'),
];

// Seed the per-type ID counters so newly dragged nodes don't collide
// with the sample's IDs (e.g. the next Input becomes customInput-4).
export const sampleNodeIDs = {
  customInput: 3,
  customOutput: 2,
  text: 1,
  llm: 1,
  math: 1,
  api: 1,
  filter: 1,
  timer: 1,
  note: 1,
};
