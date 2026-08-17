import { PipelineStage, PipelineRun } from '../types';

export const mockPipelineStages: PipelineStage[] = [
  {
    id: 'stage-1',
    name: 'Crawler',
    order: 1,
    status: 'running',
    recordsProcessed: 48920,
    recordsInQueue: 1420,
    processingRatePerSec: 185,
    errorsCount: 14,
    lastDurationMs: 420,
    healthScore: 99.2,
    description: 'Dispatches distributed scrapers, RSS ingestors, and API pollers across 48 AI endpoints.'
  },
  {
    id: 'stage-2',
    name: 'Raw Content',
    order: 2,
    status: 'running',
    recordsProcessed: 48906,
    recordsInQueue: 980,
    processingRatePerSec: 210,
    errorsCount: 2,
    lastDurationMs: 180,
    healthScore: 99.8,
    description: 'Normalizes HTML, PDF, JSON payloads into raw canonical markdown & structure.'
  },
  {
    id: 'stage-3',
    name: 'Freshness Filter',
    order: 3,
    status: 'running',
    recordsProcessed: 47924,
    recordsInQueue: 430,
    processingRatePerSec: 340,
    errorsCount: 0,
    lastDurationMs: 95,
    healthScore: 100.0,
    description: 'Deduplicates cryptographic content hashes and enforces rolling 24h & 7d freshness windows.'
  },
  {
    id: 'stage-4',
    name: 'LLM Extraction',
    order: 4,
    status: 'running',
    recordsProcessed: 46210,
    recordsInQueue: 320,
    processingRatePerSec: 92,
    errorsCount: 8,
    lastDurationMs: 780,
    healthScore: 98.6,
    description: 'Structured JSON schema extraction (Startups, Models, Papers, Benchmarks, Salaries, Roles) via Gemini/Groq.'
  },
  {
    id: 'stage-5',
    name: 'Validation',
    order: 5,
    status: 'running',
    recordsProcessed: 46202,
    recordsInQueue: 180,
    processingRatePerSec: 280,
    errorsCount: 3,
    lastDurationMs: 140,
    healthScore: 99.4,
    description: 'Validates strict Pydantic/TypeScript contract schemas, URL reachability, and enum constraints.'
  },
  {
    id: 'stage-6',
    name: 'Entity Resolution',
    order: 6,
    status: 'running',
    recordsProcessed: 46199,
    recordsInQueue: 240,
    processingRatePerSec: 145,
    errorsCount: 1,
    lastDurationMs: 310,
    healthScore: 99.7,
    description: 'Disambiguates corporate aliases, product brand iterations, and researcher identities with confidence clustering.'
  },
  {
    id: 'stage-7',
    name: 'Storage',
    order: 7,
    status: 'completed',
    recordsProcessed: 46198,
    recordsInQueue: 0,
    processingRatePerSec: 420,
    errorsCount: 0,
    lastDurationMs: 65,
    healthScore: 100.0,
    description: 'Atomically commits validated and enriched entities into PostgreSQL relational & vector indices.'
  }
];

export const mockPipelineRuns: PipelineRun[] = [
  {
    id: 'run-8942',
    runNumber: 8942,
    source: 'ArXiv cs.AI & cs.LG Feeds',
    sourceId: 'src-01',
    records: 142,
    validRecords: 140,
    rejectedRecords: 2,
    durationSeconds: 28,
    startedAt: '2026-08-15T02:00:00Z',
    completedAt: '2026-08-15T02:00:28Z',
    status: 'Completed',
    llmModelUsed: 'Gemini 2.5 Flash'
  },
  {
    id: 'run-8941',
    runNumber: 8941,
    source: 'HackerNews AI Ingestion Feed',
    sourceId: 'src-02',
    records: 88,
    validRecords: 88,
    rejectedRecords: 0,
    durationSeconds: 14,
    startedAt: '2026-08-15T01:55:00Z',
    completedAt: '2026-08-15T01:55:14Z',
    status: 'Completed',
    llmModelUsed: 'Gemini 2.5 Flash'
  },
  {
    id: 'run-8940',
    runNumber: 8940,
    source: 'GitHub Trending AI Repositories',
    sourceId: 'src-07',
    records: 62,
    validRecords: 58,
    rejectedRecords: 4,
    durationSeconds: 42,
    startedAt: '2026-08-15T01:40:00Z',
    completedAt: '2026-08-15T01:40:42Z',
    status: 'Completed',
    llmModelUsed: 'Groq LLaMA 3.3 70B (Fallback)'
  },
  {
    id: 'run-8939',
    runNumber: 8939,
    source: 'Greenhouse Career Feed',
    sourceId: 'src-03',
    records: 94,
    validRecords: 92,
    rejectedRecords: 2,
    durationSeconds: 31,
    startedAt: '2026-08-15T01:30:00Z',
    completedAt: '2026-08-15T01:30:31Z',
    status: 'Completed',
    llmModelUsed: 'Gemini 2.5 Flash'
  },
  {
    id: 'run-8938',
    runNumber: 8938,
    source: 'SEC EDGAR Form D Filings',
    sourceId: 'src-04',
    records: 24,
    validRecords: 24,
    rejectedRecords: 0,
    durationSeconds: 19,
    startedAt: '2026-08-15T01:00:00Z',
    completedAt: '2026-08-15T01:00:19Z',
    status: 'Completed',
    llmModelUsed: 'Gemini 2.5 Flash'
  }
];

export const mockPipelineSummary = {
  currentRun: {
    id: 'run-8943',
    source: 'Continuous Ingestion Cluster',
    activeStage: 'LLM Extraction',
    progressPercent: 78,
    processedItems: 340,
    totalQueued: 435,
    elapsedSec: 22
  },
  queueSize: 3570,
  throughputPerMinute: 1420,
  successRate: 99.4,
  errorRate: 0.6,
  lastSuccessfulRun: '2 minutes ago',
  pipelineState: 'ACTIVE' as 'ACTIVE' | 'PAUSED' | 'STOPPED'
};
