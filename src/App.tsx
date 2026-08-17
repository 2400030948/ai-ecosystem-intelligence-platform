import React, { useState } from 'react';
import { ToastProvider, useToast } from './components/ui/ToastContext';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';

// Pages
import { OverviewPage } from './pages/Overview/OverviewPage';
import { StartupsPage } from './pages/Startups/StartupsPage';
import { ProductsPage } from './pages/Products/ProductsPage';
import { ResearchPapersPage } from './pages/ResearchPapers/ResearchPapersPage';
import { JobsPage } from './pages/Jobs/JobsPage';
import { NewsPage } from './pages/News/NewsPage';
import { EntityResolutionPage } from './pages/EntityResolution/EntityResolutionPage';
import { SourcesPage } from './pages/Sources/SourcesPage';
import { PipelinePage } from './pages/Pipeline/PipelinePage';
import { LLMEnginePage } from './pages/LLMEngine/LLMEnginePage';
import { AnalyticsPage } from './pages/Analytics/AnalyticsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';

function AppContent() {
  const [activeNav, setActiveNav] = useState<NavItemKey>('overview');
  const [selectedEntityId, setSelectedEntityId] = useState<string | undefined>(undefined);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const toast = useToast();

  const handleNavigate = (tab: NavItemKey, entityId?: string) => {
    setActiveNav(tab);
    if (entityId) {
      setSelectedEntityId(entityId);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success(
        'Ecosystem Sync Completed',
        '28 fresh papers, 12 jobs, and 4 product releases discovered and resolved.'
      );
    }, 800);
  };

  const renderActivePage = () => {
    switch (activeNav) {
      case 'overview':
        return <OverviewPage onNavigate={handleNavigate} />;
      case 'startups':
        return (
          <StartupsPage
            selectedStartupId={selectedEntityId}
            onClearSelectedStartupId={() => setSelectedEntityId(undefined)}
          />
        );
      case 'products':
        return <ProductsPage />;
      case 'research':
        return <ResearchPapersPage />;
      case 'jobs':
        return <JobsPage />;
      case 'news':
        return <NewsPage />;
      case 'entity-resolution':
        return <EntityResolutionPage />;
      case 'sources':
        return <SourcesPage />;
      case 'pipeline':
        return <PipelinePage />;
      case 'llm-engine':
        return <LLMEnginePage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        isSyncing={isSyncing}
        onTriggerSync={handleManualSync}
        activeTab={activeNav}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Sidebar */}
        <Sidebar
          currentTab={activeNav}
          activeItem={activeNav}
          onSelectTab={(tab) => handleNavigate(tab)}
          onSelect={(tab) => handleNavigate(tab)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
          {renderActivePage()}
        </main>
      </div>

      {/* Global ⌘K Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
