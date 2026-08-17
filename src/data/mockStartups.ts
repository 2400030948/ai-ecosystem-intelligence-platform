import { Startup } from '../types';

export const mockStartups: Startup[] = [
  {
    id: 'st-01',
    name: 'Anthropic',
    legalName: 'Anthropic PBC',
    domain: 'anthropic.com',
    employees: '500-1,000',
    headquarters: 'San Francisco, CA',
    foundedYear: 2021,
    stage: 'Series D',
    source: 'SEC EDGAR & Crunchbase',
    sourceUrl: 'https://sec.gov/edgar/anthropic-filing',
    collectedAt: '2026-08-15T01:42:10Z',
    status: 'Verified',
    description: 'AI research and safety company focused on developing reliable, interpretable, and steerable frontier AI systems.',
    primaryTags: ['Frontier Models', 'Constitutional AI', 'Safety', 'Enterprise API'],
    totalFunding: '$7.3B',
    relatedProducts: [
      { id: 'prd-01', name: 'Claude 3.5 Sonnet', pricingModel: 'PAID' },
      { id: 'prd-02', name: 'Claude Enterprise', pricingModel: 'ENTERPRISE' },
      { id: 'prd-03', name: 'Claude Artifacts', pricingModel: 'FREEMIUM' }
    ],
    resolutionInfo: {
      rawAliases: ['Anthropic PBC', 'Anthropic Labs', 'Anthropic AI Corp'],
      confidence: 0.99,
      resolvedAt: '2026-08-15T01:42:12Z'
    }
  },
  {
    id: 'st-02',
    name: 'Mistral AI',
    legalName: 'Mistral AI SAS',
    domain: 'mistral.ai',
    employees: '150-250',
    headquarters: 'Paris, France',
    foundedYear: 2023,
    stage: 'Series B',
    source: 'EU Registry & TechCrunch',
    sourceUrl: 'https://techcrunch.com/mistral-expansion',
    collectedAt: '2026-08-15T01:30:00Z',
    status: 'Verified',
    description: 'Specializes in open-weight and high-efficiency foundational models with state-of-the-art inference efficiency.',
    primaryTags: ['Open Weights', 'Inference Efficiency', 'Mixture of Experts', 'Multilingual'],
    totalFunding: '$1.1B',
    relatedProducts: [
      { id: 'prd-04', name: 'Mistral Large 2', pricingModel: 'PAID' },
      { id: 'prd-05', name: 'Codestral', pricingModel: 'FREEMIUM' },
      { id: 'prd-06', name: 'Le Chat Enterprise', pricingModel: 'ENTERPRISE' }
    ],
    resolutionInfo: {
      rawAliases: ['Mistral AI SAS', 'Mistral Technologies', 'Mistral-AI'],
      confidence: 0.98,
      resolvedAt: '2026-08-15T01:30:04Z'
    }
  },
  {
    id: 'st-03',
    name: 'Cohere',
    legalName: 'Cohere Inc.',
    domain: 'cohere.com',
    employees: '400-600',
    headquarters: 'Toronto, Canada',
    foundedYear: 2019,
    stage: 'Series D',
    source: 'Enterprise AI Directory',
    sourceUrl: 'https://venturebeat.com/cohere-command-r-plus',
    collectedAt: '2026-08-15T00:55:00Z',
    status: 'Verified',
    description: 'Enterprise generative AI platform providing state-of-the-art retrieval-augmented generation and multilingual embeddings.',
    primaryTags: ['Enterprise Search', 'RAG', 'Embeddings', 'Private Cloud'],
    totalFunding: '$970M',
    relatedProducts: [
      { id: 'prd-07', name: 'Command R+', pricingModel: 'PAID' },
      { id: 'prd-08', name: 'Cohere Embed v3', pricingModel: 'PAID' },
      { id: 'prd-09', name: 'Coral Private Deployment', pricingModel: 'ENTERPRISE' }
    ],
    resolutionInfo: {
      rawAliases: ['Cohere AI Inc', 'Cohere Technologies Inc'],
      confidence: 0.97,
      resolvedAt: '2026-08-15T00:55:02Z'
    }
  },
  {
    id: 'st-04',
    name: 'Perplexity AI',
    legalName: 'Perplexity AI Inc.',
    domain: 'perplexity.ai',
    employees: '120-200',
    headquarters: 'San Francisco, CA',
    foundedYear: 2022,
    stage: 'Series C',
    source: 'HackerNews & SEC Filings',
    sourceUrl: 'https://news.ycombinator.com/item?id=3891002',
    collectedAt: '2026-08-14T23:14:00Z',
    status: 'Verified',
    description: 'Conversational search engine and answer synthesis engine powered by multi-LLM citation pipelines.',
    primaryTags: ['Search Engine', 'Knowledge Synthesis', 'Enterprise Research', 'Consumer AI'],
    totalFunding: '$500M',
    relatedProducts: [
      { id: 'prd-10', name: 'Perplexity Pro', pricingModel: 'PAID' },
      { id: 'prd-11', name: 'Perplexity Enterprise Pro', pricingModel: 'ENTERPRISE' },
      { id: 'prd-12', name: 'Sonar API', pricingModel: 'PAID' }
    ],
    resolutionInfo: {
      rawAliases: ['Perplexity AI Inc.', 'Perplexity Search Labs', 'Perplexity.AI'],
      confidence: 0.99,
      resolvedAt: '2026-08-14T23:14:03Z'
    }
  },
  {
    id: 'st-05',
    name: 'Deepgram',
    legalName: 'Deepgram Inc.',
    domain: 'deepgram.com',
    employees: '150-300',
    headquarters: 'San Francisco, CA',
    foundedYear: 2015,
    stage: 'Series B',
    source: 'Speech & Audio Index',
    sourceUrl: 'https://deepgram.com/changelog/nova-3',
    collectedAt: '2026-08-14T22:40:00Z',
    status: 'Verified',
    description: 'End-to-end deep learning speech recognition and text-to-speech API platform built for real-time streaming agents.',
    primaryTags: ['Speech-to-Text', 'TTS', 'Voice Agents', 'Real-time Streaming'],
    totalFunding: '$124M',
    relatedProducts: [
      { id: 'prd-13', name: 'Nova-3 Speech-to-Text', pricingModel: 'PAID' },
      { id: 'prd-14', name: 'Aura Text-to-Speech', pricingModel: 'PAID' }
    ],
    resolutionInfo: {
      rawAliases: ['Deepgram AI', 'Deepgram Speech Inc'],
      confidence: 0.96,
      resolvedAt: '2026-08-14T22:40:02Z'
    }
  },
  {
    id: 'st-06',
    name: 'Modal Labs',
    legalName: 'Modal Labs Inc.',
    domain: 'modal.com',
    employees: '30-60',
    headquarters: 'New York, NY',
    foundedYear: 2021,
    stage: 'Series A',
    source: 'Developer Feed & GitHub',
    sourceUrl: 'https://github.com/modal-labs/modal-client',
    collectedAt: '2026-08-14T20:10:00Z',
    status: 'Verified',
    description: 'Serverless cloud infrastructure for running generative AI, LLM fine-tuning, and batch inference in code.',
    primaryTags: ['Serverless GPUs', 'AI Infrastructure', 'Python Runtime', 'Developer Tooling'],
    totalFunding: '$36M',
    relatedProducts: [
      { id: 'prd-15', name: 'Modal Serverless Compute', pricingModel: 'PAID' },
      { id: 'prd-16', name: 'Modal Sandbox', pricingModel: 'FREEMIUM' }
    ],
    resolutionInfo: {
      rawAliases: ['Modal Labs', 'Modal Compute Corp', 'Modal.com Inc'],
      confidence: 0.95,
      resolvedAt: '2026-08-14T20:10:01Z'
    }
  },
  {
    id: 'st-07',
    name: 'Physical Intelligence',
    legalName: 'Physical Intelligence Inc.',
    domain: 'physicalintelligence.company',
    employees: '40-80',
    headquarters: 'San Francisco, CA',
    foundedYear: 2024,
    stage: 'Seed / Series A',
    source: 'Robotics Crawl & ArXiv',
    sourceUrl: 'https://arxiv.org/abs/2410.pi0',
    collectedAt: '2026-08-14T19:05:00Z',
    status: 'Pending Enrichment',
    description: 'Developing general-purpose foundation models specifically adapted for robot manipulation and embodied physical intelligence.',
    primaryTags: ['Embodied AI', 'Robotics Foundation Model', 'Manipulation', 'Vision-Language-Action'],
    totalFunding: '$470M',
    relatedProducts: [
      { id: 'prd-17', name: 'π0 Foundation Policy', pricingModel: 'ENTERPRISE' }
    ],
    resolutionInfo: {
      rawAliases: ['Physical Intelligence Inc.', 'pi-company', 'Pi Physical Intelligence'],
      confidence: 0.91,
      resolvedAt: '2026-08-14T19:05:05Z'
    }
  },
  {
    id: 'st-08',
    name: 'Together AI',
    legalName: 'Together Computing Inc.',
    domain: 'together.ai',
    employees: '100-200',
    headquarters: 'San Francisco, CA',
    foundedYear: 2022,
    stage: 'Series B',
    source: 'Cloud Provider Directory',
    sourceUrl: 'https://together.ai/blog/inference-engine-v2',
    collectedAt: '2026-08-14T18:22:00Z',
    status: 'Verified',
    description: 'Leading cloud platform for open-source AI model inference, fine-tuning, and ultra-fast GPU clustering.',
    primaryTags: ['Open Source Inference', 'Model Serving', 'FlashAttention', 'Fine-Tuning'],
    totalFunding: '$325M',
    relatedProducts: [
      { id: 'prd-18', name: 'Together Inference Engine', pricingModel: 'PAID' },
      { id: 'prd-19', name: 'Together Dedicated Clusters', pricingModel: 'ENTERPRISE' }
    ],
    resolutionInfo: {
      rawAliases: ['Together Computer Inc.', 'Together.AI', 'Together ML'],
      confidence: 0.98,
      resolvedAt: '2026-08-14T18:22:01Z'
    }
  },
  {
    id: 'st-09',
    name: 'Poolside AI',
    legalName: 'Poolside AI Corp.',
    domain: 'poolside.ai',
    employees: '50-100',
    headquarters: 'Paris, France',
    foundedYear: 2023,
    stage: 'Series B',
    source: 'Global Tech Press',
    sourceUrl: 'https://poolside.ai/announcements/series-b',
    collectedAt: '2026-08-14T16:15:00Z',
    status: 'Verified',
    description: 'Building autonomous software engineering foundation models with reinforcement learning on code execution feedback.',
    primaryTags: ['Code Intelligence', 'Autonomous Coding', 'RL on Code', 'Frontier Reasoning'],
    totalFunding: '$500M',
    relatedProducts: [
      { id: 'prd-20', name: 'Poolside Code Orchestrator', pricingModel: 'ENTERPRISE' }
    ],
    resolutionInfo: {
      rawAliases: ['Poolside AI Corp', 'Poolside Technologies SAS', 'Poolside.ai'],
      confidence: 0.94,
      resolvedAt: '2026-08-14T16:15:04Z'
    }
  },
  {
    id: 'st-10',
    name: 'Harvey AI',
    legalName: 'Counsel AI Inc. (dba Harvey)',
    domain: 'harvey.ai',
    employees: '120-180',
    headquarters: 'San Francisco, CA',
    foundedYear: 2022,
    stage: 'Series C',
    source: 'Legal Tech Monitor',
    sourceUrl: 'https://ft.com/harvey-legal-ai-expansion',
    collectedAt: '2026-08-14T14:50:00Z',
    status: 'Verified',
    description: 'Custom AI copilot and legal intelligence system built on specialized domain models for top-tier law firms and corporate legal teams.',
    primaryTags: ['Legal Tech', 'Contract Analysis', 'Domain Specialized', 'Enterprise Workflow'],
    totalFunding: '$206M',
    relatedProducts: [
      { id: 'prd-21', name: 'Harvey Legal Assistant', pricingModel: 'ENTERPRISE' }
    ],
    resolutionInfo: {
      rawAliases: ['Harvey Legal AI', 'Counsel AI Inc', 'Harvey AI Corp'],
      confidence: 0.96,
      resolvedAt: '2026-08-14T14:50:02Z'
    }
  }
];
