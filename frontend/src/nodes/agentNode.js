import { BrainCircuit } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { LabeledSelect, LabeledInput, LabeledTextarea, LabeledSlider } from './fields';
import { useNodeField } from './fields/useNodeField';
import { MODEL_OPTIONS, DEFAULT_MODEL } from '../lib/models';

export const AgentNode = ({ id, data }) => {
  const [model, setModel] = useNodeField(id, 'model', DEFAULT_MODEL);
  const [instructions, setInstructions] = useNodeField(id, 'instructions', '');
  const [temperature, setTemperature] = useNodeField(id, 'temperature', '0.7');
  const [maxSteps, setMaxSteps] = useNodeField(id, 'maxSteps', '6');

  return (
    <BaseNode
      id={id}
      title="Agent"
      subtitle={id}
      icon={BrainCircuit}
      category="agent"
      handles={[
        { type: 'target', position: 'left', id: `${id}-prompt`, label: 'prompt', style: { top: '30%' } },
        { type: 'target', position: 'left', id: `${id}-tools`, label: 'tools', style: { top: '70%' } },
        { type: 'source', position: 'right', id: `${id}-response`, label: 'response' }
      ]}
    >
      <LabeledSelect label="Model" value={model} onChange={setModel} options={MODEL_OPTIONS} />
      <LabeledTextarea
        label="Instructions"
        value={instructions}
        onChange={setInstructions}
        rows={2}
        placeholder="System prompt — how the agent should behave…"
      />
      <LabeledSlider label="Temperature" value={temperature} onChange={setTemperature} min={0} max={1} step={0.1} format={(v) => Number(v).toFixed(1)} />
      <LabeledInput label="Max steps" type="number" value={maxSteps} onChange={setMaxSteps} placeholder="6" />
      <div className="flex items-center gap-1.5 text-[10px] text-faint font-mono pt-0.5">
        <span className="w-1.5 h-1.5 rounded-[1px] border border-[#5eead4]" />
        wire tools → 'tools' handle
      </div>
    </BaseNode>
  );
};
