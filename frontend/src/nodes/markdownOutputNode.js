import { FileText } from 'lucide-react';
import { BaseNode } from './BaseNode';
import ReactMarkdown from 'react-markdown';
import { useStore } from '../store';
import { shallow } from 'zustand/shallow';

const selector = (id) => (s) => s.nodes.find(n => n.id === id)?.data?.execution_result;

export const MarkdownOutputNode = ({ id }) => {
  const result = useStore(selector(id), shallow);

  return (
    <BaseNode
      id={id}
      title="Markdown Output"
      subtitle="Renderer"
      icon={FileText}
      category="output"
      style={{ width: 340 }}
      handles={[
        { type: 'target', position: 'left', id: `${id}-input`, label: 'input' },
      ]}
    >
      {!result ? (
        <div className="text-xs text-slate-400 italic py-2 text-center border border-dashed border-slate-700 rounded bg-ink/30">
          Waiting for execution...
        </div>
      ) : (
        <div className="text-xs text-slate-300 prose prose-invert prose-sm max-h-[300px] overflow-y-auto custom-scrollbar pr-2 leading-relaxed">
          <ReactMarkdown>{result}</ReactMarkdown>
        </div>
      )}
    </BaseNode>
  );
};
