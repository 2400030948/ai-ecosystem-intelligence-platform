import React, { useState } from 'react';
import {
  Search,
  Bell,
  Activity,
  Menu,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  SlidersHorizontal,
  LogOut,
  Sparkles
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface HeaderProps {
  onOpenSearch: () => void;
  onOpenMobileMenu?: () => void;
  onRefreshData?: () => void;
  onTriggerSync?: () => void;
  isRefreshing?: boolean;
  isSyncing?: boolean;
  activeTab?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenMobileMenu,
  onRefreshData,
  onTriggerSync,
  isRefreshing = false,
  isSyncing = false
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleRefresh = onTriggerSync || onRefreshData;
  const isBusy = isRefreshing || isSyncing;

  const notifications = [
    {
      id: 'notif-1',
      title: 'New High-Star Paper Ingested',
      desc: 'FlashAttention-3 crossed 21,000 GitHub stars on ArXiv.',
      time: '12m ago',
      unread: true
    },
    {
      id: 'notif-2',
      title: 'LLM Fallback Handshake',
      desc: 'Groq auto-resolved batch burst rate limit gracefully.',
      time: '45m ago',
      unread: true
    },
    {
      id: 'notif-3',
      title: 'Entity Disambiguation Flagged',
      desc: '1 candidate mapping requires manual review score 0.62.',
      time: '2h ago',
      unread: false
    }
  ];

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 select-none">
      {/* Mobile Hamburger & Quick Title */}
      <div className="flex items-center gap-3 md:hidden">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <span className="text-sm font-bold text-slate-200 tracking-tight">AI Intelligence</span>
      </div>

      {/* Global Search Trigger Bar */}
      <div className="flex-1 max-w-xl hidden sm:flex items-center">
        <button
          onClick={onOpenSearch}
          className="w-full h-9 px-3.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-lg text-xs text-slate-400 flex items-center justify-between gap-3 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
            <span className="group-hover:text-slate-300">
              Search startups, products, papers, jobs, entities...
            </span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700/70 rounded">
              ⌘K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          className="sm:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Live Refresh Trigger */}
        {handleRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isBusy}
            className={`p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors ${
              isBusy ? 'animate-spin text-blue-400' : ''
            }`}
            title="Sync Latest Intelligence"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* System Health Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300 font-medium font-mono text-[11px]">99.8% Uptime</span>
          <Badge variant="success" size="sm" dot>
            Healthy
          </Badge>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 relative transition-colors"
            title="Intelligence Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-100">Intelligence Stream</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300">
                    2 unread
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] text-slate-400 hover:text-slate-200"
                >
                  Mark all read
                </button>
              </div>

              <div className="divide-y divide-slate-800/60 mt-2 max-h-72 overflow-y-auto">
                {notifications.map((item) => (
                  <div key={item.id} className="py-2.5 px-1 hover:bg-slate-800/40 rounded transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-slate-200">{item.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User / Org Workspace Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-md bg-linear-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
              AI
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-medium text-slate-200 leading-tight">Intelligence Lead</span>
              <span className="text-[10px] text-slate-400 font-mono">Enterprise Node</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <p className="font-semibold text-slate-100">Enterprise AI Ops</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">ai-cluster-asia01</p>
              </div>
              <button
                onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>API Keys & Webhooks</span>
              </button>
              <button
                onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span>Cluster Configuration</span>
              </button>
              <div className="border-t border-slate-800 my-1" />
              <button
                onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Switch Workspace</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
