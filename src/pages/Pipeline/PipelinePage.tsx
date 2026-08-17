import React, { useState, useEffect } from 'react';
import {
  Workflow,
  Play,
  Pause,
  Square,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cpu,
  ArrowRight,
  Database,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { PipelineStage, PipelineRun } from '../../types';
import { apiService } from '../../services/api';
import { useToast } from '../../components/ui/ToastContext';

export const PipelinePage: React.FC = () => {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [controlling, setControlling] = useState(false);
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);

  const toast = useToast();

  const loadPipelineData = async () => {
    setLoading(true);
    try {
      const [stageList, summaryData, runsList] = await Promise.all([
        apiService.getPipelineStages(),
        apiService.getPipelineSummary(),
        apiService.getPipelineRuns()
      ]);
      setStages(stageList);
      setSummary(summaryData);
      setRuns(runsList);
      if (!selectedStage && stageList.length > 0) {
        setSelectedStage(stageList[0]);
      }
    } catch (err) {
      console.error('Failed to load pipeline data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPipelineData();
  }, []);

  const handlePipelineAction = async (action: 'START' | 'PAUSE' | 'STOP') => {
    setControlling(true);
    try {
      const res = await apiService.controlPipeline(action);
      toast.success(
        `Pipeline Signal: ${action}`,
        `Operational orchestration state updated to ${res.status}.`
      );
      loadPipelineData();
    } catch (err) {
      toast.error('Control Signal Failed', 'Could not transmit control packet.');
    } finally {
      setControlling(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Main Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Ecosystem Ingestion Pipeline</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-stage streaming orchestrator with zero-drop queuing and neural extraction checkpoints.
          </p>
        </div>

        {/* Global Control Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant={summary?.pipelineState === 'ACTIVE' ? 'primary' : 'secondary'}
            size="sm"
            loading={controlling}
            icon={<Play className="w-3.5 h-3.5 fill-current" />}
            onClick={() => handlePipelineAction('START')}
          >
            Start Pipeline
          </Button>
          <Button
            variant={summary?.pipelineState === 'PAUSED' ? 'outline' : 'secondary'}
            size="sm"
            loading={controlling}
            icon={<Pause className="w-3.5 h-3.5" />}
            onClick={() => handlePipelineAction('PAUSE')}
          >
            Pause
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={controlling}
            icon={<Square className="w-3.5 h-3.5 fill-current" />}
            onClick={() => handlePipelineAction('STOP')}
          >
            Stop
          </Button>
        </div>
      </div>

      {/* Top Pipeline Health KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          label="Ingestion Queue"
          value={summary ? `${summary.queueSize.toLocaleString()} items` : '3,570 items'}
          subtext="Distributed Redis Pool"
          icon={<Layers className="w-4 h-4" />}
          iconBgColor="bg-blue-500/10 text-blue-400 border-blue-500/20"
        />
        <StatCard
          label="Throughput"
          value={summary ? `${summary.throughputPerMinute.toLocaleString()}/min` : '1,420/min'}
          subtext="Avg across 7 stages"
          icon={<Zap className="w-4 h-4" />}
          iconBgColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        />
        <StatCard
          label="Pipeline Success Rate"
          value={summary ? `${summary.successRate}%` : '99.4%'}
          subtext="Zero-data loss target"
          icon={<CheckCircle2 className="w-4 h-4" />}
          iconBgColor="bg-purple-500/10 text-purple-400 border-purple-500/20"
        />
        <StatCard
          label="Last Successful Run"
          value={summary ? summary.lastSuccessfulRun : '2m ago'}
          subtext="Continuous Ingestion"
          icon={<Clock className="w-4 h-4" />}
          iconBgColor="bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
        />
      </div>

      {/* Active Run Telemetry Banner */}
      {summary?.currentRun && (
        <Card className="border-blue-500/30 bg-blue-950/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-100 font-mono">
                    ACTIVE EXECUTION: #{summary.currentRun.id}
                  </span>
                  <Badge variant="success" size="sm" dot>
                    In Progress
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Currently executing stage:{' '}
                  <span className="text-blue-400 font-semibold font-mono">
                    {summary.currentRun.activeStage}
                  </span>{' '}
                  ({summary.currentRun.processedItems} / {summary.currentRun.totalQueued} items)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 min-w-[200px]">
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Progress</span>
                  <span className="text-slate-200 font-semibold">
                    {summary.currentRun.progressPercent}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${summary.currentRun.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Visual 7-Stage Pipeline Flow */}
      <Card>
        <CardHeader
          title="Interactive 7-Stage Pipeline Architecture"
          subtitle="Click any stage below to inspect active queues, micro-latencies, and schema assertions"
        />

        <div className="space-y-4 pt-2">
          {/* Visual Stage Pipeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5">
            {stages.map((stage, idx) => {
              const isSelected = selectedStage?.id === stage.id;
              return (
                <div
                  key={stage.id}
                  onClick={() => setSelectedStage(stage)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                    isSelected
                      ? 'bg-slate-800/90 border-blue-500 ring-1 ring-blue-500/50 shadow-lg'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700/80 hover:bg-slate-900/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-slate-500">STAGE 0{stage.order}</span>
                      <Badge
                        variant={
                          stage.status === 'running'
                            ? 'success'
                            : stage.status === 'completed'
                            ? 'neutral'
                            : 'warning'
                        }
                        size="sm"
                        dot={stage.status === 'running'}
                      >
                        {stage.status}
                      </Badge>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100">{stage.name}</h4>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-800/80 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Rate:</span>
                      <span className="text-slate-200 font-semibold">{stage.processingRatePerSec}/s</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Queue:</span>
                      <span className="text-slate-200">{stage.recordsInQueue}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Latency:</span>
                      <span className="text-emerald-400">{stage.lastDurationMs}ms</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Stage Detail Panel */}
          {selectedStage && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-100 font-mono">
                    Stage #{selectedStage.order}: {selectedStage.name}
                  </span>
                  <Badge variant="info" size="sm">
                    {selectedStage.healthScore}% Health
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">{selectedStage.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                <div className="bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Processed</span>
                  <span className="text-slate-200 font-bold text-sm">
                    {selectedStage.recordsProcessed.toLocaleString()}
                  </span>
                </div>
                <div className="bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Errors</span>
                  <span className="text-rose-400 font-bold text-sm">
                    {selectedStage.errorsCount}
                  </span>
                </div>
                <div className="bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Micro-duration</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {selectedStage.lastDurationMs}ms
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Recent Pipeline Runs Table */}
      <Card>
        <CardHeader
          title="Historic Ingestion & Extraction Batch Runs"
          subtitle="Audit log of completed crawler and transformation batches"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">Run Number</th>
                <th className="py-2.5 px-4 font-semibold">Ingestion Source</th>
                <th className="py-2.5 px-4 font-semibold">LLM Extractor</th>
                <th className="py-2.5 px-4 font-semibold text-right">Records Found</th>
                <th className="py-2.5 px-4 font-semibold text-right">Valid Records</th>
                <th className="py-2.5 px-4 font-semibold text-right">Duration</th>
                <th className="py-2.5 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {runs.map((run) => (
                <tr key={run.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-400">#{run.runNumber}</td>
                  <td className="py-3 px-4 font-sans text-slate-200">{run.source}</td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">{run.llmModelUsed}</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-200">
                    {run.records}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-semibold">
                    {run.validRecords}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">{run.durationSeconds}s</td>
                  <td className="py-3 px-4 text-right">
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
  );
};
