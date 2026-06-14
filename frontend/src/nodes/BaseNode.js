import { Handle, Position, NodeToolbar } from 'reactflow';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useStore } from '../store';
import { Spinner } from '../components/ui/Spinner';
import { Trash2 } from 'lucide-react';

export const CATEGORY_ACCENTS = {
  agent: '#c084fc',
  tool: '#5eead4',
  input: '#34d399',
  output: '#f472b6',
  llm: '#a78bfa',
  text: '#22d3ee',
  math: '#fbbf24',
  api: '#38bdf8',
  filter: '#fb923c',
  note: '#facc15',
  timer: '#f87171',
  default: '#22d3ee',
};

const POSITION_MAP = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

const distribute = (count, index) => `${(100 * (index + 1)) / (count + 1)}%`;

export const BaseNode = ({
  id,
  title,
  icon: Icon,
  category = 'default',
  subtitle,
  handles = [],
  style = {},
  children,
}) => {
  const accent = CATEGORY_ACCENTS[category] || CATEGORY_ACCENTS.default;
  const activeNodeId = useStore((s) => s.activeNodeId);
  const removeNode = useStore((s) => s.removeNode);
  const isActive = activeNodeId === id;

  const sideCounts = handles.reduce((acc, h) => {
    acc[h.position] = (acc[h.position] || 0) + 1;
    return acc;
  }, {});
  const sideIndex = {};

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="vs-node relative min-w-[212px]"
      style={{ '--accent': accent, ...style }}
    >
      <NodeToolbar isVisible={undefined} position={Position.Top} className="flex gap-2">
        <button
          onClick={() => removeNode(id)}
          className="p-1.5 rounded-full bg-surface border border-line text-muted hover:text-red-400 hover:border-red-400/50 hover:bg-red-400/10 transition-colors shadow-node"
          title="Delete Node"
        >
          <Trash2 size={14} />
        </button>
      </NodeToolbar>

      <Card className={`overflow-hidden border border-line shadow-node transition-all duration-300 group ${isActive ? 'ring-2 ring-offset-2 ring-offset-ink' : ''}`} style={isActive ? { '--tw-ring-color': accent } : {}}>
        <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: accent }} />
        <CardHeader 
          className="flex-row items-center gap-2.5 p-3 space-y-0 relative"
          style={{ background: isActive ? `${accent}25` : `linear-gradient(180deg, ${accent}16, transparent)`, transition: 'background 0.3s ease' }}
        >
          {isActive ? (
            <span className="grid place-items-center w-6 h-6 shrink-0 rounded" style={{ color: accent }}>
              <Spinner size="sm" />
            </span>
          ) : Icon ? (
            <span
              className="grid place-items-center w-6 h-6 shrink-0 rounded border"
              style={{ color: accent, borderColor: `${accent}40`, background: `${accent}14` }}
            >
              <Icon size={14} strokeWidth={2} />
            </span>
          ) : null}
          <div className="min-w-0">
            <CardTitle
              className="font-mono text-xs uppercase tracking-wider"
              style={{ color: accent }}
            >
              {title}
            </CardTitle>
            {subtitle && (
              <div className="font-mono text-[10px] text-slate-400 leading-tight truncate mt-0.5">
                {subtitle}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-3 bg-ink/50 backdrop-blur-sm flex flex-col gap-3">
          {children}
        </CardContent>
      </Card>

      {handles.map((h) => {
        const total = sideCounts[h.position];
        const idx = sideIndex[h.position] || 0;
        sideIndex[h.position] = idx + 1;

        const autoStyle = {};
        if (total > 1 && !h.style) {
          if (h.position === 'left' || h.position === 'right') {
            autoStyle.top = distribute(total, idx);
          } else {
            autoStyle.left = distribute(total, idx);
          }
        }
        const handleStyle = { 
          backgroundColor: '#0c121c', 
          borderColor: accent,
          borderWidth: '2px',
          ...autoStyle, 
          ...h.style 
        };
        const topVal = handleStyle.top || '50%';
        const isLeft = h.position === 'left';
        const isRight = h.position === 'right';

        return (
          <div key={h.id}>
            <Handle 
              type={h.type} 
              position={POSITION_MAP[h.position] || Position.Left} 
              id={h.id} 
              style={handleStyle}
              className="!w-3 !h-3 hover:scale-125 transition-transform" 
            />
            {h.label && (isLeft || isRight) && (
              <span
                className="pointer-events-none absolute font-mono text-[10px] text-slate-400 whitespace-nowrap bg-ink/80 px-1 py-0.5 rounded backdrop-blur-sm"
                style={{
                  top: topVal,
                  transform: 'translateY(-50%)',
                  ...(isLeft ? { right: '100%', marginRight: 12 } : { left: '100%', marginLeft: 12 }),
                }}
              >
                {h.label}
              </span>
            )}
          </div>
        );
      })}
    </motion.div>
  );
};
