import React, { useState, useEffect } from 'react';
import {
  FileText,
  Star,
  ExternalLink,
  Github,
  Filter,
  TrendingUp,
  Award,
  BookOpen,
  Tag,
  Cpu,
  Layers
} from 'lucide-react';
import { DataTable, Column } from '../../components/ui/DataTable';
import { SearchInput } from '../../components/ui/SearchInput';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { ResearchPaper } from '../../types';
import { apiService } from '../../services/api';

export const ResearchPapersPage: React.FC = () => {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [activePaper, setActivePaper] = useState<ResearchPaper | null>(null);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const res = await apiService.getResearchPapers({
        query: searchQuery,
        category: categoryFilter,
        page,
        pageSize
      });
      setPapers(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch research papers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [searchQuery, categoryFilter, page]);

  const columns: Column<ResearchPaper>[] = [
    {
      key: 'title',
      header: 'Paper Title',
      width: '40%',
      sortable: true,
      render: (item) => (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-slate-100 text-xs hover:text-blue-400 transition-colors line-clamp-2">
              {item.title}
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {item.categories.map((c) => (
                <span
                  key={c}
                  className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700/60"
                >
                  {c}
                </span>
              ))}
              {item.arxivId && (
                <span className="text-[10px] text-slate-500 font-mono">arXiv:{item.arxivId}</span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'authors',
      header: 'Authors',
      render: (item) => (
        <div className="text-xs text-slate-300">
          <span className="font-medium text-slate-200 block truncate max-w-[160px]">
            {item.authors[0]} et al.
          </span>
          <span className="text-[10px] text-slate-500 truncate block max-w-[160px]">
            {item.primaryAuthorAffiliation}
          </span>
        </div>
      )
    },
    {
      key: 'publishedDate',
      header: 'Published',
      sortable: true,
      render: (item) => (
        <span className="text-slate-400 text-xs font-mono whitespace-nowrap">
          {item.publishedDate}
        </span>
      )
    },
    {
      key: 'githubStars',
      header: 'GitHub Stars',
      sortable: true,
      render: (item) => (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/40 border border-amber-800/50 text-amber-300 font-mono text-xs font-bold shadow-xs">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{item.githubStars.toLocaleString()}</span>
          {item.githubStarsDelta7d && (
            <span className="text-[10px] text-emerald-400 font-normal ml-0.5">
              +{item.githubStarsDelta7d}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'githubUrl',
      header: 'GitHub',
      render: (item) =>
        item.githubUrl ? (
          <a
            href={item.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white font-mono"
          >
            <Github className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[100px]">Repository</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
        ) : (
          <span className="text-slate-600 text-xs font-mono">—</span>
        )
    },
    {
      key: 'source',
      header: 'Source',
      align: 'right',
      render: (item) => (
        <a
          href={item.paperUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-mono"
        >
          <span className="truncate max-w-[120px]">{item.source}</span>
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
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">AI Research Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time arXiv discovery, preprint ingestion, empirical benchmark evaluation, and code repository star velocity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" size="md">
            {total} Papers Analyzed
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
            placeholder="Search papers by title, author, or keywords..."
          />
        </div>

        <div className="flex items-center gap-2">
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
              <option value="cs.AI">cs.AI (Artificial Intelligence)</option>
              <option value="cs.LG">cs.LG (Machine Learning)</option>
              <option value="cs.CL">cs.CL (Computation & Language)</option>
              <option value="cs.RO">cs.RO (Robotics)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={papers}
        keyExtractor={(item) => item.id}
        onRowClick={(item) => setActivePaper(item)}
        loading={loading}
        pagination={{
          currentPage: page,
          pageSize,
          totalItems: total,
          onPageChange: (p) => setPage(p)
        }}
      />

      {/* Paper Detail Drawer */}
      <Drawer
        isOpen={!!activePaper}
        onClose={() => setActivePaper(null)}
        width="max-w-2xl"
        title={
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-950/70 border border-blue-700/50 flex items-center justify-center text-blue-400 font-bold shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-100 font-bold text-sm sm:text-base leading-snug block">
                {activePaper?.title}
              </span>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {activePaper?.primaryAuthorAffiliation}
              </p>
            </div>
          </div>
        }
        subtitle={
          activePaper && (
            <div className="flex flex-wrap items-center gap-2 mt-2 font-mono text-xs">
              <span className="text-slate-400">Published: {activePaper.publishedDate}</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {activePaper.githubStars.toLocaleString()} GitHub Stars
              </span>
            </div>
          )
        }
        footer={
          activePaper && (
            <div className="flex items-center gap-3 w-full">
              {activePaper.githubUrl && (
                <a
                  href={activePaper.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    icon={<Github className="w-3.5 h-3.5" />}
                  >
                    View Code Repository
                  </Button>
                </a>
              )}
              <a
                href={activePaper.paperUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  iconRight={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Open Preprint (PDF/ArXiv)
                </Button>
              </a>
            </div>
          )
        }
      >
        {activePaper && (
          <div className="space-y-5 text-xs text-slate-300">
            {/* Authors */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Authors & Academic Affiliation
              </span>
              <p className="text-xs text-slate-100 font-medium">
                {activePaper.authors.join(', ')}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                {activePaper.primaryAuthorAffiliation}
              </p>
            </div>

            {/* Abstract */}
            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Extracted Abstract & Executive Summary
              </span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
                {activePaper.abstract}
              </p>
            </div>

            {/* Benchmarks & Empirical Evaluations */}
            {activePaper.benchmarks.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Validated Benchmark Scores
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {activePaper.benchmarks.map((bench) => (
                    <div
                      key={bench.name}
                      className="p-3 bg-slate-950/60 rounded-lg border border-slate-800"
                    >
                      <span className="text-slate-400 text-[11px] truncate block">
                        {bench.name}
                      </span>
                      <p className="text-emerald-400 font-mono font-bold text-base mt-1">
                        {bench.score}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono">{bench.metric}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Repository Velocity */}
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400 flex items-center justify-between">
              <span>Ingested from: {activePaper.source}</span>
              <span className="text-blue-400 font-semibold">{activePaper.citationsCount} Citations</span>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
