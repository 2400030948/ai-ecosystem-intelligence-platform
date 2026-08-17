import {
  Startup,
  Product,
  ResearchPaper,
  Job,
  NewsItem,
  EntityMapping,
  Source,
  PipelineStage,
  PipelineRun,
  LLMProvider,
  DashboardStats,
  PlatformSettings,
  SystemSettings,
  ExtractionResult,
  IngestionTimePoint
} from '../types';
import { mockStartups } from '../data/mockStartups';
import { mockProducts } from '../data/mockProducts';
import { mockResearchPapers } from '../data/mockResearchPapers';
import { mockJobs } from '../data/mockJobs';
import { mockNews } from '../data/mockNews';
import { mockEntityMappings } from '../data/mockEntityMappings';
import { mockSources } from '../data/mockSources';
import { mockPipelineStages, mockPipelineRuns, mockPipelineSummary } from '../data/mockPipeline';
import { mockLLMProviders, mockLLMActivity } from '../data/mockLLMProviders';
import {
  mockDashboardStats,
  mockIngestionTimeline,
  mockEntityDistribution,
  mockSourcePerformance,
  mockProcessingLatency,
  mockConfidenceDistribution,
  mockExtractionSuccessTrends
} from '../data/mockAnalytics';
import { mockDefaultSettings } from '../data/mockSettings';

/**
 * AI Intelligence Platform - API Service Layer
 * Designed for immediate mock operation and clean transition to FastAPI endpoints.
 */

const delay = (ms: number = 100) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory writable states for mutations
let startupsState: Startup[] = [...mockStartups];
let productsState: Product[] = [...mockProducts];
let papersState: ResearchPaper[] = [...mockResearchPapers];
let jobsState: Job[] = [...mockJobs];
let newsState: NewsItem[] = [...mockNews];
let entityMappingsState: EntityMapping[] = [...mockEntityMappings];
let sourcesState: Source[] = [...mockSources];
let pipelineStagesState: PipelineStage[] = [...mockPipelineStages];
let pipelineRunsState: PipelineRun[] = [...mockPipelineRuns];
let pipelineSummaryState = { ...mockPipelineSummary };
let settingsState: PlatformSettings = { ...mockDefaultSettings };
let systemSettingsState: SystemSettings = {
  llmConfigs: {
    primaryModel: 'gemini-2.5-flash',
    fallbackModel: 'groq-llama-3.3-70b',
    temperature: 0.1,
    maxTokens: 2048,
    timeoutMs: 8000
  },
  crawlerConfigs: {
    maxConcurrency: 16,
    rateLimitPerDomain: 5,
    crawlIntervalMinutes: 15,
    maxRetries: 3
  },
  resolutionConfigs: {
    autoMergeThreshold: 0.9,
    reviewThreshold: 0.75,
    enableVectorSearch: true
  },
  storageConfigs: {
    rawPayloadRetentionDays: 30,
    auditLogRetentionDays: 90
  }
};

