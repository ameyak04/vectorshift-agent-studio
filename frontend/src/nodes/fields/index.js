import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { cn } from '../../lib/utils';

export const LabeledInput = ({ label, value, onChange, type = 'text', placeholder }) => (
  <Input
    className="nodrag"
    label={label}
    type={type}
    value={value}
    placeholder={placeholder}
    onChange={(e) => onChange(e.target.value)}
  />
);

export const LabeledSelect = ({ label, value, onChange, options = [] }) => {
  const formattedOptions = options.map((opt) => ({
    label: typeof opt === 'string' ? opt : opt.label,
    value: typeof opt === 'string' ? opt : opt.value,
  }));

  return (
    <Select
      className="nodrag"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={formattedOptions}
    />
  );
};

export const LabeledTextarea = ({ label, value, onChange, placeholder, textareaRef, style, rows }) => {
  const id = `textarea-${label}`;
  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-slate-300">
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={textareaRef}
        className={cn(
          "nodrag flex w-full rounded-md border border-line bg-[#0c121c] px-3 py-2 text-sm text-paper shadow-sm transition-colors placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan disabled:cursor-not-allowed disabled:opacity-50 resize-none leading-relaxed"
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

export const NodeText = ({ children }) => (
  <p className="text-sm text-slate-400 leading-relaxed">{children}</p>
);
