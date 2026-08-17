import { PlatformSettings } from '../types';

export const mockDefaultSettings: PlatformSettings = {
  crawlConcurrency: 16,
  crawlIntervalMinutes: 15,
  autoStartPipeline: true,
  freshnessWindowHours: 24,
  llmPrimaryProvider: 'Gemini 2.5 Flash',
  llmFallbackChainEnabled: true,
  llmRequestTimeoutSec: 30,
  llmMaxRetryAttempts: 3,
  llmExtractionTemperature: 0.1,
  entityConfidenceThreshold: 0.85,
  autoApproveHighConfidence: true,
  databaseTelemetry: {
    status: 'Connected',
    poolSize: 32,
    activeConnections: 12,
    cacheHitRatio: 98.4,
    storageUsedGb: 14.8
  }
};
