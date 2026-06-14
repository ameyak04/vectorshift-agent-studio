import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { cn } from '../../lib/utils';

// Blueprint field label — mono, uppercase, hairline tracking. A right slot lets
// instrument-style fields (e.g. the temperature slider) show a live readout.
export const FieldLabel = ({ children, right }) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-faint">{children}</span>
    {right}
  </div>
);

export const LabeledInput = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div className="w-full space-y-1">
    {label && <FieldLabel>{label}</FieldLabel>}
    <Input
      className="nodrag rounded-[3px]"
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export const LabeledSelect = ({ label, value, onChange, options = [] }) => {
  const formattedOptions = options.map((opt) => ({
    label: typeof opt === 'string' ? opt : opt.label,
    value: typeof opt === 'string' ? opt : opt.value,
  }));

  return (
    <div className="w-full space-y-1">
      {label && <FieldLabel>{label}</FieldLabel>}
      <Select
        className="nodrag rounded-[3px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={formattedOptions}
      />
    </div>
  );
};

export const LabeledTextarea = ({ label, value, onChange, placeholder, textareaRef, style, rows }) => {
  const id = `textarea-${label}`;
  return (
    <div className="w-full space-y-1">
      {label && <FieldLabel>{label}</FieldLabel>}
      <textarea
        id={id}
        ref={textareaRef}
        className={cn(
          "nodrag custom-scrollbar flex w-full rounded-[3px] border border-line bg-[#0c121c] px-3 py-2 text-sm text-paper shadow-sm transition-colors placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan disabled:cursor-not-allowed disabled:opacity-50 resize-none leading-relaxed"
        )}
        value={value}
        rows={rows}
        placeholder={placeholder}
        style={style}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

// Tactile instrument slider with a live mono readout — used for temperature.
export const LabeledSlider = ({ label, value, onChange, min = 0, max = 1, step = 0.1, format = (v) => v }) => {
  const num = parseFloat(value);
  const safe = Number.isNaN(num) ? min : num;
  return (
    <div className="w-full space-y-1.5">
      <FieldLabel right={<span className="text-[10px] font-mono tabular-nums text-cyan">{format(safe)}</span>}>
        {label}
      </FieldLabel>
      <input
        type="range"
        className="bp-range nodrag"
        min={min}
        max={max}
        step={step}
        value={safe}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export const NodeText = ({ children }) => (
  <p className="text-sm text-slate-400 leading-relaxed">{children}</p>
);
