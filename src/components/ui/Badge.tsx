import React from 'react';

export type BadgeVariant =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'purple'
  | 'outline'
  | 'cyan';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  dot?: boolean;
  className?: string;
  id?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  dot,
  className = '',
  id
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
    success: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50',
    warning: 'bg-amber-950/60 text-amber-300 border-amber-800/50',
    error: 'bg-rose-950/60 text-rose-300 border-rose-800/50',
    info: 'bg-blue-950/60 text-blue-300 border-blue-800/50',
    purple: 'bg-purple-950/60 text-purple-300 border-purple-800/50',
    cyan: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/50',
    outline: 'bg-transparent text-slate-400 border-slate-700/80'
  };

  const dotColors: Record<BadgeVariant, string> = {
    neutral: 'bg-slate-400',
    success: 'bg-emerald-400 animate-pulse',
    warning: 'bg-amber-400',
    error: 'bg-rose-400',
    info: 'bg-blue-400',
    purple: 'bg-purple-400',
    cyan: 'bg-cyan-400',
    outline: 'bg-slate-400'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-mono',
    md: 'px-2.5 py-1 text-xs font-medium'
  };

  return (
    <span
      id={id}
      className={`inline-flex items-center gap-1.5 rounded border whitespace-nowrap leading-none transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {icon && <span className="text-current opacity-80">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
