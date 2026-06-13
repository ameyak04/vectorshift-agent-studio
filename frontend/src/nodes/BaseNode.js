// BaseNode.js
// ------------------------------------------------------------------
// A single, config-driven node shell that every concrete node builds
// on. It owns all the shared concerns — the card chrome, the colored
// category header, and rendering of React Flow Handles — so a concrete
// node only has to declare *what* makes it different (title, icon,
// category, its handles, and its body fields).
//
// Adding a new node is therefore just: pick a category, list a few
// handles, and drop some field components into `children`.
// ------------------------------------------------------------------

import { Handle, Position } from 'reactflow';

// Per-category accent colors. Kept as raw hex (rather than Tailwind
// class names) so they can be applied via inline styles without
// tripping Tailwind's class purging on dynamic names.
export const CATEGORY_ACCENTS = {
  input: '#34d399',
  output: '#f472b6',
  llm: '#a78bfa',
  text: '#38bdf8',
  math: '#fbbf24',
  api: '#22d3ee',
  filter: '#fb923c',
  note: '#facc15',
  timer: '#f87171',
  default: '#6366f1',
};

// Maps a friendly position string to a React Flow Position enum.
const POSITION_MAP = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

// Evenly distributes N handles along an edge as CSS percentages,
// e.g. 1 -> [50%], 2 -> [33.3%, 66.6%], 3 -> [25%, 50%, 75%].
const distribute = (count, index) => `${(100 * (index + 1)) / (count + 1)}%`;

/**
 * @param {object}   props
 * @param {string}   props.id        - React Flow node id
 * @param {string}   props.title     - Header label
 * @param {string}   [props.icon]    - Emoji / glyph shown in the header
 * @param {string}   [props.category]- Key into CATEGORY_ACCENTS for theming
 * @param {Array}    [props.handles] - [{ type:'source'|'target', position:'left'|'right'|..., id, style }]
 * @param {React.CSSProperties} [props.style] - Extra styles merged onto the card
 * @param {React.ReactNode} props.children - The node body (fields, text, etc.)
 */
export const BaseNode = ({
  id,
  title,
  icon,
  category = 'default',
  handles = [],
  style = {},
  children,
}) => {
  const accent = CATEGORY_ACCENTS[category] || CATEGORY_ACCENTS.default;

  // Group handles by side so we can auto-distribute multiple handles
  // sharing the same side without each node hand-computing offsets.
  const sideCounts = handles.reduce((acc, h) => {
    acc[h.position] = (acc[h.position] || 0) + 1;
    return acc;
  }, {});
  const sideIndex = {};

  return (
    <div
      className="rounded-xl bg-panel border border-border shadow-node text-slate-100 min-w-[220px] transition-shadow hover:shadow-nodeHover"
      style={style}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-xl border-b border-border"
        style={{ background: `${accent}1a` }} // accent at ~10% opacity
      >
        {icon && <span className="text-base leading-none">{icon}</span>}
        <span className="text-sm font-semibold tracking-wide" style={{ color: accent }}>
          {title}
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-3 flex flex-col gap-2.5">{children}</div>

      {/* Handles */}
      {handles.map((h) => {
        const total = sideCounts[h.position];
        const idx = sideIndex[h.position] || 0;
        sideIndex[h.position] = idx + 1;

        // Distribute along the perpendicular axis when more than one
        // handle shares a side, unless the node supplied explicit style.
        const autoStyle = {};
        if (total > 1 && !h.style) {
          if (h.position === 'left' || h.position === 'right') {
            autoStyle.top = distribute(total, idx);
          } else {
            autoStyle.left = distribute(total, idx);
          }
        }

        return (
          <Handle
            key={h.id}
            type={h.type}
            position={POSITION_MAP[h.position] || Position.Left}
            id={h.id}
            style={{ ...autoStyle, ...h.style }}
          />
        );
      })}
    </div>
  );
};
