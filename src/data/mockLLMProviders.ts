import { LLMProvider } from '../types';

export const mockLLMProviders: LLMProvider[] = [
  {
    id: 'llm-01',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    model: 'gemini-2.5-flash',
    role: 'Primary',
    status: 'Operational',
    requests24h: 384500,
    successRate: 99.82,
    avgLatencyMs: 245,
    p95LatencyMs: 480,
    rateLimitStatus: {
      rpmUsed: 420,
      rpmLimit: 2000,
      tpmUsed: 890000,
      tpmLimit: 4000000,
      percentage: 22
    },
    costPer1kTokens: '$0.00015'
  },
  {
    id: 'llm-02',
    name: 'Groq LLaMA 3.3 70B',
    provider: 'Groq',
    model: 'llama-3.3-70b-versatile',
    role: 'Fallback 1',
    status: 'Operational',
    requests24h: 12400,
    successRate: 99.41,
    avgLatencyMs: 165,
    p95LatencyMs: 310,
    rateLimitStatus: {
      rpmUsed: 45,
      rpmLimit: 1000,
      tpmUsed: 120000,
      tpmLimit: 2000000,
      percentage: 6
    },
    lastError: {
      code: 'RATE_LIMIT_BURST',
      message: 'Brief rate limit exceeded on batch burst at 00:14 UTC, seamlessly routed to DeepSeek.',
      timestamp: '2h ago'
    },
    costPer1kTokens: '$0.00059'
  },
  {
    id: 'llm-03',
    name: 'DeepSeek V3 / R1',
    provider: 'DeepSeek',
    model: 'deepseek-chat-v3',
    role: 'Fallback 2',
    status: 'Operational',
    requests24h: 3120,
    successRate: 98.90,
    avgLatencyMs: 520,
    p95LatencyMs: 980,
    rateLimitStatus: {
      rpmUsed: 18,
      rpmLimit: 500,
      tpmUsed: 45000,
      tpmLimit: 1000000,
      percentage: 4
    },
    costPer1kTokens: '$0.00027'
  }
];

export const mockLLMActivity = [
  { time: '00:00', gemini: 14200, groq: 450, deepseek: 90 },
  { time: '02:00', gemini: 15800, groq: 510, deepseek: 110 },
  { time: '04:00', gemini: 12400, groq: 380, deepseek: 60 },
  { time: '06:00', gemini: 16900, groq: 620, deepseek: 140 },
  { time: '08:00', gemini: 21500, groq: 1200, deepseek: 310 },
  { time: '10:00', gemini: 28400, groq: 1850, deepseek: 420 },
  { time: '12:00', gemini: 31200, groq: 1420, deepseek: 380 },
  { time: '14:00', gemini: 29800, groq: 1100, deepseek: 290 },
  { time: '16:00', gemini: 27500, groq: 950, deepseek: 210 },
  { time: '18:00', gemini: 24100, groq: 810, deepseek: 190 },
  { time: '20:00', gemini: 22800, groq: 720, deepseek: 160 },
  { time: '22:00', gemini: 19600, groq: 590, deepseek: 120 }
];
