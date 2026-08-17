import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  ExternalLink,
  Filter,
  Clock,
  Globe,
  Tag,
  Sparkles,
  TrendingUp,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { DataTable, Column } from '../../components/ui/DataTable';
import { SearchInput } from '../../components/ui/SearchInput';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { NewsItem } from '../../types';
import { apiService } from '../../services/api';

export const NewsPage: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [freshOnly, setFreshOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [activeNews, setActiveNews] = useState<NewsItem | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await apiService.getNews({
        query: searchQuery,
        category: categoryFilter,
        freshOnly,
        page,
        pageSize
      });
      setNews(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch news', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [searchQuery, categoryFilter, freshOnly, page]);

  const getCategoryBadgeVariant = (category: NewsItem['category']): BadgeVariant => {
    switch (category) {
      case 'Model Release':
        return 'success';
      case 'Funding':
        return 'purple';
      case 'Research Breakthrough':
        return 'info';
      case 'Policy & Safety':
        return 'warning';
      case 'Hardware':
        return 'cyan';
      default:
        return 'neutral';
    }
  };

  const columns: Column<NewsItem>[] = [
    {
      key: 'headline',
      header: 'Headline',
      width: '45%',
      render: (item) => (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Newspaper className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-slate-100 text-xs hover:text-blue-400 transition-colors line-clamp-2 block">
              {item.headline}
            </span>
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.summary}</p>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => (
        <Badge variant={getCategoryBadgeVariant(item.category)} size="sm">
          {item.category}
        </Badge>
      )
    },
    {
      key: 'source',
      header: 'Source',
      render: (item) => (
        <div className="text-xs">
          <span className="text-slate-200 font-medium block truncate max-w-[140px]">
            {item.source}
          </span>
          <span className="text-[10px] text-slate-500 font-mono block">{item.sourceDomain}</span>
        </div>
      )
    },
    {
      key: 'freshnessLabel',
      header: 'Freshness',
      render: (item) => (
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className={item.isFresh ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
            {item.freshnessLabel}
          </span>
          {item.isFresh && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
        </div>
      )
    },
    {
      key: 'url',
      header: 'URL',
      align: 'right',
      render: (item) => (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-mono"
        >
          <span>Article</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )
    }
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">AI News & Ecosystem Events</h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated RSS, technical journalism, press announcements, entity entity extraction, and sentiment tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="warning" size="md" dot>
            {total} Live Articles
          </Badge>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={(q) => {
              setSearchQuery(q);
              setPage(1);
            }}
            placeholder="Search news headlines, keywords, or entities..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Model Release">Model Release</option>
              <option value="Funding">Funding</option>
              <option value="Research Breakthrough">Research Breakthrough</option>
              <option value="Policy & Safety">Policy & Safety</option>
              <option value="Hardware">Hardware</option>
            </select>
          </div>

          <button
            onClick={() => setFreshOnly(!freshOnly)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              freshOnly
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Fresh (&lt; 24h)
          </button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={news}
        keyExtractor={(item) => item.id}
        onRowClick={(item) => setActiveNews(item)}
        loading={loading}
        pagination={{
          currentPage: page,
          pageSize,
          totalItems: total,
          onPageChange: (p) => setPage(p)
        }}
      />

      {/* News Detail Drawer */}
      <Drawer
        isOpen={!!activeNews}
        onClose={() => setActiveNews(null)}
        title={
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950/70 border border-amber-700/50 flex items-center justify-center text-amber-400 font-bold shrink-0">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-100 font-bold text-sm sm:text-base leading-snug block">
                {activeNews?.headline}
              </span>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {activeNews?.source} • {activeNews?.sourceDomain}
              </p>
            </div>
          </div>
        }
        subtitle={
          activeNews && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={getCategoryBadgeVariant(activeNews.category)} size="sm">
                {activeNews.category}
              </Badge>
              <Badge variant="outline" size="sm" className="font-mono">
                {activeNews.freshnessLabel}
              </Badge>
            </div>
          )
        }
        footer={
          activeNews && (
            <a
              href={activeNews.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                iconRight={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Read Full Article at {activeNews.sourceDomain}
              </Button>
            </a>
          )
        }
      >
        {activeNews && (
          <div className="space-y-5 text-xs text-slate-300">
            {/* Summary */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Extracted Intelligence Summary
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">{activeNews.summary}</p>
            </div>

            {/* Referenced Entities */}
            {activeNews.referencedEntities.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Referenced Ecosystem Entities
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeNews.referencedEntities.map((ent) => (
                    <span
                      key={ent}
                      className="px-2.5 py-1 rounded text-xs font-mono bg-slate-950 border border-slate-700/60 text-blue-300"
                    >
                      {ent}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Publication Telemetry */}
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
              <div>Published Timestamp: {new Date(activeNews.publishedAt).toUTCString()}</div>
              <div>Sentiment Classification: {activeNews.sentiment}</div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
