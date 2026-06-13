// textNode.js
// ------------------------------------------------------------------
// Text node with two enhancements (Part 3):
//   1. The textarea (and therefore the node) grows in width & height
//      as the user types, improving visibility of the content.
//   2. Any `{{ variableName }}` written in the text that is a valid JS
//      identifier becomes a target Handle on the left side of the node,
//      updating live as the user edits.
// ------------------------------------------------------------------

import { useLayoutEffect, useMemo, useRef } from 'react';
import { useUpdateNodeInternals } from 'reactflow';
import { FileText } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { LabeledTextarea } from './fields';
import { useNodeField } from './fields/useNodeField';

// Matches {{ name }} where name is a valid JS identifier.
const VARIABLE_REGEX = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;

// A small set of reserved words we don't treat as variables.
const RESERVED = new Set([
  'true', 'false', 'null', 'undefined', 'this', 'new', 'function',
  'return', 'var', 'let', 'const', 'if', 'else', 'for', 'while',
]);

// Width sizing bounds (px).
const MIN_WIDTH = 220;
const MAX_WIDTH = 480;
const MIN_HEIGHT = 60;
const MAX_HEIGHT = 360;

const extractVariables = (text) => {
  const found = new Set();
  let match;
  VARIABLE_REGEX.lastIndex = 0;
  while ((match = VARIABLE_REGEX.exec(text)) !== null) {
    const name = match[1];
    if (!RESERVED.has(name)) found.add(name);
  }
  return [...found];
};

export const TextNode = ({ id, data }) => {
  const [text, setText] = useNodeField(id, 'text', data?.text || '{{input}}');
  const textareaRef = useRef(null);
  const updateNodeInternals = useUpdateNodeInternals();

  const variables = useMemo(() => extractVariables(text), [text]);

  // Auto-size the textarea height to its content.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(Math.max(el.scrollHeight, MIN_HEIGHT), MAX_HEIGHT)}px`;
  }, [text]);

  // React Flow caches handle positions; tell it to recompute whenever
  // the set of variable handles changes so edges anchor correctly.
  useLayoutEffect(() => {
    updateNodeInternals(id);
  }, [id, variables.length, updateNodeInternals]);

  // Width grows with the longest line of text.
  const width = useMemo(() => {
    const longest = text.split('\n').reduce((max, line) => Math.max(max, line.length), 0);
    return Math.min(Math.max(MIN_WIDTH, longest * 8 + 48), MAX_WIDTH);
  }, [text]);

  const handles = [
    ...variables.map((name) => ({
      type: 'target',
      position: 'left',
      id: `${id}-var-${name}`,
      label: name,
    })),
    { type: 'source', position: 'right', id: `${id}-output`, label: 'output' },
  ];

  return (
    <BaseNode
      id={id}
      title="Text"
      subtitle={id}
      icon={FileText}
      category="text"
      handles={handles}
      style={{ width }}
    >
      <LabeledTextarea
        label="Text"
        value={text}
        onChange={setText}
        textareaRef={textareaRef}
        placeholder="Type text. Use {{ variable }} to add inputs."
      />
      {variables.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 pt-0.5">
          <span className="text-2xs text-faint mr-0.5">inputs</span>
          {variables.map((name) => (
            <span
              key={name}
              className="text-2xs px-1.5 py-0.5 rounded-md bg-node-text/15 text-node-text font-mono font-medium"
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </BaseNode>
  );
};
