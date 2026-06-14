import React from 'react';
import { cn } from '../../lib/utils';

export const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-line bg-[#0c121c]/90 text-paper shadow-lg backdrop-blur-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-4 border-b border-line/50", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight text-paper', className)}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 pt-4", className)} {...props} />
));
CardContent.displayName = "CardContent";
