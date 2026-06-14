import { Wrench } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { LabeledInput, LabeledSelect } from './fields';
import { useNodeField } from './fields/useNodeField';

export const ToolNode = ({ id, data }) => {
  const [name, setName] = useNodeField(id, 'toolName', 'my_tool');
  const [kind, setKind] = useNodeField(id, 'toolKind', 'web_search');
  const [description, setDescription] = useNodeField(id, 'toolDesc', 'Searches the web for information.');

  return (
    <BaseNode
      id={id}
      title="Tool"
      subtitle={name}
      icon={Wrench}
      category="tool"
      handles={[
        { type: 'source', position: 'right', id: `${id}-handle`, label: 'tool' }
      ]}
    >
      <LabeledInput label="Name" value={name} onChange={setName} />
      <LabeledSelect 
        label="Kind" 
        value={kind} 
        onChange={setKind} 
        options={['web_search', 'calculator', 'http_get']} 
      />
      <div className="flex flex-col gap-1 mt-1">
        <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Description</label>
        <textarea
          className="nodrag custom-scrollbar w-full h-16 px-2 py-1 bg-surface border border-line rounded text-[10px] text-paper focus:outline-none focus:border-cyan/50 resize-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this tool does..."
        />
      </div>
    </BaseNode>
  );
};
