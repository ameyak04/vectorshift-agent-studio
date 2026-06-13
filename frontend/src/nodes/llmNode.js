// llmNode.js

import { Bot } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { NodeText } from './fields';

export const LLMNode = ({ id, data }) => {
  return (
    <BaseNode
      id={id}
      title="LLM"
      subtitle={id}
      icon={Bot}
      category="llm"
      handles={[
        { type: 'target', position: 'left', id: `${id}-system`, label: 'system', style: { top: `${100 / 3}%` } },
        { type: 'target', position: 'left', id: `${id}-prompt`, label: 'prompt', style: { top: `${200 / 3}%` } },
        { type: 'source', position: 'right', id: `${id}-response`, label: 'response' },
      ]}
    >
      <NodeText>Calls a language model with a system + prompt input.</NodeText>
    </BaseNode>
  );
};
