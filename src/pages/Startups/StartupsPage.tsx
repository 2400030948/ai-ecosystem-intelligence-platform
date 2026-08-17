import React, { useState, useEffect } from 'react';
import {
  Building2,
  ExternalLink,
  Filter,
  CheckCircle2,
  GitMerge,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Globe,
  Tag,
  Package,
  Layers
} from 'lucide-react';
import { DataTable, Column } from '../../components/ui/DataTable';
import { SearchInput } from '../../components/ui/SearchInput';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Startup } from '../../types';
import { apiService } from '../../services/api';

interface StartupsPageProps {
  selectedStartupId?: string;
  onClearSelectedStartupId?: () => void;
}

export const StartupsPage: React.FC<StartupsPageProps> = ({
  selectedStartupId,
  onClearSelectedStartupId
}) => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<keyof Startup>('collectedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [activeStartup, setActiveStartup] = useState<Startup | null>(null);

  const fetchStartups = async () => {
    setLoading(true);
    try {
      const res = await apiService.getStartups({
        query: searchQuery,
        stage: stageFilter,
        status: statusFilter,
        sortBy,
        sortOrder,
        page,
        pageSize
      });
      setStartups(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch startups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, [searchQuery, stageFilter, statusFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    if (selectedStartupId) {
      apiService.getStartupById(selectedStartupId).then((s) => {
        if (s) setActiveStartup(s);
      });
    }
  }, [selectedStartupId]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key as keyof Startup);
      setSortOrder('asc');
    }
  };

  const getStatusBadgeVariant = (status: Startup['status']): BadgeVariant => {
    switch (status) {
      case 'Verified':
        return 'success';
      case 'Active':
        return 'info';
      case 'Pending Enrichment':
        return 'warning';
      case 'Flagged':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const columns: Column<Startup>[] = [
    {
      key: 'name',
      header: 'Startup',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0 font-mono">
            {item.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 text-xs hover:text-blue-400 transition-colors">
                {item.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                ({item.stage})
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono truncate">{item.domain}</div>
          </div>
        </div>
      )
    },
    {
      key: 'employees',
      header: 'Employees',
      sortable: true,
      render: (item) => (
        <div className="text-slate-300 font-mono text-xs flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span>{item.employees}</span>
        </div>
      )
    },
    {
      key: 'source',
      header: 'Source',
      render: (item) => (
        <span className="text-slate-300 text-xs truncate max-w-[150px] inline-block">
          {item.source}
        </span>
      )
    },
    {
      key: 'sourceUrl',
      header: 'Source URL',
      render: (item) => (
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-mono max-w-[180px] truncate"
        >
          <span className="truncate">{item.sourceUrl}</span>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      )
    },
    {
      key: 'collectedAt',
      header: 'Collected',
      sortable: true,
      render: (item) => (
        <span className="text-slate-400 text-[11px] font-mono whitespace-nowrap">
          {new Date(item.collectedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: (item) => (
        <Badge variant={getStatusBadgeVariant(item.status)} size="sm" dot>
          {item.status}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">AI Startups Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">
            Normalized startup registries, corporate filings, employee bounds, funding rounds, and canonical resolutions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="purple" size="md">
            {total} Entities Indexed
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
            placeholder="Search by startup name, domain, tags..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Stage:</span>
            <select
              value={stageFilter}
              onChange={(e) => {
                setStageFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Stages</option>
              <option value="Series A">Series A</option>
              <option value="Series B">Series B</option>
              <option value="Series C">Series C</option>
              <option value="Series D">Series D</option>
              <option value="Seed / Series A">Seed / Series A</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Active">Active</option>
              <option value="Pending Enrichment">Pending Enrichment</option>
              <option value="Flagged">Flagged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={startups}
        keyExtractor={(item) => item.id}
        onRowClick={(item) => setActiveStartup(item)}
        sortBy={String(sortBy)}
        sortOrder={sortOrder}
        onSort={handleSort}
        loading={loading}
        pagination={{
          currentPage: page,
          pageSize,
          totalItems: total,
          onPageChange: (p) => setPage(p)
        }}
      />

      {/* Startup Detail Drawer */}
      <Drawer
        isOpen={!!activeStartup}
        onClose={() => {
          setActiveStartup(null);
          onClearSelectedStartupId?.();
        }}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 font-mono text-sm">
              {activeStartup?.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-slate-100 font-bold text-base">{activeStartup?.name}</span>
              {activeStartup?.legalName && (
                <p className="text-xs text-slate-400 font-mono font-normal">
                  {activeStartup.legalName}
                </p>
              )}
            </div>
          </div>
        }
        subtitle={
          activeStartup && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={getStatusBadgeVariant(activeStartup.status)} size="sm" dot>
                {activeStartup.status}
              </Badge>
              <Badge variant="purple" size="sm">
                {activeStartup.stage}
              </Badge>
            </div>
          )
        }
        footer={
          activeStartup && (
            <a
              href={activeStartup.sourceUrl}
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
                Inspect Original Source Document
              </Button>
            </a>
          )
        }
      >
        {activeStartup && (
          <div className="space-y-6 text-xs text-slate-300">
            {/* Overview description */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Corporate Synthesis
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">{activeStartup.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {activeStartup.primaryTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900 border border-slate-700/60 text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Structured Metadata Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-mono">Headquarters</span>
                <p className="text-slate-200 font-medium mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {activeStartup.headquarters}
                </p>
              </div>
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-mono">Domain</span>
                <p className="text-slate-200 font-mono mt-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {activeStartup.domain}
                </p>
              </div>
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-mono">Total Capital</span>
                <p className="text-emerald-400 font-mono font-semibold mt-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  {activeStartup.totalFunding || 'Undisclosed'}
                </p>
              </div>
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-mono">Headcount</span>
                <p className="text-slate-200 font-mono mt-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {activeStartup.employees}
                </p>
              </div>
            </div>

            {/* Related Products */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  Associated Products ({activeStartup.relatedProducts.length})
                </h4>
              </div>
              <div className="space-y-2">
                {activeStartup.relatedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-200 text-xs">{p.name}</span>
                    <Badge variant="cyan" size="sm">
                      {p.pricingModel}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Resolution Information */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <GitMerge className="w-4 h-4 text-purple-400" />
                  Canonical Resolution Telemetry
                </h4>
                <Badge variant="success" size="sm" className="font-mono">
                  {(activeStartup.resolutionInfo.confidence * 100).toFixed(0)}% Match
                </Badge>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono">Resolved Aliases:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {activeStartup.resolutionInfo.rawAliases.map((alias) => (
                    <span
                      key={alias}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900 text-slate-400 border border-slate-800"
                    >
                      {alias}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Ingestion Source: {activeStartup.source}</span>
                <span>
                  {new Date(activeStartup.collectedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
