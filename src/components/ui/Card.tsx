import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  id,
  onClick,
  hoverEffect = false
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-sm backdrop-blur-xs transition-all ${
        hoverEffect ? 'hover:border-slate-700/90 hover:bg-slate-900 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
    <div>
      <h3 className="text-base font-semibold text-slate-100 tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="flex items-center gap-2">{action}</div>}
  </div>
);
