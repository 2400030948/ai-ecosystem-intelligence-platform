import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Code,
  Sparkles,
  Layers,
  Terminal,
  Copy,
  Check,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LLMProvider, ExtractionResult } from '../../types';
import { apiService } from '../../services/api';
import { useToast } from '../../components/ui/ToastContext';

export const LLMEnginePage: React.FC = () => {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [loading, setLoading] = useState(true);

  // Playground state
  const [sampleText, setSampleText] = useState(
    `Cognition AI announced their Series B funding of $175M led by Founders Fund, valuing the maker of Devin AI software engineer at $2.0B. Devin is currently available in private preview with enterprise pricing tiers.`
  );
  const [targetSchema, setTargetSchema] = useState<
    'startup' | 'product' | 'research' | 'job' | 'news'
  >('startup');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [copied, setCopied] = useState(false);

  const toast = useToast();

  useEffect(() => {
    async function loadProviders() {
      setLoading(true);
      try {
        const list = await apiService.getLLMProviders();
        setProviders(list);
      } catch (err) {
        console.error('Failed to load LLM providers', err);
      } finally {
        setLoading(false);
      }
    }
    loadProviders();
  }, []);

  const handleTestExtraction = async () => {
    if (!sampleText.trim()) return;
    setIsExtracting(true);
    try {
      const result = await apiService.testLLMExtraction(sampleText, targetSchema, selectedModel);
      setExtractionResult(result);
      toast.success(
        'Extraction Complete',
        `Extracted structured ${targetSchema} schema in ${result.latencyMs}ms with ${(
          result.confidence * 100
        ).toFixed(0)}% confidence.`
      );
    } catch (err) {
      toast.error('Extraction Failed', 'LLM parsing failed on raw content.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopyJson = () => {
    if (!extractionResult) return;
    navigator.clipboard.writeText(JSON.stringify(extractionResult.extractedJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">LLM Extraction Engine & Multi-Model Mesh</h1>
          <p className="text-xs text-slate-400 mt-1">
            Structured JSON schema transformation, fallback provider routing, latency benchmarking, and schema validators.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" size="md" dot>
            3 Active LLM Providers
          </Badge>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((p) => (
          <Card key={p.id} className="border-slate-800/80">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{p.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{p.model}</p>
                </div>
              </div>
              <Badge variant="success" size="sm" dot>
                {p.status}
              </Badge>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Routing Role:</span>
                <Badge variant={p.role === 'Primary Extractor' ? 'purple' : 'neutral'} size="sm">
                  {p.role}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-2">
                <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Latency</span>
                  <span className="text-slate-200 font-bold">{p.avgLatencyMs}ms</span>
                </div>
                <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Success</span>
                  <span className="text-emerald-400 font-bold">{p.successRate}%</span>
                </div>
                <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Daily Req</span>
                  <span className="text-slate-200 font-bold">
                    {(p.requests24h / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Interactive Extraction Testing Studio */}
      <Card>
        <CardHeader
          title="Interactive LLM Extraction Studio"
          subtitle="Test unstructured web crawl inputs against neural schema extraction pipelines in real-time"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Left Column: Input text & configurations */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Target Entity Schema
                </label>
                <select
                  value={targetSchema}
                  onChange={(e: any) => setTargetSchema(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="startup">Startup Schema (Funding, Domain, Legal)</option>
                  <option value="product">Product Schema (Pricing, Model, Category)</option>
                  <option value="research">Research Schema (arXiv, Benchmarks, Authors)</option>
                  <option value="job">Job Schema (Seniority, Salary, Tech Stack)</option>
                  <option value="news">News Schema (Sentiment, Entities, Category)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Extractor Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Default)</option>
                  <option value="groq-llama-3.3-70b">Groq LLaMA 3.3 70B</option>
                  <option value="deepseek-v3">DeepSeek V3</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">
                  Raw Ingested Text / HTML / Markdown
                </label>
                <span className="text-[11px] font-mono text-slate-500">
                  {sampleText.length} characters
                </span>
              </div>
              <textarea
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                rows={7}
                placeholder="Paste raw unformatted text, scrape dump, or HTML snippet..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono rounded-lg p-3 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setSampleText(
                      `Physical Intelligence raised $400M at a $2.4B valuation from Jeff Bezos, OpenAI, Thrive Capital and Lux Capital. The company is developing general-purpose foundation models for robotics manipulation based in San Francisco, CA.`
                    )
                  }
                  className="text-[11px] font-mono text-blue-400 hover:text-blue-300 underline"
                >
                  Load Sample Scrape
                </button>
              </div>

              <Button
                variant="primary"
                size="sm"
                loading={isExtracting}
                icon={<Play className="w-3.5 h-3.5 fill-current" />}
                onClick={handleTestExtraction}
              >
                Execute Extraction
              </Button>
            </div>
          </div>

          {/* Right Column: Output JSON & Telemetry */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Validated JSON Output
              </span>
              {extractionResult && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    {extractionResult.latencyMs}ms
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs font-mono text-blue-400">
                    {(extractionResult.confidence * 100).toFixed(0)}% confidence
                  </span>
                  <button
                    onClick={handleCopyJson}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors ml-1"
                    title="Copy JSON"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 min-h-[220px] max-h-[300px] overflow-y-auto">
              {extractionResult ? (
                <pre className="text-xs font-mono text-slate-200 leading-relaxed overflow-x-auto">
                  {JSON.stringify(extractionResult.extractedJson, null, 2)}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-500 py-12">
                  <Code className="w-8 h-8 text-slate-600 mb-2 opacity-60" />
                  <p>Click "Execute Extraction" to run the LLM transformation pipeline</p>
                </div>
              )}
            </div>

            {extractionResult && (
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Model: {extractionResult.modelUsed}</span>
                <span>Tokens Consumed: {extractionResult.tokensConsumed}</span>
                <span className="text-emerald-400 font-semibold">Validation: PASSED</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
