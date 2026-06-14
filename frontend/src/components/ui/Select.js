import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export const Select = React.forwardRef(({
  className,
  label,
  error,
  options = [],
  value,
  onChange,
  ...props
}, ref) => {
  const id = React.useId();

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          ref={ref}
          value={value}
          onChange={onChange}
          className={cn(
            "flex h-9 w-full appearance-none rounded-md border border-line bg-[#0c121c] px-3 py-1 pr-8 text-sm text-paper shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500/50 focus-visible:ring-red-500",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {error && (
        <p className="text-[11px] text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
