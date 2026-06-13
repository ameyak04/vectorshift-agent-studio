// draggableNode.js

import { CATEGORY_ACCENTS } from './nodes/BaseNode';

export const DraggableNode = ({ type, label, icon, category = 'default' }) => {
    const accent = CATEGORY_ACCENTS[category] || CATEGORY_ACCENTS.default;

    const onDragStart = (event, nodeType) => {
      const appData = { nodeType }
      event.target.style.cursor = 'grabbing';
      event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
      event.dataTransfer.effectAllowed = 'move';
    };

    return (
      <div
        className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-panel border border-border
                   cursor-grab select-none transition-all hover:bg-panelHover hover:-translate-y-0.5
                   hover:border-transparent"
        style={{ '--accent': accent }}
        onDragStart={(event) => onDragStart(event, type)}
        onDragEnd={(event) => (event.target.style.cursor = 'grab')}
        draggable
      >
        <span
          className="flex items-center justify-center w-6 h-6 rounded-md text-sm"
          style={{ background: `${accent}26`, color: accent }}
        >
          {icon}
        </span>
        <span className="text-sm font-medium text-slate-200">{label}</span>
      </div>
    );
  };
