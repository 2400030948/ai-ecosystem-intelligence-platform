import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Layers,
  Zap,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { apiService } from '../../services/api';
import { IngestionTimePoint } from '../../types';

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('7D');
  const [timeline, setTimeline] = useState<IngestionTimePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await apiService.getIngestionTimeline();
        setTimeline(data);
      } catch (err) {
        console.error('Failed to load analytics timeline', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [timeRange]);

  const categoryDistribution = [
    { name: 'Research Preprints', count: 6540, fill: '#3b82f6' },
    { name: 'AI Products & APIs', count: 3890, fill: '#10b981' },
    { name: 'Frontier Startups', count: 1428, fill: '#a855f7' },
    { name: 'AI News Articles', count: 1120, fill: '#f59e0b' },
    { name: 'Fresh AI Roles', count: 842, fill: '#ec4899' }
  ];

  const sourceThroughput = [
    { name: 'ArXiv cs.AI', records: 18450, errorRate: 0.1 },
    { name: 'Hugging Face', records: 14200, errorRate: 0.3 },
    { name: 'GitHub Repos', records: 9800, errorRate: 0.8 },
    { name: 'Greenhouse/Lever', records: 6400, errorRate: 0.4 },
    { name: 'Venture Filings', records: 4120, errorRate: 1.2 },
    { name: 'TechCrunch RSS', records: 3950, errorRate: 0.2 }
  ];

  const modelLatencyBenchmark = [
    { name: 'Gemini 2.5 Flash', latency: 42, accuracy: 99.6 },
    { name: 'Groq LLaMA 3.3 70B', latency: 68, accuracy: 98.9 },
    { name: 'DeepSeek V3', latency: 94, accuracy: 99.2 }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Ecosystem Intelligence Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Global AI velocity, multi-source ingestion metrics, extraction accuracy, and latency benchmarks.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {(['7D', '30D', '90D'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-colors ${
                timeRange === r
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          label="Total Entities Ingested"
          value="13,820"
          change={14.8}
          trendLabel="period"
          icon={<Layers className="w-4 h-4" />}
          iconBgColor="bg-blue-500/10 text-blue-400 border-blue-500/20"
        />
        <StatCard
          label="Crawl Success Rate"
          value="99.7%"
          change={0.2}
          trendLabel="uptime"
          icon={<CheckCircle2 className="w-4 h-4" />}
          iconBgColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        />
        <StatCard
          label="Avg Extraction Latency"
          value="48ms"
          change={-12.5}
          trendLabel="faster"
          icon={<Zap className="w-4 h-4" />}
          iconBgColor="bg-purple-500/10 text-purple-400 border-purple-500/20"
        />
        <StatCard
          label="Schema Validation Rate"
          value="99.4%"
          change={0.3}
          trendLabel="precision"
          icon={<Activity className="w-4 h-4" />}
          iconBgColor="bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ingestion Velocity */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Multi-Domain Ingestion Velocity"
            subtitle="Hourly distribution of captured entities across research, products, startups, jobs, and news"
          />
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="anColorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
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
                    color: '#f8fafc'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total Ingested"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#anColorTotal)"
                />
                <Area
                  type="monotone"
                  dataKey="startups"
                  name="Startups"
                  stroke="#a855f7"
                  strokeWidth={1.5}
                  fill="none"
                />
                <Area
                  type="monotone"
                  dataKey="products"
                  name="Products"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  fill="none"
                />
                <Area
                  type="monotone"
                  dataKey="jobs"
                  name="Jobs"
                  stroke="#ec4899"
                  strokeWidth={1.5}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Ratio Pie */}
        <Card>
          <CardHeader
            title="Entity Category Ratio"
            subtitle="Current active normalized database records"
          />
          <div className="h-72 w-full flex flex-col justify-between">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {categoryDistribution.map((entry, index) => (
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

            <div className="space-y-1 pt-2 border-t border-slate-800 text-xs font-mono">
              {categoryDistribution.map((item) => (
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

      {/* Dual Row: Source Ingestion Volume & Model Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Ingestion Volume */}
        <Card>
          <CardHeader
            title="Source Ingestion Volume (Records Captured)"
            subtitle="Top performing feeds and web scrapers"
          />
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceThroughput} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Bar dataKey="records" name="Records Captured" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Model Accuracy & Latency */}
        <Card>
          <CardHeader
            title="LLM Extractor Latency vs Accuracy"
            subtitle="Evaluation benchmarks for structured schema generation"
          />
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={modelLatencyBenchmark}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Bar dataKey="latency" name="Latency (ms)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
