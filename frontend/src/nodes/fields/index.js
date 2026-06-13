// fields/index.js
// ------------------------------------------------------------------
// Reusable, consistently-styled form controls for node bodies.
// Centralizing them means a styling change applies across every node
// at once, and concrete nodes stay declarative.
// ------------------------------------------------------------------

const labelClass = 'flex flex-col gap-1 text-xs text-muted';
const controlClass =
  'nodrag rounded-md bg-surface border border-border px-2 py-1 text-sm text-slate-100 ' +
  'outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 placeholder:text-muted/60';

export const LabeledInput = ({ label, value, onChange, type = 'text', placeholder }) => (
  <label className={labelClass}>
    {label && <span>{label}</span>}
    <input
      type={type}
      className={controlClass}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </label>
);

export const LabeledSelect = ({ label, value, onChange, options = [] }) => (
  <label className={labelClass}>
    {label && <span>{label}</span>}
    <select className={controlClass} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const text = typeof opt === 'string' ? opt : opt.label;
        return (
          <option key={val} value={val}>
            {text}
          </option>
        );
      })}
    </select>
  </label>
);

export const LabeledTextarea = ({ label, value, onChange, placeholder, textareaRef, style, rows }) => (
  <label className={labelClass}>
    {label && <span>{label}</span>}
    <textarea
      ref={textareaRef}
      className={`${controlClass} resize-none leading-relaxed`}
      value={value}
      rows={rows}
      placeholder={placeholder}
      style={style}
      onChange={(e) => onChange(e.target.value)}
    />
  </label>
);

export const NodeText = ({ children }) => (
  <p className="text-sm text-slate-300 leading-relaxed">{children}</p>
);
