// apiNode.js — demo node: makes an outbound HTTP request.

import { BaseNode } from './BaseNode';
import { LabeledInput, LabeledSelect } from './fields';
import { useNodeField } from './fields/useNodeField';

export const ApiNode = ({ id }) => {
  const [url, setUrl] = useNodeField(id, 'url', 'https://api.example.com');
  const [method, setMethod] = useNodeField(id, 'method', 'GET');

  return (
    <BaseNode
      id={id}
      title="API Request"
      icon="🌐"
      category="api"
      handles={[
        { type: 'target', position: 'left', id: `${id}-trigger` },
        { type: 'source', position: 'right', id: `${id}-response` },
      ]}
    >
      <LabeledSelect
        label="Method"
        value={method}
        onChange={setMethod}
        options={['GET', 'POST', 'PUT', 'DELETE']}
      />
      <LabeledInput label="URL" value={url} onChange={setUrl} placeholder="https://…" />
    </BaseNode>
  );
};
