import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Package,
  FileText,
  Briefcase,
  Newspaper,
  GitMerge,
  Radio,
  Workflow,
  Cpu,
  BarChart3,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';

export type NavItemKey =
  | 'overview'
  | 'startups'
  | 'products'
  | 'research'
  | 'jobs'
  | 'news'
  | 'entity-resolution'
  | 'sources'
  | 'pipeline'
  | 'llm-engine'
  | 'analytics'
  | 'settings';

export interface SidebarProps {
  currentTab?: NavItemKey;
  activeItem?: NavItemKey;
  onSelectTab?: (tab: NavItemKey) => void;
  onSelect?: (tab: NavItemKey) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  activeItem,
  onSelectTab,
  onSelect,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const activeKey = currentTab || activeItem || 'overview';
  const handleSelect = onSelectTab || onSelect || (() => {});

  const navItems = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'startups', label: 'Startups', icon: <Building2 className="w-4 h-4" />, badge: '1.4k' },
    { key: 'products', label: 'Products', icon: <Package className="w-4 h-4" />, badge: '3.8k' },
    { key: 'research', label: 'Research Papers', icon: <FileText className="w-4 h-4" />, badge: '6.5k' },
    { key: 'jobs', label: 'Jobs', icon: <Briefcase className="w-4 h-4" />, badge: 'Fresh' },
    { key: 'news', label: 'News', icon: <Newspaper className="w-4 h-4" />, badge: 'Live' },
    { key: 'entity-resolution', label: 'Entity Resolution', icon: <GitMerge className="w-4 h-4" /> },
    { key: 'sources', label: 'Sources', icon: <Radio className="w-4 h-4" />, badge: '48' },
    { key: 'pipeline', label: 'Pipeline', icon: <Workflow className="w-4 h-4" />, badgeDot: true },
    { key: 'llm-engine', label: 'LLM Engine', icon: <Cpu className="w-4 h-4" /> },
    { key: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ] as const;

  const content = (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800/90 select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-900/40 text-white shrink-0">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-100 tracking-tight truncate">
                AI Intelligence
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                ECOSYSTEM OS
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-1">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Navigation
          </div>
        )}
        {navItems.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <button
              key={item.key}
              id={`nav-item-${item.key}`}
              onClick={() => {
                handleSelect(item.key as NavItemKey);
                onCloseMobile?.();
              }}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
              } ${isCollapsed ? 'justify-center px-2' : 'justify-between'}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`${
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {item.icon}
                </span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isCollapsed && (
                <div className="flex items-center gap-1.5">
                  {'badgeDot' in item && item.badgeDot && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                  {'badge' in item && item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        isActive
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-slate-900 text-slate-400 group-hover:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        {!isCollapsed ? (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-slate-200 truncate">Pipeline Active</span>
                <span className="text-[10px] text-slate-400 font-mono">185 rec/s • 99.4%</span>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 opacity-80" />
          </div>
        ) : (
          <div className="flex justify-center py-1" title="Pipeline Active (185 rec/s)">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside
        className={`hidden md:block shrink-0 h-screen sticky top-0 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-full z-10 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
