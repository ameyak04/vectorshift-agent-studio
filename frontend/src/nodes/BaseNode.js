import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export const CATEGORY_ACCENTS = {
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
      <Card className="overflow-hidden border border-line shadow-node transition-shadow duration-200 hover:shadow-nodeHover group">
        <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: accent }} />
        <CardHeader 
          className="flex-row items-center gap-2.5 p-3 space-y-0"
          style={{ background: `linear-gradient(180deg, ${accent}16, transparent)` }}
        >
          {Icon && (
            <span
              className="grid place-items-center w-6 h-6 shrink-0 rounded border"
              style={{ color: accent, borderColor: `${accent}40`, background: `${accent}14` }}
            >
              <Icon size={14} strokeWidth={2} />
            </span>
          )}
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
        const handleStyle = { ...autoStyle, ...h.style };
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
