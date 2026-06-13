// timerNode.js — demo node: delays the flow by a configurable amount.

import { Timer } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { LabeledInput, LabeledSelect } from './fields';
import { useNodeField } from './fields/useNodeField';

export const TimerNode = ({ id }) => {
  const [delay, setDelay] = useNodeField(id, 'delay', '5');
  const [unit, setUnit] = useNodeField(id, 'unit', 'seconds');

  return (
    <BaseNode
      id={id}
      title="Timer"
      subtitle={id}
      icon={Timer}
      category="timer"
      handles={[
        { type: 'target', position: 'left', id: `${id}-in`, label: 'in' },
        { type: 'source', position: 'right', id: `${id}-out`, label: 'out' },
      ]}
    >
      <LabeledInput label="Delay" type="number" value={delay} onChange={setDelay} />
      <LabeledSelect
        label="Unit"
        value={unit}
        onChange={setUnit}
        options={['seconds', 'minutes', 'hours']}
      />
    </BaseNode>
  );
};
