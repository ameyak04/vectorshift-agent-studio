// fields/index.js
// ------------------------------------------------------------------
// Reusable, consistently-styled form controls for node bodies.
// Centralizing them means a styling change applies across every node
// at once, and concrete nodes stay declarative.
// ------------------------------------------------------------------

const labelClass =
  'flex flex-col gap-1 font-mono text-2xs font-medium uppercase tracking-[0.14em] text-faint';
const controlClass =
  'nodrag rounded-[3px] bg-ink/60 border border-line px-2.5 py-1.5 text-sm font-sans font-normal normal-case tracking-normal text-paper ' +
  'outline-none transition-colors focus:border-cyan/60 focus:ring-1 focus:ring-cyan/30 ' +
  'placeholder:text-faint/70 hover:border-linebright';

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
  <p className="text-sm text-muted leading-relaxed">{children}</p>
);
