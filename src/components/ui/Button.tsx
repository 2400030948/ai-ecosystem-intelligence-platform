import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  className = '',
  disabled,
  id,
  ...props
}) => {
  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm shadow-blue-900/30 border border-blue-500/40 active:translate-y-px',
    secondary:
      'bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 shadow-sm active:translate-y-px',
    outline:
      'bg-transparent hover:bg-slate-800/60 text-slate-300 border border-slate-700 hover:text-white',
    ghost:
      'bg-transparent hover:bg-slate-800/70 text-slate-400 hover:text-slate-200 border border-transparent',
    danger:
      'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/80 shadow-sm shadow-rose-950/40'
  };

  const sizeStyles: Record<ButtonSize, string> = {
    xs: 'h-7 px-2.5 text-xs gap-1.5 rounded',
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
    md: 'h-9 px-3.5 text-sm gap-2 rounded-md',
    lg: 'h-10 px-4 text-sm gap-2.5 rounded-lg'
  };

  return (
    <button
      id={id}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        icon
      )}
      {children}
      {iconRight}
    </button>
  );
};
