import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  autoFocus?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search entities, sources, papers...',
  className = '',
  id,
  autoFocus
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        id={id}
        type="text"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-8 bg-slate-900/90 border border-slate-700/70 focus:border-blue-500 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/40 transition-colors font-sans"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
