import { useState } from 'react';
import { Inbox, UploadCloud } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { LabeledInput, LabeledSelect } from './fields';
import { useNodeField } from './fields/useNodeField';
import { api } from '../services/api';
import { toast } from 'sonner';

export const InputNode = ({ id, data }) => {
  const [name, setName] = useNodeField(id, 'inputName', id.replace('customInput-', 'input_'));
  const [type, setType] = useNodeField(id, 'inputType', 'Text');
  const [value, setValue] = useNodeField(id, 'inputValue', '');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const toastId = toast.loading(`Extracting text from ${file.name}...`);
    try {
      const res = await api.extractFileText(file);
      setValue(res.text);
      toast.success('File text extracted!', { id: toastId });
    } catch (err) {
      toast.error('Failed to extract text', { id: toastId, description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseNode
      id={id}
      title="Input"
      subtitle={name}
      icon={Inbox}
      category="input"
      handles={[{ type: 'source', position: 'right', id: `${id}-value`, label: 'value' }]}
    >
      <LabeledInput label="Name" value={name} onChange={setName} />
      <LabeledSelect label="Type" value={type} onChange={setType} options={['Text', 'File']} />
      
      {type === 'Text' ? (
        <div className="flex flex-col gap-1 mt-1">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Value</label>
          <textarea
            className="nodrag custom-scrollbar w-full h-20 px-2 py-1.5 bg-surface border border-line rounded text-xs text-paper focus:outline-none focus:border-cyan/50 resize-y"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type your input here..."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1 mt-1">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Upload File (.txt, .pdf)</label>
          <div className="relative border-2 border-dashed border-line rounded bg-surface hover:border-cyan/50 transition-colors">
            <input
              type="file"
              accept=".txt,.pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer nodrag"
              disabled={loading}
            />
            <div className="flex items-center justify-center gap-2 p-3 text-xs text-slate-400">
              <UploadCloud size={14} />
              <span>{loading ? 'Extracting...' : (value ? 'File loaded (click to replace)' : 'Click to select file')}</span>
            </div>
          </div>
          {value && !loading && (
            <div className="mt-2 p-2 bg-ink/50 border border-line rounded max-h-20 overflow-y-auto custom-scrollbar text-[10px] text-faint">
              {value.slice(0, 150)}...
            </div>
          )}
        </div>
      )}
    </BaseNode>
  );
};
