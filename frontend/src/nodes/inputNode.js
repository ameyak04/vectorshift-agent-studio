// inputNode.js

import { BaseNode } from './BaseNode';
import { LabeledInput, LabeledSelect } from './fields';
import { useNodeField } from './fields/useNodeField';

export const InputNode = ({ id, data }) => {
  const [name, setName] = useNodeField(id, 'inputName', id.replace('customInput-', 'input_'));
  const [type, setType] = useNodeField(id, 'inputType', 'Text');

  return (
    <BaseNode
      id={id}
      title="Input"
      icon="📥"
      category="input"
      handles={[{ type: 'source', position: 'right', id: `${id}-value` }]}
    >
      <LabeledInput label="Name" value={name} onChange={setName} />
      <LabeledSelect label="Type" value={type} onChange={setType} options={['Text', 'File']} />
    </BaseNode>
  );
};
