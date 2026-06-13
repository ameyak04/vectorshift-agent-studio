// BaseNode.js
// ------------------------------------------------------------------
// Config-driven node shell — the blueprint "component cell" every
// concrete node builds on. It owns shared chrome (hairline card,
// mono category header, accent terminal chip) and renders React Flow
// Handles with optional mono labels. A concrete node only declares
// what differs: title, icon, category, handles, and body fields.
// ------------------------------------------------------------------

import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';

// Per-category accent colors (the "signal" color of each node).
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

/**
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.title
 * @param {React.ComponentType} [props.icon] - a lucide-react icon component
 * @param {string} [props.category]
 * @param {string} [props.subtitle]
 * @param {Array}  [props.handles] - [{ type, position, id, label, style }]
 * @param {React.CSSProperties} [props.style]
 * @param {React.ReactNode} props.children
 */
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
      className="vs-node relative bg-panel border border-line shadow-node text-paper min-w-[212px]
                 transition-shadow duration-200 hover:shadow-nodeHover"
      style={{ '--accent': accent, borderRadius: 5, ...style }}
    >
      {/* Accent index strip down the left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: accent }} />

      {/* Header */}
      <div
        className="flex items-center gap-2.5 pl-3 pr-3 pt-2.5 pb-2 border-b border-line"
        style={{ background: `linear-gradient(180deg, ${accent}16, transparent)` }}
      >
        {Icon && (
          <span
            className="grid place-items-center w-6 h-6 shrink-0 border"
            style={{ color: accent, borderColor: `${accent}55`, background: `${accent}14` }}
          >
            <Icon size={13} strokeWidth={2.25} />
          </span>
        )}
        <div className="min-w-0">
          <div
            className="font-mono text-2xs font-semibold uppercase tracking-[0.16em] leading-tight"
            style={{ color: accent }}
          >
            {title}
          </div>
          {subtitle && (
            <div className="font-mono text-2xs text-faint leading-tight truncate">{subtitle}</div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-3 flex flex-col gap-2.5">{children}</div>

      {/* Handles + mono labels */}
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
            <Handle type={h.type} position={POSITION_MAP[h.position] || Position.Left} id={h.id} style={handleStyle} />
            {h.label && (isLeft || isRight) && (
              <span
                className="pointer-events-none absolute font-mono text-2xs text-faint whitespace-nowrap"
                style={{
                  top: topVal,
                  transform: 'translateY(-50%)',
                  ...(isLeft ? { right: '100%', marginRight: 9 } : { left: '100%', marginLeft: 9 }),
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
