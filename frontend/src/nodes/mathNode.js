// mathNode.js — demo node: combines two inputs with an arithmetic op.

import { BaseNode } from './BaseNode';
import { LabeledSelect } from './fields';
import { useNodeField } from './fields/useNodeField';

export const MathNode = ({ id }) => {
  const [op, setOp] = useNodeField(id, 'operation', 'add');

  return (
    <BaseNode
      id={id}
      title="Math"
      icon="➗"
      category="math"
      handles={[
        { type: 'target', position: 'left', id: `${id}-a` },
        { type: 'target', position: 'left', id: `${id}-b` },
        { type: 'source', position: 'right', id: `${id}-result` },
      ]}
    >
      <LabeledSelect
        label="Operation"
        value={op}
        onChange={setOp}
        options={[
          { value: 'add', label: 'Add (+)' },
          { value: 'subtract', label: 'Subtract (−)' },
          { value: 'multiply', label: 'Multiply (×)' },
          { value: 'divide', label: 'Divide (÷)' },
        ]}
      />
    </BaseNode>
  );
};
