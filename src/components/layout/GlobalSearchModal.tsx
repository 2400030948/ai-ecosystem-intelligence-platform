import React, { useState, useEffect, useMemo } from 'react';
import { Search, Building2, Package, FileText, Briefcase, Newspaper, GitMerge, Radio, ArrowRight, X } from 'lucide-react';
import { mockStartups } from '../../data/mockStartups';
import { mockProducts } from '../../data/mockProducts';
import { mockResearchPapers } from '../../data/mockResearchPapers';
import { mockJobs } from '../../data/mockJobs';
import { mockNews } from '../../data/mockNews';
import { mockEntityMappings } from '../../data/mockEntityMappings';
import { mockSources } from '../../data/mockSources';
import { NavItemKey } from './Sidebar';
import { Badge } from '../ui/Badge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavItemKey, entityId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle handled outside
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const matchedStartups = mockStartups
      .filter((s) => s.name.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q))
      .map((s) => ({
        id: s.id,
        title: s.name,
        subtitle: `${s.stage} • ${s.headquarters} • ${s.domain}`,
        type: 'startups' as NavItemKey,
        icon: <Building2 className="w-4 h-4 text-purple-400" />,
        badge: 'Startup'
      }));

    const matchedProducts = mockProducts
      .filter((p) => p.name.toLowerCase().includes(q) || p.startupName.toLowerCase().includes(q))
      .map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: `by ${p.startupName} • ${p.pricingModel} • ${p.category}`,
        type: 'products' as NavItemKey,
        icon: <Package className="w-4 h-4 text-emerald-400" />,
        badge: 'Product'
      }));

    const matchedPapers = mockResearchPapers
      .filter((p) => p.title.toLowerCase().includes(q) || p.authors.some((a) => a.toLowerCase().includes(q)))
      .map((p) => ({
        id: p.id,
        title: p.title,
        subtitle: `${p.authors.slice(0, 2).join(', ')} • ⭐ ${p.githubStars.toLocaleString()}`,
        type: 'research' as NavItemKey,
        icon: <FileText className="w-4 h-4 text-blue-400" />,
        badge: 'Paper'
      }));

    const matchedJobs = mockJobs
      .filter((j) => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q))
      .map((j) => ({
        id: j.id,
        title: j.title,
        subtitle: `${j.company} • ${j.location} • ${j.freshnessLabel}`,
        type: 'jobs' as NavItemKey,
        icon: <Briefcase className="w-4 h-4 text-pink-400" />,
        badge: 'Job'
      }));

    const matchedNews = mockNews
      .filter((n) => n.headline.toLowerCase().includes(q))
      .map((n) => ({
        id: n.id,
        title: n.headline,
        subtitle: `${n.source} • ${n.category} • ${n.freshnessLabel}`,
        type: 'news' as NavItemKey,
        icon: <Newspaper className="w-4 h-4 text-amber-400" />,
        badge: 'News'
      }));

    const matchedEntities = mockEntityMappings
      .filter((m) => m.rawName.toLowerCase().includes(q) || m.canonicalName.toLowerCase().includes(q))
      .map((m) => ({
        id: m.id,
        title: `${m.rawName} → ${m.canonicalName}`,
        subtitle: `Confidence: ${(m.confidence * 100).toFixed(0)}% • ${m.source}`,
        type: 'entity-resolution' as NavItemKey,
        icon: <GitMerge className="w-4 h-4 text-indigo-400" />,
        badge: 'Entity'
      }));

    const matchedSources = mockSources
      .filter((s) => s.name.toLowerCase().includes(q))
      .map((s) => ({
        id: s.id,
        title: s.name,
        subtitle: `${s.type} • ${s.status} • Last crawl ${s.lastCrawl}`,
        type: 'sources' as NavItemKey,
        icon: <Radio className="w-4 h-4 text-cyan-400" />,
        badge: 'Source'
      }));

    return [
      ...matchedStartups,
      ...matchedProducts,
      ...matchedPapers,
      ...matchedJobs,
      ...matchedNews,
      ...matchedEntities,
      ...matchedSources
    ].slice(0, 10);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-start justify-center pt-20 p-4">
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        <div className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-slate-900 border border-slate-800 shadow-2xl transition-all relative z-10">
          {/* Search Header */}
          <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3">
            <Search className="w-5 h-5 text-blue-400 shrink-0" />
            <input
              type="text"
              value={query}
              autoFocus
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by company, product, paper author, job title, source, or entity alias..."
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700 rounded">
              ESC
            </kbd>
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto p-2">
            {!query.trim() ? (
              <div className="py-8 px-4 text-center text-xs text-slate-500 space-y-3">
                <p className="font-medium text-slate-400">Quickly jump across the entire AI ecosystem</p>
                <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                  {['Anthropic', 'FlashAttention-3', 'Perplexity', 'CUDA', 'OpenAI', 'ArXiv cs.AI'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-700/60"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No matching ecosystem intelligence entities found for "{query}".
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => {
                      onNavigate(item.type, item.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/70 border border-transparent hover:border-slate-700/60 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/50 shrink-0">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                            {item.title}
                          </span>
                          <Badge variant="outline" size="sm">
                            {item.badge}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
