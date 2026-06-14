import React from 'react';
import { cn } from '../../lib/utils';
import { Spinner } from './Spinner';

export const Button = React.forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 tracking-wide';
  
  const variants = {
    primary: 'bg-cyan text-ink hover:bg-cyan/90 border border-transparent shadow-sm shadow-cyan/20',
    secondary: 'bg-[#1b2a3d] text-paper hover:bg-[#2b4763] border border-[#1b2a3d]',
    ghost: 'hover:bg-[#1b2a3d] text-[#9fb0c4] hover:text-paper',
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-12 px-8 text-base',
    icon: 'h-9 w-9',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && <Spinner className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
