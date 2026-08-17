import React, { useEffect, useState } from 'react';
import {
  Building2,
  Package,
  FileText,
  Briefcase,
  Newspaper,
  Database,
  CheckCircle2,
  Radio,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  ArrowUpRight,
  Workflow
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { apiService } from '../../services/api';
import {
  DashboardStats,
  IngestionTimePoint,
  PipelineStage,
  PipelineRun,
  LLMProvider,
  Source,
  Startup
} from '../../types';
import { NavItemKey } from '../../components/layout/Sidebar';

interface OverviewPageProps {
  onNavigate: (tab: NavItemKey, entityId?: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeline, setTimeline] = useState<IngestionTimePoint[]>([]);
  const [entityDist, setEntityDist] = useState<Array<{ name: string; count: number; fill: string }>>([]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [pipelineRuns, setPipelineRuns] = useState<PipelineRun[]>([]);
  const [llmProviders, setLLMProviders] = useState<LLMProvider[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [recentStartups, setRecentStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [
          dashboardStats,
          ingestionTimeline,
          entityDistribution,
          stages,
          runs,
          providers,
          sourcesList,
          startupsRes
        ] = await Promise.all([
          apiService.getDashboardStats(),
          apiService.getIngestionTimeline(),
          apiService.getEntityDistribution(),
          apiService.getPipelineStages(),
          apiService.getPipelineRuns(),
          apiService.getLLMProviders(),
          apiService.getSources(),
          apiService.getStartups({ page: 1, pageSize: 5, sortBy: 'collectedAt', sortOrder: 'desc' })
        ]);

        setStats(dashboardStats);
        setTimeline(ingestionTimeline);
        setEntityDist(entityDistribution);
        setPipelineStages(stages);
        setPipelineRuns(runs);
        setLLMProviders(providers);
        setSources(sourcesList.slice(0, 5));
        setRecentStartups(startupsRes.items);
      } catch (err) {
        console.error('Failed to load dashboard overview data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Operational Ticker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">AI Ecosystem Operational Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-source crawling, neural entity extraction, canonical resolution, and pipeline observability.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<Workflow className="w-3.5 h-3.5 text-blue-400" />}
            onClick={() => onNavigate('pipeline')}
          >
            Manage Pipeline
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            onClick={() => onNavigate('analytics')}
          >
            Deep Analytics
          </Button>
        </div>
      </div>

      {/* Top 8 Enterprise KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          label="Startups"
          value={stats ? stats.startupsCount.toLocaleString() : '1,428'}
          change={stats?.startupsGrowth ?? 12.4}
          trendLabel="vs last week"
          icon={<Building2 className="w-4 h-4" />}
          iconBgColor="bg-purple-500/10 text-purple-400 border-purple-500/20"
          onClick={() => onNavigate('startups')}
        />
        <StatCard
          label="Products"
          value={stats ? stats.productsCount.toLocaleString() : '3,890'}
          change={stats?.productsGrowth ?? 18.2}
          trendLabel="vs last week"
          icon={<Package className="w-4 h-4" />}
          iconBgColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          onClick={() => onNavigate('products')}
        />
        <StatCard
          label="Research Papers"
          value={stats ? stats.papersCount.toLocaleString() : '6,540'}
          change={stats?.papersGrowth ?? 9.8}
          trendLabel="vs last week"
          icon={<FileText className="w-4 h-4" />}
          iconBgColor="bg-blue-500/10 text-blue-400 border-blue-500/20"
          onClick={() => onNavigate('research')}
        />
        <StatCard
          label="Fresh Jobs (24h)"
          value={stats ? stats.freshJobsCount.toLocaleString() : '842'}
          change={stats?.freshJobsGrowth ?? 24.5}
          trendLabel="vs last week"
          icon={<Briefcase className="w-4 h-4" />}
          iconBgColor="bg-pink-500/10 text-pink-400 border-pink-500/20"
          onClick={() => onNavigate('jobs')}
        />
        <StatCard
          label="Fresh News (24h)"
          value={stats ? stats.freshNewsCount.toLocaleString() : '1,120'}
          change={stats?.freshNewsGrowth ?? 15.1}
          trendLabel="vs last week"
          icon={<Newspaper className="w-4 h-4" />}
          iconBgColor="bg-amber-500/10 text-amber-400 border-amber-500/20"
          onClick={() => onNavigate('news')}
        />
        <StatCard
          label="Records Processed"
          value={stats ? stats.recordsProcessedToday.toLocaleString() : '48,920'}
          change={stats?.recordsGrowth ?? 14.8}
          trendLabel="today"
          icon={<Database className="w-4 h-4" />}
          iconBgColor="bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
          onClick={() => onNavigate('pipeline')}
        />
        <StatCard
          label="Extraction Success"
          value={stats ? `${stats.extractionSuccessRate}%` : '99.4%'}
          change={stats ? `+${stats.extractionSuccessDelta}%` : '+0.3%'}
          trendLabel="accuracy"
          icon={<CheckCircle2 className="w-4 h-4" />}
          iconBgColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          onClick={() => onNavigate('llm-engine')}
        />
        <StatCard
          label="Active Sources"
          value={stats ? `${stats.activeSourcesCount} / ${stats.totalSourcesCount}` : '46 / 48'}
          trendLabel="monitored"
          icon={<Radio className="w-4 h-4" />}
          iconBgColor="bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
          onClick={() => onNavigate('sources')}
        />
      </div>

      {/* Main Charts Row: Ingestion Activity & Entity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 1: Ingestion Activity Time-Series */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Ingestion Activity & Throughput"
            subtitle="Normalized entity records collected and structured over the past 24 hours"
            action={
              <Badge variant="neutral" size="sm" className="font-mono">
                185 records/sec avg
              </Badge>
            }
          />
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorPapers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ padding: '2px 0' }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total Ingested"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
                <Area
                  type="monotone"
                  dataKey="papers"
                  name="Research Papers"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorPapers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Section 2: Entity Distribution */}
        <Card>
          <CardHeader
            title="Entity Distribution"
            subtitle="Categorical ratio of total resolved knowledge items"
          />
          <div className="h-64 sm:h-72 w-full flex flex-col justify-between">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={entityDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {entityDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#f8fafc'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs font-mono">
              {entityDist.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: item.fill }} />
                    <span className="font-sans text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-slate-400 font-semibold">{item.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Section 3: Pipeline Health Stages */}
      <Card>
        <CardHeader
          title="Pipeline Stage Health & Latencies"
          subtitle="Real-time status across the 7-stage neural ETL & verification workflow"
          action={
            <Button
              variant="outline"
              size="xs"
              iconRight={<ChevronRight className="w-3.5 h-3.5" />}
              onClick={() => onNavigate('pipeline')}
            >
              Full Stage Inspector
            </Button>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {pipelineStages.map((stage) => {
            return (
              <div
                key={stage.id}
                className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-mono text-slate-500">0{stage.order}</span>
                  <Badge variant={stage.status === 'running' ? 'success' : 'neutral'} size="sm" dot>
                    {stage.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 truncate">{stage.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    {stage.recordsProcessed.toLocaleString()} rec
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>{stage.lastDurationMs}ms</span>
                  <span className="text-emerald-400">{stage.healthScore}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Dual Section: Recent Discoveries & Source Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 4: Recent Discoveries */}
        <Card>
          <CardHeader
            title="Recent Entity Discoveries"
            subtitle="Newly identified frontier AI companies and models"
            action={
              <Button
                variant="ghost"
                size="xs"
                iconRight={<ArrowUpRight className="w-3.5 h-3.5" />}
                onClick={() => onNavigate('startups')}
              >
                View all startups
              </Button>
            }
          />
          <div className="divide-y divide-slate-800/60 text-xs">
            {recentStartups.map((s) => (
              <div
                key={s.id}
                onClick={() => onNavigate('startups', s.id)}
                className="py-3 px-1 hover:bg-slate-800/30 rounded flex items-center justify-between gap-3 cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100">{s.name}</span>
                    <Badge variant="purple" size="sm">
                      {s.stage}
                    </Badge>
                    <span className="text-slate-500 font-mono text-[11px] truncate hidden sm:inline">
                      {s.domain}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] truncate mt-0.5 max-w-md">
                    {s.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-slate-300 font-mono font-medium">{s.totalFunding}</span>
                  <p className="text-[10px] text-slate-500 font-mono">{s.employees} emp</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 5: Source Activity */}
        <Card>
          <CardHeader
            title="Monitored Source Endpoints"
            subtitle="High-frequency crawler health and error metrics"
            action={
              <Button
                variant="ghost"
                size="xs"
                iconRight={<ArrowUpRight className="w-3.5 h-3.5" />}
                onClick={() => onNavigate('sources')}
              >
                View all sources
              </Button>
            }
          />
          <div className="divide-y divide-slate-800/60 text-xs">
            {sources.map((src) => (
              <div
                key={src.id}
                onClick={() => onNavigate('sources')}
                className="py-3 px-1 hover:bg-slate-800/30 rounded flex items-center justify-between gap-3 cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100">{src.name}</span>
                    <Badge
                      variant={
                        src.status === 'Healthy'
                          ? 'success'
                          : src.status === 'Active'
                          ? 'info'
                          : 'warning'
                      }
                      size="sm"
                      dot
                    >
                      {src.status}
                    </Badge>
                  </div>
                  <p className="text-slate-500 text-[11px] font-mono truncate mt-0.5">
                    {src.parserType} • {src.crawlFrequency} • {src.lastCrawl}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-slate-300 font-mono font-medium">
                    {src.recordsFound} records
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono">{src.errorRate}% err</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Section 6 & 7: LLM Provider Health & Recent Pipeline Runs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 6: LLM Provider Health */}
        <Card className="lg:col-span-1">
          <CardHeader
            title="LLM Extraction Engine"
            subtitle="Provider status & token latency"
            action={
              <Button
                variant="ghost"
                size="xs"
                iconRight={<Cpu className="w-3.5 h-3.5" />}
                onClick={() => onNavigate('llm-engine')}
              >
                Engine
              </Button>
            }
          />
          <div className="space-y-3">
            {llmProviders.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono ml-2">({p.role})</span>
                  </div>
                  <Badge variant="success" size="sm" dot>
                    {p.status}
                  </Badge>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-mono pt-2 border-t border-slate-800/60">
                  <div>
                    <p className="text-slate-500 text-[10px]">Latency</p>
                    <p className="text-slate-300 font-semibold">{p.avgLatencyMs}ms</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px]">Success</p>
                    <p className="text-emerald-400 font-semibold">{p.successRate}%</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px]">24h Volume</p>
                    <p className="text-slate-300 font-semibold">
                      {(p.requests24h / 1000).toFixed(0)}k
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 7: Recent Pipeline Runs */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent Pipeline Executions"
            subtitle="Completed crawl & extraction batch telemetry"
            action={
              <Button
                variant="ghost"
                size="xs"
                iconRight={<ArrowUpRight className="w-3.5 h-3.5" />}
                onClick={() => onNavigate('pipeline')}
              >
                All Runs
              </Button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Run ID</th>
                  <th className="py-2.5 px-3 font-semibold">Source</th>
                  <th className="py-2.5 px-3 font-semibold">Model</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Records</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Duration</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {pipelineRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-blue-400">#{run.runNumber}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-200 truncate max-w-[180px]">
                      {run.source}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate">
                      {run.llmModelUsed}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-200">
                      {run.records}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">{run.durationSeconds}s</td>
                    <td className="py-2.5 px-3 text-right">
                      <Badge variant="success" size="sm">
                        {run.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
