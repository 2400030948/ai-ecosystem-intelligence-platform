import React, { useState, useEffect } from 'react';
import {
  GitMerge,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Search,
  Check,
  Edit2,
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { DataTable, Column } from '../../components/ui/DataTable';
import { SearchInput } from '../../components/ui/SearchInput';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { EntityMapping, ConfidenceLevel } from '../../types';
import { apiService } from '../../services/api';
import { useToast } from '../../components/ui/ToastContext';

export const EntityResolutionPage: React.FC = () => {
  const [mappings, setMappings] = useState<EntityMapping[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [reviewingMapping, setReviewingMapping] = useState<EntityMapping | null>(null);
  const [overrideCanonical, setOverrideCanonical] = useState('');
  const toast = useToast();

  const fetchMappings = async () => {
    setLoading(true);
    try {
      const res = await apiService.getEntityMappings({
        query: searchQuery,
        confidenceTier: confidenceFilter,
        status: statusFilter,
        page,
        pageSize
      });
      setMappings(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch entity mappings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMappings();
  }, [searchQuery, confidenceFilter, statusFilter, page]);

  const handleOpenReview = (item: EntityMapping) => {
    setReviewingMapping(item);
    setOverrideCanonical(item.canonicalName);
  };

  const handleConfirmMapping = async () => {
    if (!reviewingMapping) return;
    try {
      await apiService.resolveEntity(reviewingMapping.id, overrideCanonical);
      toast.success('Canonical Entity Resolved', `Successfully mapped "${reviewingMapping.rawName}" → "${overrideCanonical}".`);
      setReviewingMapping(null);
      fetchMappings();
    } catch (err) {
      toast.error('Resolution Failed', 'Could not commit entity disambiguation mapping.');
    }
  };

  const getConfidenceBadge = (confidence: number, tier: ConfidenceLevel) => {
    const percent = Math.round(confidence * 100);
    if (tier === 'High') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-950/60 border border-emerald-800/50 text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{percent}% High</span>
        </span>
      );
    }
    if (tier === 'Medium') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-semibold bg-amber-950/60 border border-amber-800/50 text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>{percent}% Medium</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-semibold bg-rose-950/60 border border-rose-800/50 text-rose-300">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
        <span>{percent}% Review</span>
      </span>
    );
  };

  const columns: Column<EntityMapping>[] = [
    {
      key: 'rawName',
      header: 'Raw Ingested Alias',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-[10px] text-slate-400">
            RAW
          </div>
          <span className="font-semibold text-slate-200 text-xs font-mono">{item.rawName}</span>
        </div>
      )
    },
    {
      key: 'arrow',
      header: '',
      width: '40px',
      render: () => <ArrowRight className="w-4 h-4 text-slate-600" />
    },
    {
      key: 'canonicalName',
      header: 'Canonical Name',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-950 border border-blue-800 flex items-center justify-center font-mono text-[10px] text-blue-300">
            CAN
          </div>
          <span className="font-bold text-blue-400 text-xs font-mono">{item.canonicalName}</span>
        </div>
      )
    },
    {
      key: 'entityType',
      header: 'Entity Type',
      render: (item) => (
        <Badge variant="purple" size="sm">
          {item.entityType}
        </Badge>
      )
    },
    {
      key: 'confidence',
      header: 'Confidence',
      render: (item) => getConfidenceBadge(item.confidence, item.confidenceTier)
    },
    {
      key: 'source',
      header: 'Source Origin',
      render: (item) => (
        <span className="text-slate-300 text-xs truncate max-w-[140px] inline-block font-mono">
          {item.source}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          <Badge
            variant={item.status === 'Confirmed' ? 'success' : 'warning'}
            size="sm"
            dot
          >
            {item.status}
          </Badge>
          <button
            onClick={() => handleOpenReview(item)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Review & Adjust Mapping"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Entity Resolution & Deduplication</h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated disambiguation cluster uniting noisy corporate legal variations, trademark spellings, and multi-source aliases.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="purple" size="md">
            {total} Active Mappings
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
            placeholder="Search raw name or canonical target..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Confidence Tier:</span>
            <select
              value={confidenceFilter}
              onChange={(e) => {
                setConfidenceFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Confidence Levels</option>
              <option value="High">High (90-100%)</option>
              <option value="Medium">Medium (75-89%)</option>
              <option value="Review">Review (&lt; 75%)</option>
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
              <option value="Confirmed">Confirmed</option>
              <option value="Manual Review">Manual Review</option>
              <option value="Auto Resolved">Auto Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={mappings}
        keyExtractor={(item) => item.id}
        loading={loading}
        pagination={{
          currentPage: page,
          pageSize,
          totalItems: total,
          onPageChange: (p) => setPage(p)
        }}
      />

      {/* Review Modal */}
      <Modal
        isOpen={!!reviewingMapping}
        onClose={() => setReviewingMapping(null)}
        title="Review & Resolve Entity Disambiguation"
        subtitle="Enforce canonical mapping across all downstream databases and vector indices"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setReviewingMapping(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmMapping} icon={<Check className="w-3.5 h-3.5" />}>
              Confirm Canonical Mapping
            </Button>
          </div>
        }
      >
        {reviewingMapping && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 space-y-2">
              <div className="text-slate-400 font-mono text-[11px]">Ingested Raw String:</div>
              <div className="text-slate-100 font-mono font-bold text-sm bg-slate-900 px-3 py-2 rounded border border-slate-800">
                {reviewingMapping.rawName}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold text-xs">
                Canonical Destination Entity
              </label>
              <input
                type="text"
                value={overrideCanonical}
                onChange={(e) => setOverrideCanonical(e.target.value)}
                className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Candidate options */}
            {reviewingMapping.alternateCandidates && reviewingMapping.alternateCandidates.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-mono">
                  Suggested Canonical Candidates:
                </span>
                <div className="flex flex-wrap gap-2">
                  {reviewingMapping.alternateCandidates.map((cand) => (
                    <button
                      key={cand.name}
                      onClick={() => setOverrideCanonical(cand.name)}
                      className={`px-2.5 py-1 rounded text-xs font-mono border transition-colors ${
                        overrideCanonical === cand.name
                          ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {cand.name} ({Math.round(cand.score * 100)}%)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Match Criteria */}
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <span className="text-slate-500 font-bold uppercase">Heuristic & Vector Rules:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                {reviewingMapping.matchCriteria.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
