// inputNode.js

import { Inbox } from 'lucide-react';
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
      subtitle={id}
      icon={Inbox}
      category="input"
      handles={[{ type: 'source', position: 'right', id: `${id}-value`, label: 'value' }]}
    >
      <LabeledInput label="Name" value={name} onChange={setName} />
      <LabeledSelect label="Type" value={type} onChange={setType} options={['Text', 'File']} />
    </BaseNode>
  );
};