export const apiService = {
  // Dashboard & Metrics
  async getDashboardStats(): Promise<DashboardStats> {
    await delay(80);
    return { ...mockDashboardStats };
  },

  async getIngestionTimeline(): Promise<IngestionTimePoint[]> {
    await delay(80);
    return [...mockIngestionTimeline];
  },

  async getEntityDistribution() {
    await delay(50);
    return [...mockEntityDistribution];
  },

  // Startups
  async getStartups(params?: {
    query?: string;
    stage?: string;
    status?: string;
    sortBy?: keyof Startup;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
  }): Promise<{ items: Startup[]; total: number }> {
    await delay(90);
    let items = [...startupsState];

    if (params?.query) {
      const q = params.query.toLowerCase();
      items = items.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.domain.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.primaryTags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (params?.stage && params.stage !== 'ALL') {
      items = items.filter((s) => s.stage === params.stage);
    }

    if (params?.status && params.status !== 'ALL') {
      items = items.filter((s) => s.status === params.status);
    }

    if (params?.sortBy) {
      const field = params.sortBy;
      const order = params.sortOrder === 'desc' ? -1 : 1;
      items.sort((a, b) => {
        const valA = a[field] ?? '';
        const valB = b[field] ?? '';
        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * order;
        }
        return String(valA).localeCompare(String(valB)) * order;
      });
    }

    const total = items.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

    return { items: paginatedItems, total };
  },

  async getStartupById(id: string): Promise<Startup | undefined> {
    await delay(50);
    return startupsState.find((s) => s.id === id);
  },

  // Products
  async getProducts(params?: {
    query?: string;
    pricingModel?: string;
    category?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: Product[]; total: number }> {
    await delay(90);
    let items = [...productsState];

    if (params?.query) {
      const q = params.query.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.startupName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (params?.pricingModel && params.pricingModel !== 'ALL') {
      items = items.filter((p) => p.pricingModel === params.pricingModel);
    }

    if (params?.category && params.category !== 'ALL') {
      items = items.filter((p) => p.category === params.category);
    }

    const total = items.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total
    };
  },

  // Research Papers
  async getResearchPapers(params?: {
    query?: string;
    category?: string;
    minStars?: number;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: ResearchPaper[]; total: number }> {
    await delay(90);
    let items = [...papersState];

    if (params?.query) {
      const q = params.query.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.authors.some((a) => a.toLowerCase().includes(q)) ||
          p.abstract.toLowerCase().includes(q)
      );
    }

    if (params?.category && params.category !== 'ALL') {
      items = items.filter((p) => p.categories.includes(params.category!));
    }

    if (params?.minStars) {
      items = items.filter((p) => p.githubStars >= params.minStars!);
    }

    const total = items.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total
    };
  },

  // Jobs
  async getJobs(params?: {
    query?: string;
    roleFamily?: string;
    remoteOnly?: boolean;
    within24hOnly?: boolean;
    company?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: Job[]; total: number }> {
    await delay(80);
    let items = [...jobsState];

    if (params?.query) {
      const q = params.query.toLowerCase();
      items = items.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.techStack.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (params?.roleFamily && params.roleFamily !== 'ALL') {
      items = items.filter((j) => j.roleFamily === params.roleFamily);
    }

    if (params?.remoteOnly) {
      items = items.filter((j) => j.remote);
    }

    if (params?.within24hOnly) {
      items = items.filter((j) => j.isWithin24Hours);
    }

    if (params?.company && params.company !== 'ALL') {
      items = items.filter((j) => j.company === params.company);
    }

    const total = items.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total
    };
  },

  // News
  async getNews(params?: {
    query?: string;
    category?: string;
    freshOnly?: boolean;
    source?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: NewsItem[]; total: number }> {
    await delay(80);
    let items = [...newsState];

    if (params?.query) {
      const q = params.query.toLowerCase();
      items = items.filter(
        (n) =>
          n.headline.toLowerCase().includes(q) ||
          n.summary.toLowerCase().includes(q) ||
          n.source.toLowerCase().includes(q)
      );
    }

    if (params?.category && params.category !== 'ALL') {
      items = items.filter((n) => n.category === params.category);
    }

    if (params?.freshOnly) {
      items = items.filter((n) => n.isFresh);
    }

    if (params?.source && params.source !== 'ALL') {
      items = items.filter((n) => n.source === params.source);
    }

    const total = items.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total
    };
  },

  // Entity Resolution
  async getEntityMappings(params?: {
    query?: string;
    confidenceTier?: string;
    status?: string;
    entityType?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: EntityMapping[]; total: number }> {
    await delay(80);
    let items = [...entityMappingsState];

    if (params?.query) {
      const q = params.query.toLowerCase();
      items = items.filter(
        (m) =>
          m.rawName.toLowerCase().includes(q) ||
          m.canonicalName.toLowerCase().includes(q) ||
          m.source.toLowerCase().includes(q)
      );
    }

    if (params?.confidenceTier && params.confidenceTier !== 'ALL') {
      items = items.filter((m) => m.confidenceTier === params.confidenceTier);
    }

    if (params?.status && params.status !== 'ALL') {
      items = items.filter((m) => m.status === params.status);
    }

    if (params?.entityType && params.entityType !== 'ALL') {
      items = items.filter((m) => m.entityType === params.entityType);
    }

    const total = items.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    return {
      items: items.slice((page - 1) * pageSize, page * pageSize),
      total
    };
  },

  async resolveEntity(id: string, canonicalName: string): Promise<EntityMapping> {
    await delay(120);
    entityMappingsState = entityMappingsState.map((m) =>
      m.id === id ? { ...m, canonicalName, status: 'Confirmed' as const, confidence: 1.0, confidenceTier: 'High' as const } : m
    );
    const updated = entityMappingsState.find((m) => m.id === id);
    if (!updated) throw new Error('Entity mapping not found');
    return updated;
  },

  // Sources
  async getSources(params?: {
    query?: string;
    type?: string;
    status?: string;
  }): Promise<Source[]> {
    await delay(80);
    let items = [...sourcesState];

    if (params?.query) {
      const q = params.query.toLowerCase();
      items = items.filter((s) => s.name.toLowerCase().includes(q) || s.url.toLowerCase().includes(q));
    }

    if (params?.type && params.type !== 'ALL') {
      items = items.filter((s) => s.type === params.type);
    }

    if (params?.status && params.status !== 'ALL') {
      items = items.filter((s) => s.status === params.status);
    }

    return items;
  },

  async triggerSourceCrawl(sourceId: string): Promise<{ success: boolean; message: string }> {
    await delay(200);
    sourcesState = sourcesState.map((s) =>
      s.id === sourceId ? { ...s, lastCrawl: 'Just now', status: 'Active' as const } : s
    );
    return { success: true, message: `Dispatched asynchronous ingestion job for source #${sourceId}` };
  },

  // Pipeline
  async getPipelineStages(): Promise<PipelineStage[]> {
    await delay(70);
    return [...pipelineStagesState];
  },

  async getPipelineSummary() {
    await delay(50);
    return { ...pipelineSummaryState };
  },

  async getPipelineRuns(): Promise<PipelineRun[]> {
    await delay(80);
    return [...pipelineRunsState];
  },

  async controlPipeline(action: 'START' | 'PAUSE' | 'STOP'): Promise<{ status: string }> {
    await delay(150);
    if (action === 'START') {
      pipelineSummaryState.pipelineState = 'ACTIVE';
      pipelineStagesState = pipelineStagesState.map((s) => ({ ...s, status: 'running' }));
    } else if (action === 'PAUSE') {
      pipelineSummaryState.pipelineState = 'PAUSED';
      pipelineStagesState = pipelineStagesState.map((s) => ({ ...s, status: 'paused' }));
    } else {
      pipelineSummaryState.pipelineState = 'STOPPED';
      pipelineStagesState = pipelineStagesState.map((s) => ({ ...s, status: 'idle' }));
    }
    return { status: pipelineSummaryState.pipelineState };
  },

  // LLM Providers & Telemetry
  async getLLMProviders(): Promise<LLMProvider[]> {
    await delay(80);
    return [...mockLLMProviders];
  },

  async getLLMActivity() {
    await delay(60);
    return [...mockLLMActivity];
  },

  async testLLMExtraction(
    rawText: string,
    targetSchema: string,
    modelName: string
  ): Promise<ExtractionResult> {
    await delay(220);

    let extractedJson: Record<string, any> = {};

    if (targetSchema === 'startup') {
      extractedJson = {
        name: 'Cognition AI',
        legal_name: 'Cognition Labs Inc.',
        stage: 'Series B',
        valuation: '$2.0B',
        funding_round_size: '$175M',
        lead_investor: 'Founders Fund',
        flagship_product: 'Devin',
        domain: 'cognition.ai',
        headquarters: 'San Francisco, CA',
        target_market: 'Software Engineering Agents'
      };
    } else if (targetSchema === 'product') {
      extractedJson = {
        product_name: 'Devin',
        maker: 'Cognition AI',
        pricing_model: 'ENTERPRISE',
        category: 'Code Intelligence',
        deployment_type: 'Managed Cloud Sandbox',
        core_capabilities: [
          'Autonomous repository comprehension',
          'End-to-end bug isolation and resolution',
          'Test suite synthesis & execution'
        ]
      };
    } else if (targetSchema === 'research') {
      extractedJson = {
        paper_title: 'Evaluating Autonomous Software Engineering on SWE-bench',
        authors: ['Scott Wu', 'Walden Yan', 'Steven Hao'],
        github_repo: 'https://github.com/cognition-labs/evals',
        verified_benchmarks: [
          { name: 'SWE-bench Verified', score: '48.6%', metric: 'Resolved Issues' }
        ]
      };
    } else if (targetSchema === 'job') {
      extractedJson = {
        company: 'Cognition AI',
        title: 'Research Engineer - Agentic Systems',
        role_family: 'ML Engineering',
        location: 'San Francisco, CA',
        remote: true,
        experience_level: 'Senior / Staff',
        compensation_range: '$220,000 - $380,000 + Equity'
      };
    } else {
      extractedJson = {
        headline: 'Cognition AI Raises $175M Series B at $2B Valuation',
        category: 'Funding',
        sentiment: 'Positive',
        referenced_entities: ['Cognition AI', 'Devin', 'Founders Fund']
      };
    }

    return {
      latencyMs: modelName.includes('groq') ? 38 : modelName.includes('gemini') ? 44 : 86,
      confidence: 0.98,
      modelUsed: modelName,
      tokensConsumed: 418,
      extractedJson,
      schemaType: targetSchema
    };
  },

  // Analytics
  async getAnalyticsData() {
    await delay(90);
    return {
      timeline: mockIngestionTimeline,
      entityDistribution: mockEntityDistribution,
      sourcePerformance: mockSourcePerformance,
      processingLatency: mockProcessingLatency,
      confidenceDistribution: mockConfidenceDistribution,
      extractionTrends: mockExtractionSuccessTrends
    };
  },

  // Settings
  async getSettings(): Promise<SystemSettings> {
    await delay(60);
    return { ...systemSettingsState };
  },

  async updateSettings(newSettings: Partial<SystemSettings>): Promise<SystemSettings> {
    await delay(120);
    systemSettingsState = {
      ...systemSettingsState,
      ...newSettings,
      llmConfigs: { ...systemSettingsState.llmConfigs, ...newSettings.llmConfigs },
      crawlerConfigs: { ...systemSettingsState.crawlerConfigs, ...newSettings.crawlerConfigs },
      resolutionConfigs: { ...systemSettingsState.resolutionConfigs, ...newSettings.resolutionConfigs },
      storageConfigs: { ...systemSettingsState.storageConfigs, ...newSettings.storageConfigs }
    };
    return { ...systemSettingsState };
  },

  async getPlatformSettings(): Promise<PlatformSettings> {
    await delay(60);
    return { ...settingsState };
  }
};
