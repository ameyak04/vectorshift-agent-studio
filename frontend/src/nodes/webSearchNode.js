import { Globe } from 'lucide-react';
import { BaseNode } from './BaseNode';
import { LabeledInput } from './fields';
import { useNodeField } from './fields/useNodeField';

export const WebSearchNode = ({ id }) => {
  const [topic, setTopic] = useNodeField(id, 'topic', '');

  return (
    <BaseNode
      id={id}
      title="Web Search"
      subtitle="DuckDuckGo Engine"
      icon={Globe}
      category="api"
      handles={[
        { type: 'target', position: 'left', id: `${id}-query`, label: 'query' },
        { type: 'source', position: 'right', id: `${id}-results`, label: 'results' },
      ]}
    >
      <div className="text-[10px] text-faint mb-1">
        Searches the web for the incoming query and returns the top 3 extracted contexts.
      </div>
      <LabeledInput label="Fallback Query" value={topic} onChange={setTopic} placeholder="e.g. Latest AI news" />
    </BaseNode>
  );
};
