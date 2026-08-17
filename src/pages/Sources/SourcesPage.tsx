import React, { useState, useEffect } from 'react';
import {
  Radio,
  ExternalLink,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Play,
  Database,
  Activity,
  Layers
} from 'lucide-react';
import { DataTable, Column } from '../../components/ui/DataTable';
import { SearchInput } from '../../components/ui/SearchInput';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Source, SourceType, SourceStatus } from '../../types';
import { apiService } from '../../services/api';
import { useToast } from '../../components/ui/ToastContext';

export const SourcesPage: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [crawlingSourceId, setCrawlingSourceId] = useState<string | null>(null);

  const toast = useToast();

  const fetchSources = async () => {
    setLoading(true);
    try {
      const items = await apiService.getSources({
        query: searchQuery,
        type: typeFilter,
        status: statusFilter
      });
      setSources(items);
    } catch (err) {
      console.error('Failed to fetch sources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, [searchQuery, typeFilter, statusFilter]);

  const handleTriggerCrawl = async (source: Source, e: React.MouseEvent) => {
    e.stopPropagation();
    setCrawlingSourceId(source.id);
    try {
      const res = await apiService.triggerSourceCrawl(source.id);
      toast.success('Crawl Job Dispatched', `Ingestion trigger sent to worker pool for "${source.name}".`);
      fetchSources();
    } catch (err) {
      toast.error('Crawl Dispatch Failed', 'Could not dispatch worker task.');
    } finally {
      setCrawlingSourceId(null);
    }
  };

  const getStatusBadgeVariant = (status: SourceStatus): BadgeVariant => {
    switch (status) {
      case 'Healthy':
        return 'success';
      case 'Active':
        return 'info';
      case 'Degraded':
        return 'warning';
      case 'Failing':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const getTypeBadgeVariant = (type: SourceType): BadgeVariant => {
    switch (type) {
      case 'Research':
        return 'info';
      case 'News':
        return 'warning';
      case 'Jobs':
        return 'purple';
      case 'Startups':
        return 'purple';
      case 'Products':
        return 'success';
      default:
        return 'neutral';
    }
  };

  const columns: Column<Source>[] = [
    {
      key: 'name',
      header: 'Source',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 font-bold shrink-0">
            <Radio className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-slate-100 text-xs hover:text-blue-400 transition-colors block truncate">
              {item.name}
            </span>
            <span className="text-[11px] text-slate-400 font-mono block">
              {item.parserType} • {item.crawlFrequency}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (item) => (
        <Badge variant={getTypeBadgeVariant(item.type)} size="sm">
          {item.type}
        </Badge>
      )
    },
    {
      key: 'url',
      header: 'URL',
      render: (item) => (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-mono max-w-[200px] truncate"
        >
          <span className="truncate">{item.url}</span>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={getStatusBadgeVariant(item.status)} size="sm" dot>
          {item.status}
        </Badge>
      )
    },
    {
      key: 'lastCrawl',
      header: 'Last Crawl',
      render: (item) => (
        <div className="flex items-center gap-1 text-slate-400 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{item.lastCrawl}</span>
        </div>
      )
    },
    {
      key: 'recordsFound',
      header: 'Records Found',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-slate-200 text-xs font-semibold">
          {item.recordsFound.toLocaleString()}
        </span>
      )
    },
    {
      key: 'errorRate',
      header: 'Error Rate',
      render: (item) => (
        <span
          className={`font-mono text-xs ${
            item.errorRate > 2 ? 'text-rose-400 font-bold' : 'text-slate-400'
          }`}
        >
          {item.errorRate.toFixed(1)}%
        </span>
      )
    },
    {
      key: 'action',
      header: 'Trigger',
      align: 'right',
      render: (item) => (
        <Button
          variant="outline"
          size="xs"
          loading={crawlingSourceId === item.id}
          icon={<Play className="w-3 h-3 text-emerald-400" />}
          onClick={(e) => handleTriggerCrawl(item, e)}
        >
          Crawl
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Source Observability & Crawlers</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitored ecosystem feeds, scrapers, APIs, arXiv streams, and corporate filing crawlers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="cyan" size="md">
            48 Configured Feeds
          </Badge>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={(q) => setSearchQuery(q)}
            placeholder="Search source name, URL, or endpoint..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Category:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Research">Research</option>
              <option value="News">News</option>
              <option value="Jobs">Jobs</option>
              <option value="Startups">Startups</option>
              <option value="Products">Products</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Healthy">Healthy</option>
              <option value="Active">Active</option>
              <option value="Degraded">Degraded</option>
              <option value="Failing">Failing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={sources}
        keyExtractor={(item) => item.id}
        loading={loading}
      />
    </div>
  );
};
