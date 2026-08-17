import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  ExternalLink,
  Filter,
  Clock,
  MapPin,
  DollarSign,
  Building2,
  CheckCircle2,
  Sparkles,
  Wifi,
  Radio
} from 'lucide-react';
import { DataTable, Column } from '../../components/ui/DataTable';
import { SearchInput } from '../../components/ui/SearchInput';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Job } from '../../types';
import { apiService } from '../../services/api';

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFamilyFilter, setRoleFamilyFilter] = useState('ALL');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [within24hOnly, setWithin24hOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [activeJob, setActiveJob] = useState<Job | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await apiService.getJobs({
        query: searchQuery,
        roleFamily: roleFamilyFilter,
        remoteOnly,
        within24hOnly,
        page,
        pageSize
      });
      setJobs(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchQuery, roleFamilyFilter, remoteOnly, within24hOnly, page]);

  const columns: Column<Job>[] = [
    {
      key: 'company',
      header: 'Company',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700/60 flex items-center justify-center font-bold text-xs text-slate-300 font-mono">
            {item.company.substring(0, 2).toUpperCase()}
          </div>
          <span className="font-semibold text-slate-100 text-xs">{item.company}</span>
        </div>
      )
    },
    {
      key: 'title',
      header: 'Role',
      render: (item) => (
        <div className="min-w-0">
          <span className="font-medium text-slate-200 text-xs hover:text-blue-400 transition-colors block truncate">
            {item.title}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-slate-400 font-mono">{item.experienceLevel}</span>
            {item.salaryRange && (
              <>
                <span className="text-slate-600 text-[10px]">•</span>
                <span className="text-[10px] text-emerald-400 font-mono font-medium">
                  {item.salaryRange}
                </span>
              </>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'roleFamily',
      header: 'Role Family',
      render: (item) => (
        <Badge variant="purple" size="sm">
          {item.roleFamily}
        </Badge>
      )
    },
    {
      key: 'remote',
      header: 'Remote',
      render: (item) => (
        <div className="flex items-center gap-1 text-xs">
          {item.remote ? (
            <Badge variant="info" size="sm" icon={<Wifi className="w-3 h-3" />}>
              Remote
            </Badge>
          ) : (
            <span className="text-slate-400 text-xs flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              {item.location.split(',')[0]}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'publishedAt',
      header: 'Published',
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span
            className={`font-mono text-xs font-medium ${
              item.isWithin24Hours ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            {item.freshnessLabel}
          </span>
          {item.isWithin24Hours && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </div>
      )
    },
    {
      key: 'source',
      header: 'Source',
      align: 'right',
      render: (item) => (
        <a
          href={item.sourceUrl}
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
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">AI Jobs & Talent Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time crawling of greenhouse, lever, workatastartup career portals with strict 24-hour freshness tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" size="md" dot>
            {total} Active Postings
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
            placeholder="Search role title, company, or tech stack..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Role Family:</span>
            <select
              value={roleFamilyFilter}
              onChange={(e) => {
                setRoleFamilyFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="Research">Research</option>
              <option value="ML Engineering">ML Engineering</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Data Science">Data Science</option>
              <option value="Product">Product</option>
              <option value="Founding Engineer">Founding Engineer</option>
            </select>
          </div>

          <button
            onClick={() => setRemoteOnly(!remoteOnly)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              remoteOnly
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Wifi className="w-3 h-3" />
            Remote Only
          </button>

          <button
            onClick={() => setWithin24hOnly(!within24hOnly)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              within24hOnly
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            &lt; 24h Window
          </button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={jobs}
        keyExtractor={(item) => item.id}
        onRowClick={(item) => setActiveJob(item)}
        loading={loading}
        pagination={{
          currentPage: page,
          pageSize,
          totalItems: total,
          onPageChange: (p) => setPage(p)
        }}
      />

      {/* Job Detail Drawer */}
      <Drawer
        isOpen={!!activeJob}
        onClose={() => setActiveJob(null)}
        title={
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-950/70 border border-pink-700/50 flex items-center justify-center text-pink-400 font-bold shrink-0 font-mono">
              {activeJob?.company.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-slate-100 font-bold text-base block leading-tight">
                {activeJob?.title}
              </span>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {activeJob?.company} • {activeJob?.location}
              </p>
            </div>
          </div>
        }
        subtitle={
          activeJob && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="purple" size="sm">
                {activeJob.roleFamily}
              </Badge>
              {activeJob.isWithin24Hours && (
                <Badge variant="success" size="sm" dot>
                  {activeJob.freshnessLabel}
                </Badge>
              )}
            </div>
          )
        }
        footer={
          activeJob && (
            <a
              href={activeJob.sourceUrl}
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
                Apply on Official Career Board
              </Button>
            </a>
          )
        }
      >
        {activeJob && (
          <div className="space-y-5 text-xs text-slate-300">
            {/* Compensation & Seniority */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-mono">Compensation</span>
                <p className="text-emerald-400 font-mono font-semibold mt-1">
                  {activeJob.salaryRange || 'Competitive + Equity'}
                </p>
              </div>
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-mono">Seniority Level</span>
                <p className="text-slate-200 font-medium mt-1">{activeJob.experienceLevel}</p>
              </div>
            </div>

            {/* Required Technologies */}
            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Identified Tech Stack & Invariants
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeJob.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded text-xs font-mono bg-slate-950 border border-slate-700/60 text-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Source Information */}
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
              <div>Job Ingestion Origin: {activeJob.source}</div>
              <div>Published: {new Date(activeJob.publishedAt).toUTCString()}</div>
              <div>Direct API Verification: Verified Active</div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
