// outputNode.js

import { BaseNode } from './BaseNode';
import { LabeledInput, LabeledSelect } from './fields';
import { useNodeField } from './fields/useNodeField';

export const OutputNode = ({ id, data }) => {
  const [name, setName] = useNodeField(id, 'outputName', id.replace('customOutput-', 'output_'));
  const [type, setType] = useNodeField(id, 'outputType', 'Text');

  return (
    <BaseNode
      id={id}
      title="Output"
      icon="📤"
      category="output"
      handles={[{ type: 'target', position: 'left', id: `${id}-value` }]}
    >
      <LabeledInput label="Name" value={name} onChange={setName} />
      <LabeledSelect
        label="Type"
        value={type}
        onChange={setType}
        options={[
          { value: 'Text', label: 'Text' },
          { value: 'Image', label: 'Image' },
        ]}
      />
    </BaseNode>
  );
};
