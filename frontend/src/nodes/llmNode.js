// llmNode.js

import { Bot } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { LabeledSelect, LabeledInput, LabeledSlider } from './fields';
import { useNodeField } from './fields/useNodeField';
import { MODEL_OPTIONS, DEFAULT_MODEL } from '../lib/models';

export const LLMNode = ({ id, data }) => {
  const [model, setModel] = useNodeField(id, 'model', DEFAULT_MODEL);
  const [temperature, setTemperature] = useNodeField(id, 'temperature', '0.7');
  const [system, setSystem] = useNodeField(id, 'system', '');

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
      <LabeledSelect label="Model" value={model} onChange={setModel} options={MODEL_OPTIONS} />
      <LabeledSlider label="Temperature" value={temperature} onChange={setTemperature} min={0} max={1} step={0.1} format={(v) => Number(v).toFixed(1)} />
      <LabeledInput label="System (override)" value={system} onChange={setSystem} placeholder="Optional — overrides wired input" />
    </BaseNode>
  );
};
