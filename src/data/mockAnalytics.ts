import { DashboardStats, IngestionTimePoint } from '../types';

export const mockDashboardStats: DashboardStats = {
  startupsCount: 1428,
  startupsGrowth: 12.4,
  productsCount: 3890,
  productsGrowth: 18.2,
  papersCount: 6540,
  papersGrowth: 9.8,
  freshJobsCount: 842,
  freshJobsGrowth: 24.5,
  freshNewsCount: 1120,
  freshNewsGrowth: 15.1,
  recordsProcessedToday: 48920,
  recordsGrowth: 14.8,
  extractionSuccessRate: 99.4,
  extractionSuccessDelta: 0.3,
  activeSourcesCount: 46,
  totalSourcesCount: 48
};

export const mockIngestionTimeline: IngestionTimePoint[] = [
  { time: '00:00', timestamp: '2026-08-14T00:00:00Z', startups: 42, products: 110, papers: 240, jobs: 95, news: 180, total: 667 },
  { time: '02:00', timestamp: '2026-08-14T02:00:00Z', startups: 38, products: 95, papers: 210, jobs: 70, news: 140, total: 553 },
  { time: '04:00', timestamp: '2026-08-14T04:00:00Z', startups: 55, products: 130, papers: 180, jobs: 60, news: 120, total: 545 },
  { time: '06:00', timestamp: '2026-08-14T06:00:00Z', startups: 82, products: 190, papers: 310, jobs: 140, news: 260, total: 982 },
  { time: '08:00', timestamp: '2026-08-14T08:00:00Z', startups: 120, products: 310, papers: 540, jobs: 280, news: 490, total: 1740 },
  { time: '10:00', timestamp: '2026-08-14T10:00:00Z', startups: 165, products: 420, papers: 690, jobs: 390, news: 610, total: 2275 },
  { time: '12:00', timestamp: '2026-08-14T12:00:00Z', startups: 190, products: 480, papers: 780, jobs: 420, news: 680, total: 2550 },
  { time: '14:00', timestamp: '2026-08-14T14:00:00Z', startups: 175, products: 450, papers: 720, jobs: 380, news: 640, total: 2365 },
  { time: '16:00', timestamp: '2026-08-14T16:00:00Z', startups: 140, products: 390, papers: 640, jobs: 310, news: 560, total: 2040 },
  { time: '18:00', timestamp: '2026-08-14T18:00:00Z', startups: 110, products: 320, papers: 510, jobs: 240, news: 480, total: 1660 },
  { time: '20:00', timestamp: '2026-08-14T20:00:00Z', startups: 90, products: 240, papers: 410, jobs: 180, news: 360, total: 1280 },
  { time: '22:00', timestamp: '2026-08-14T22:00:00Z', startups: 65, products: 170, papers: 320, jobs: 130, news: 280, total: 965 }
];

export const mockEntityDistribution = [
  { name: 'Research Papers', count: 6540, fill: '#3b82f6' },
  { name: 'Products', count: 3890, fill: '#10b981' },
  { name: 'Startups', count: 1428, fill: '#8b5cf6' },
  { name: 'AI News', count: 1120, fill: '#f59e0b' },
  { name: 'Fresh Jobs', count: 842, fill: '#ec4899' }
];

export const mockSourcePerformance = [
  { source: 'ArXiv Feeds', success: 99.8, records: 12450, latency: 410 },
  { source: 'HackerNews API', success: 99.9, records: 31200, latency: 180 },
  { source: 'Greenhouse & Lever', success: 99.2, records: 8940, latency: 820 },
  { source: 'SEC Filings', success: 99.6, records: 3820, latency: 650 },
  { source: 'HuggingFace Hub', success: 99.7, records: 24600, latency: 340 },
  { source: 'Tech Media RSS', success: 100.0, records: 18900, latency: 220 },
  { source: 'GitHub Repos', success: 95.2, records: 15400, latency: 1420 }
];

export const mockProcessingLatency = [
  { stage: 'Crawler', p50: 120, p95: 380, p99: 890 },
  { stage: 'Raw Parser', p50: 45, p95: 110, p99: 240 },
  { stage: 'Freshness Filter', p50: 18, p95: 42, p99: 90 },
  { stage: 'LLM Extraction', p50: 245, p95: 580, p99: 1200 },
  { stage: 'Validation', p50: 35, p95: 85, p99: 170 },
  { stage: 'Entity Resolution', p50: 80, p95: 190, p99: 410 },
  { stage: 'DB Storage', p50: 22, p95: 55, p99: 115 }
];

export const mockConfidenceDistribution = [
  { tier: '90-100% (High)', count: 8420, percentage: 86.4, color: '#10b981' },
  { tier: '75-89% (Medium)', count: 1040, percentage: 10.7, color: '#f59e0b' },
  { tier: '<75% (Review)', count: 280, percentage: 2.9, color: '#ef4444' }
];

export const mockExtractionSuccessTrends = [
  { day: 'Mon', success: 99.1, failed: 0.9 },
  { day: 'Tue', success: 99.3, failed: 0.7 },
  { day: 'Wed', success: 99.0, failed: 1.0 },
  { day: 'Thu', success: 99.4, failed: 0.6 },
  { day: 'Fri', success: 99.6, failed: 0.4 },
  { day: 'Sat', success: 99.5, failed: 0.5 },
  { day: 'Sun', success: 99.4, failed: 0.6 }
];
