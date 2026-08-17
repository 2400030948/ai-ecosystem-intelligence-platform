import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  id?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  id
}) => {
  return (
    <div
      id={id}
      className={`flex items-center gap-1 border-b border-slate-800 pb-px overflow-x-auto scrollbar-none ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
              isActive
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {tab.icon && <span className="opacity-80">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
