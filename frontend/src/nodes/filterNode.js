// filterNode.js — demo node: passes through items matching a condition.

import { BaseNode } from './BaseNode';
import { LabeledInput } from './fields';
import { useNodeField } from './fields/useNodeField';

export const FilterNode = ({ id }) => {
  const [condition, setCondition] = useNodeField(id, 'condition', 'item > 0');

  return (
    <BaseNode
      id={id}
      title="Filter"
      icon="🔍"
      category="filter"
      handles={[
        { type: 'target', position: 'left', id: `${id}-in` },
        { type: 'source', position: 'right', id: `${id}-out` },
      ]}
    >
      <LabeledInput label="Condition" value={condition} onChange={setCondition} placeholder="item > 0" />
    </BaseNode>
  );
};
