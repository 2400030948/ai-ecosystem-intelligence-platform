export type EntityType = 'Startup' | 'Product' | 'ResearchPaper' | 'Job' | 'News' | 'Person' | 'Model';

export type PricingModel = 'FREE' | 'FREEMIUM' | 'PAID' | 'ENTERPRISE';

export type ConfidenceLevel = 'High' | 'Medium' | 'Review';

export type PipelineStageName = 
  | 'Crawler'
  | 'Raw Content'
  | 'Freshness Filter'
  | 'LLM Extraction'
  | 'Validation'
  | 'Entity Resolution'
  | 'Storage';

export type StageStatus = 'idle' | 'running' | 'completed' | 'degraded' | 'error' | 'paused';

export type SourceType = 'Research' | 'News' | 'Jobs' | 'Startups' | 'Products';

export type SourceStatus = 'Healthy' | 'Active' | 'Degraded' | 'Failing' | 'Paused';

export interface Startup {
  id: string;
  name: string;
  legalName?: string;
  domain: string;
  employees: string;
  headquarters: string;
  foundedYear: number;
  stage: string;
  source: string;
  sourceUrl: string;
  collectedAt: string;
  status: 'Active' | 'Verified' | 'Pending Enrichment' | 'Flagged';
  description: string;
  primaryTags: string[];
  totalFunding?: string;
  relatedProducts: {
    id: string;
    name: string;
    pricingModel: PricingModel;
  }[];
  resolutionInfo: {
    rawAliases: string[];
    confidence: number;
    resolvedAt: string;
  };
}

export interface Product {
  id: string;
  name: string;
  startupName: string;
  startupId: string;
  pricingModel: PricingModel;
  category: string;
  source: string;
  sourceUrl: string;
  collectedAt: string;
  status: 'Live' | 'Beta' | 'Deprecated';
  description: string;
  features: string[];
  deploymentType: 'Cloud' | 'On-Prem' | 'API' | 'Open Source' | 'Hybrid';
  targetAudience: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  primaryAuthorAffiliation: string;
  publishedDate: string;
  arxivId?: string;
  paperUrl: string;
  githubUrl?: string;
  githubStars: number;
  githubStarsDelta7d?: number;
  source: string;
  abstract: string;
  benchmarks: { name: string; score: string; metric: string }[];
  categories: string[];
  citationsCount: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyId?: string;
  roleFamily: 'Research' | 'ML Engineering' | 'Infrastructure' | 'Data Science' | 'Product' | 'Founding Engineer';
  location: string;
  remote: boolean;
  salaryRange?: string;
  publishedAt: string;
  freshnessLabel: string;
  hoursAgo: number;
  isWithin24Hours: boolean;
  source: string;
  sourceUrl: string;
  techStack: string[];
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Staff/Principal' | 'Lead';
}

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  sourceDomain: string;
  url: string;
  publishedAt: string;
  freshnessLabel: string;
  hoursAgo: number;
  isFresh: boolean;
  category: 'Model Release' | 'Funding' | 'Research Breakthrough' | 'Policy & Safety' | 'Hardware' | 'Acquisition';
  sentiment: 'Positive' | 'Neutral' | 'Critical';
  referencedEntities: string[];
}

export interface EntityMapping {
  id: string;
  rawName: string;
  canonicalName: string;
  entityType: EntityType;
  confidence: number;
  confidenceTier: ConfidenceLevel;
  source: string;
  sourceUrl?: string;
  sourceRecordId: string;
  discoveredAt: string;
  status: 'Auto Resolved' | 'Manual Review' | 'Flagged Discrepancy' | 'Confirmed';
  matchCriteria: string[];
  alternateCandidates?: { name: string; score: number }[];
}

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  url: string;
  status: SourceStatus;
  lastCrawl: string;
  crawlFrequency: string;
  recordsFound: number;
  totalRecordsIngested: number;
  errorRate: number;
  avgLatencyMs: number;
  parserType: 'RSS' | 'API' | 'Scraper' | 'ArXiv Feed' | 'Sitemap';
}

export interface PipelineStage {
  id: string;
  name: PipelineStageName;
  order: number;
  status: StageStatus;
  recordsProcessed: number;
  recordsInQueue: number;
  processingRatePerSec: number;
  errorsCount: number;
  lastDurationMs: number;
  healthScore: number;
  description: string;
}

export interface PipelineRun {
  id: string;
  runNumber: number;
  source: string;
  sourceId: string;
  records: number;
  validRecords: number;
  rejectedRecords: number;
  durationSeconds: number;
  startedAt: string;
  completedAt?: string;
  status: 'Completed' | 'Running' | 'Failed' | 'Interrupted';
  llmModelUsed: string;
  errorDetails?: string;
}

export interface LLMProvider {
  id: string;
  name: string;
  provider: 'Google' | 'Groq' | 'DeepSeek' | 'Anthropic' | 'OpenAI';
  model: string;
  role: 'Primary' | 'Fallback 1' | 'Fallback 2' | 'Specialized';
  status: 'Operational' | 'Degraded' | 'Rate Limited' | 'Offline';
  requests24h: number;
  successRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  rateLimitStatus: {
    rpmUsed: number;
    rpmLimit: number;
    tpmUsed: number;
    tpmLimit: number;
    percentage: number;
  };
  lastError?: {
    code: string;
    message: string;
    timestamp: string;
  };
  costPer1kTokens: string;
}

export interface DashboardStats {
  startupsCount: number;
  startupsGrowth: number;
  productsCount: number;
  productsGrowth: number;
  papersCount: number;
  papersGrowth: number;
  freshJobsCount: number;
  freshJobsGrowth: number;
  freshNewsCount: number;
  freshNewsGrowth: number;
  recordsProcessedToday: number;
  recordsGrowth: number;
  extractionSuccessRate: number;
  extractionSuccessDelta: number;
  activeSourcesCount: number;
  totalSourcesCount: number;
}

export interface IngestionTimePoint {
  time: string;
  timestamp: string;
  startups: number;
  products: number;
  papers: number;
  jobs: number;
  news: number;
  total: number;
}

export interface PlatformSettings {
  crawlConcurrency: number;
  crawlIntervalMinutes: number;
  autoStartPipeline: boolean;
  freshnessWindowHours: number;
  llmPrimaryProvider: string;
  llmFallbackChainEnabled: boolean;
  llmRequestTimeoutSec: number;
  llmMaxRetryAttempts: number;
  llmExtractionTemperature: number;
  entityConfidenceThreshold: number;
  autoApproveHighConfidence: boolean;
  databaseTelemetry: {
    status: 'Connected' | 'Degraded';
    poolSize: number;
    activeConnections: number;
    cacheHitRatio: number;
    storageUsedGb: number;
  };
}

export interface ExtractionResult {
  latencyMs: number;
  confidence: number;
  modelUsed: string;
  tokensConsumed: number;
  extractedJson: Record<string, any>;
  schemaType: string;
}

export interface SystemSettings {
  llmConfigs: {
    primaryModel: string;
    fallbackModel: string;
    temperature: number;
    maxTokens: number;
    timeoutMs: number;
  };
  crawlerConfigs: {
    maxConcurrency: number;
    rateLimitPerDomain: number;
    crawlIntervalMinutes: number;
    maxRetries: number;
  };
  resolutionConfigs: {
    autoMergeThreshold: number;
    reviewThreshold: number;
    enableVectorSearch: boolean;
  };
  storageConfigs: {
    rawPayloadRetentionDays: number;
    auditLogRetentionDays: number;
  };
}

