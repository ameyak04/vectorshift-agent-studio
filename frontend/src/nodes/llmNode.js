// llmNode.js

import { BaseNode } from './BaseNode';
import { NodeText } from './fields';

export const LLMNode = ({ id, data }) => {
  return (
    <BaseNode
      id={id}
      title="LLM"
      icon="🤖"
      category="llm"
      handles={[
        { type: 'target', position: 'left', id: `${id}-system`, style: { top: `${100 / 3}%` } },
        { type: 'target', position: 'left', id: `${id}-prompt`, style: { top: `${200 / 3}%` } },
        { type: 'source', position: 'right', id: `${id}-response` },
      ]}
    >
      <NodeText>This is a LLM.</NodeText>
    </BaseNode>
  );
};
