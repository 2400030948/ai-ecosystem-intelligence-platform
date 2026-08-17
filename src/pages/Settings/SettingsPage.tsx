import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Key,
  Shield,
  Sliders,
  Bell,
  Database,
  Cpu,
  RefreshCw,
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { SystemSettings } from '../../types';
import { apiService } from '../../services/api';
import { useToast } from '../../components/ui/ToastContext';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('llm');

  const toast = useToast();

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const data = await apiService.getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await apiService.updateSettings(settings);
      toast.success('Configuration Saved', 'Production pipeline settings successfully committed.');
    } catch (err) {
      toast.error('Save Failed', 'Failed to update system configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (!settings && loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading settings...</div>;
  }

  const tabs = [
    { id: 'llm', label: 'LLM Engine & Keys', icon: <Cpu className="w-4 h-4" /> },
    { id: 'crawler', label: 'Crawler & Queues', icon: <Globe className="w-4 h-4" /> },
    { id: 'resolution', label: 'Entity Resolution', icon: <Sliders className="w-4 h-4" /> },
    { id: 'storage', label: 'Storage & Retention', icon: <Database className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">System Configuration & Engine Settings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Global crawler rate-limits, LLM fallback hierarchies, entity disambiguation thresholds, and telemetry.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          loading={saving}
          icon={<Save className="w-3.5 h-3.5" />}
          onClick={handleSave}
        >
          Save All Changes
        </Button>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: LLM Engine & Keys */}
      {activeTab === 'llm' && settings && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="LLM Extractor & Routing Architecture"
              subtitle="Configure primary neural extraction engines and multi-provider failover routing"
            />
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Primary Extractor Model
                  </label>
                  <select
                    value={settings.llmConfigs.primaryModel}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        llmConfigs: { ...settings.llmConfigs, primaryModel: e.target.value }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended)</option>
                    <option value="groq-llama-3.3-70b">Groq LLaMA 3.3 70B</option>
                    <option value="deepseek-v3">DeepSeek V3</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Secondary Fallback Model
                  </label>
                  <select
                    value={settings.llmConfigs.fallbackModel}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        llmConfigs: { ...settings.llmConfigs, fallbackModel: e.target.value }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="groq-llama-3.3-70b">Groq LLaMA 3.3 70B</option>
                    <option value="deepseek-v3">DeepSeek V3</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Extraction Temperature
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={settings.llmConfigs.temperature}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        llmConfigs: {
                          ...settings.llmConfigs,
                          temperature: parseFloat(e.target.value) || 0.1
                        }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Max Output Tokens
                  </label>
                  <input
                    type="number"
                    value={settings.llmConfigs.maxTokens}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        llmConfigs: {
                          ...settings.llmConfigs,
                          maxTokens: parseInt(e.target.value, 10) || 2048
                        }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Timeout Threshold (ms)
                  </label>
                  <input
                    type="number"
                    value={settings.llmConfigs.timeoutMs}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        llmConfigs: {
                          ...settings.llmConfigs,
                          timeoutMs: parseInt(e.target.value, 10) || 8000
                        }
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Encrypted API Credentials Vault"
              subtitle="Environment secrets managed securely for external neural model endpoints"
            />
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200 block">GEMINI_API_KEY</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      Configured in Secrets Vault
                    </span>
                  </div>
                </div>
                <Badge variant="success" size="sm">
                  Active (Encrypted)
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200 block">GROQ_API_KEY</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      Configured in Secrets Vault
                    </span>
                  </div>
                </div>
                <Badge variant="success" size="sm">
                  Active (Encrypted)
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Crawler & Queues */}
      {activeTab === 'crawler' && settings && (
        <Card>
          <CardHeader
            title="Distributed Crawler & Concurrency Rate Limits"
            subtitle="Control worker thread pools, domain politeness delays, and automated crawl intervals"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Maximum Concurrent Scrapers
              </label>
              <input
                type="number"
                value={settings.crawlerConfigs.maxConcurrency}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    crawlerConfigs: {
                      ...settings.crawlerConfigs,
                      maxConcurrency: parseInt(e.target.value, 10) || 10
                    }
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Rate Limit per Domain (requests/second)
              </label>
              <input
                type="number"
                value={settings.crawlerConfigs.rateLimitPerDomain}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    crawlerConfigs: {
                      ...settings.crawlerConfigs,
                      rateLimitPerDomain: parseInt(e.target.value, 10) || 5
                    }
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Default Crawl Interval (Minutes)
              </label>
              <input
                type="number"
                value={settings.crawlerConfigs.crawlIntervalMinutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    crawlerConfigs: {
                      ...settings.crawlerConfigs,
                      crawlIntervalMinutes: parseInt(e.target.value, 10) || 15
                    }
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Max Retry Attempts per Ingestion
              </label>
              <input
                type="number"
                value={settings.crawlerConfigs.maxRetries}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    crawlerConfigs: {
                      ...settings.crawlerConfigs,
                      maxRetries: parseInt(e.target.value, 10) || 3
                    }
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Entity Resolution */}
      {activeTab === 'resolution' && settings && (
        <Card>
          <CardHeader
            title="Entity Disambiguation & Canonical Clustering"
            subtitle="Define fuzzy string distance weights and automated canonical merging thresholds"
          />
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Auto-Merge Confidence Threshold ({Math.round(settings.resolutionConfigs.autoMergeThreshold * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  value={settings.resolutionConfigs.autoMergeThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      resolutionConfigs: {
                        ...settings.resolutionConfigs,
                        autoMergeThreshold: parseFloat(e.target.value)
                      }
                    })
                  }
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Manual Review Trigger Threshold ({Math.round(settings.resolutionConfigs.reviewThreshold * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.4"
                  max="0.9"
                  step="0.01"
                  value={settings.resolutionConfigs.reviewThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      resolutionConfigs: {
                        ...settings.resolutionConfigs,
                        reviewThreshold: parseFloat(e.target.value)
                      }
                    })
                  }
                  className="w-full accent-purple-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Enable Vector Embedding Semantic Disambiguation
                </span>
                <span className="text-slate-500 text-[11px]">
                  Uses neural cosine similarity in addition to Levenshtein distance
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.resolutionConfigs.enableVectorSearch}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    resolutionConfigs: {
                      ...settings.resolutionConfigs,
                      enableVectorSearch: e.target.checked
                    }
                  })
                }
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Tab 4: Storage & Retention */}
      {activeTab === 'storage' && settings && (
        <Card>
          <CardHeader
            title="Data Retention & Raw Ingestion Archival"
            subtitle="Configure cold storage policies and automated pruning of raw HTML snapshots"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Raw HTML / Scrape Retention (Days)
              </label>
              <input
                type="number"
                value={settings.storageConfigs.rawPayloadRetentionDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    storageConfigs: {
                      ...settings.storageConfigs,
                      rawPayloadRetentionDays: parseInt(e.target.value, 10) || 30
                    }
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Audit Log Retention (Days)
              </label>
              <input
                type="number"
                value={settings.storageConfigs.auditLogRetentionDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    storageConfigs: {
                      ...settings.storageConfigs,
                      auditLogRetentionDays: parseInt(e.target.value, 10) || 90
                    }
                  })
                }
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
