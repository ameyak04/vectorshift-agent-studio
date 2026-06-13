// toolbar.js

import { DraggableNode } from './draggableNode';

const NODES = [
    { type: 'customInput', label: 'Input', icon: '📥', category: 'input' },
    { type: 'llm', label: 'LLM', icon: '🤖', category: 'llm' },
    { type: 'customOutput', label: 'Output', icon: '📤', category: 'output' },
    { type: 'text', label: 'Text', icon: '📝', category: 'text' },
    { type: 'math', label: 'Math', icon: '➗', category: 'math' },
    { type: 'api', label: 'API', icon: '🌐', category: 'api' },
    { type: 'filter', label: 'Filter', icon: '🔍', category: 'filter' },
    { type: 'note', label: 'Note', icon: '🗒️', category: 'note' },
    { type: 'timer', label: 'Timer', icon: '⏱️', category: 'timer' },
];

export const PipelineToolbar = () => {
    return (
        <div className="px-5 py-3 bg-surface border-b border-border">
            <p className="text-xs uppercase tracking-wider text-muted mb-2">Drag nodes onto the canvas</p>
            <div className="flex flex-wrap gap-2">
                {NODES.map((n) => (
                    <DraggableNode key={n.type} {...n} />
                ))}
            </div>
        </div>
    );
};
