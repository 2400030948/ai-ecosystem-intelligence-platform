import { EntityMapping } from '../types';

export const mockEntityMappings: EntityMapping[] = [
  {
    id: 'em-01',
    rawName: 'Open AI',
    canonicalName: 'OpenAI',
    entityType: 'Startup',
    confidence: 0.99,
    confidenceTier: 'High',
    source: 'HackerNews Ingestion Crawl',
    sourceRecordId: 'hn-crawl-99120',
    discoveredAt: '2026-08-15T01:45:00Z',
    status: 'Confirmed',
    matchCriteria: ['Levenshtein Distance: 1', 'Domain Mapping: openai.com', 'Token Jaccard: 1.0'],
    alternateCandidates: [
      { name: 'OpenAI', score: 0.99 },
      { name: 'Open AI Labs', score: 0.72 }
    ]
  },
  {
    id: 'em-02',
    rawName: 'OpenAI Inc.',
    canonicalName: 'OpenAI',
    entityType: 'Startup',
    confidence: 0.98,
    confidenceTier: 'High',
    source: 'SEC Filing Corpus',
    sourceRecordId: 'sec-d-29103',
    discoveredAt: '2026-08-15T01:30:00Z',
    status: 'Confirmed',
    matchCriteria: ['Legal Suffix Stripping', 'Corporate Identifier Match'],
    alternateCandidates: [
      { name: 'OpenAI', score: 0.98 }
    ]
  },
  {
    id: 'em-03',
    rawName: 'Open AI Technologies',
    canonicalName: 'OpenAI',
    entityType: 'Startup',
    confidence: 0.95,
    confidenceTier: 'High',
    source: 'Patent Office XML',
    sourceRecordId: 'uspto-2026-0192',
    discoveredAt: '2026-08-15T01:10:00Z',
    status: 'Confirmed',
    matchCriteria: ['Embedding Cosine Similarity: 0.96', 'Known Trademark Record'],
    alternateCandidates: [
      { name: 'OpenAI', score: 0.95 },
      { name: 'Open Technologies Ltd', score: 0.44 }
    ]
  },
  {
    id: 'em-04',
    rawName: 'Anthropic PBC',
    canonicalName: 'Anthropic',
    entityType: 'Startup',
    confidence: 0.98,
    confidenceTier: 'High',
    source: 'State Incorporation Feed',
    sourceRecordId: 'de-corp-849102',
    discoveredAt: '2026-08-14T23:50:00Z',
    status: 'Confirmed',
    matchCriteria: ['Legal Entity Suffix: Public Benefit Corp', 'Exact Domain Bind'],
    alternateCandidates: [
      { name: 'Anthropic', score: 0.98 }
    ]
  },
  {
    id: 'em-05',
    rawName: 'Mistral-AI SAS',
    canonicalName: 'Mistral AI',
    entityType: 'Startup',
    confidence: 0.97,
    confidenceTier: 'High',
    source: 'French Commercial Register',
    sourceRecordId: 'fr-inpi-49021',
    discoveredAt: '2026-08-14T22:30:00Z',
    status: 'Confirmed',
    matchCriteria: ['Punctuation Normalization', 'Headquarters Paris match'],
    alternateCandidates: [
      { name: 'Mistral AI', score: 0.97 }
    ]
  },
  {
    id: 'em-06',
    rawName: 'Pi Robotics Company',
    canonicalName: 'Physical Intelligence',
    entityType: 'Startup',
    confidence: 0.84,
    confidenceTier: 'Medium',
    source: 'ArXiv Affiliation Text',
    sourceRecordId: 'arxiv-cs-ro-2608',
    discoveredAt: '2026-08-14T21:15:00Z',
    status: 'Manual Review',
    matchCriteria: ['Domain match physicalintelligence.company', 'Co-author Sergey Levine link'],
    alternateCandidates: [
      { name: 'Physical Intelligence', score: 0.84 },
      { name: 'Pi Mobility', score: 0.48 }
    ]
  },
  {
    id: 'em-07',
    rawName: 'Claude Sonnet 3.5',
    canonicalName: 'Claude 3.5 Sonnet',
    entityType: 'Product',
    confidence: 0.96,
    confidenceTier: 'High',
    source: 'HuggingFace Community Leaderboard',
    sourceUrl: 'https://huggingface.co/spaces',
    sourceRecordId: 'hf-mod-3901',
    discoveredAt: '2026-08-14T19:40:00Z',
    status: 'Confirmed',
    matchCriteria: ['Token Permutation Match', 'Publisher Anthropic link'],
    alternateCandidates: [
      { name: 'Claude 3.5 Sonnet', score: 0.96 },
      { name: 'Claude 3 Sonnet', score: 0.62 }
    ]
  },
  {
    id: 'em-08',
    rawName: 'Modal Compute Systems',
    canonicalName: 'Modal Labs',
    entityType: 'Startup',
    confidence: 0.82,
    confidenceTier: 'Medium',
    source: 'GitHub Readme Reference',
    sourceRecordId: 'gh-pkg-modal-49',
    discoveredAt: '2026-08-14T18:05:00Z',
    status: 'Manual Review',
    matchCriteria: ['Python package import modal', 'Author Erik Bernhardsson'],
    alternateCandidates: [
      { name: 'Modal Labs', score: 0.82 },
      { name: 'Modal AI Hardware', score: 0.55 }
    ]
  },
  {
    id: 'em-09',
    rawName: 'Together Computer Inc.',
    canonicalName: 'Together AI',
    entityType: 'Startup',
    confidence: 0.94,
    confidenceTier: 'High',
    source: 'Delaware Corporation Index',
    sourceRecordId: 'de-corp-77219',
    discoveredAt: '2026-08-14T16:20:00Z',
    status: 'Confirmed',
    matchCriteria: ['Historical Brand Transition', 'Domain together.ai'],
    alternateCandidates: [
      { name: 'Together AI', score: 0.94 }
    ]
  },
  {
    id: 'em-10',
    rawName: 'Harvey Legal Co.',
    canonicalName: 'Harvey AI',
    entityType: 'Startup',
    confidence: 0.62,
    confidenceTier: 'Review',
    source: 'Law Firm Vendor Registry',
    sourceRecordId: 'amlaw-vendor-82',
    discoveredAt: '2026-08-14T14:10:00Z',
    status: 'Manual Review',
    matchCriteria: ['Partial string overlap', 'Domain ambiguous legal-harvey.com'],
    alternateCandidates: [
      { name: 'Harvey AI', score: 0.62 },
      { name: 'Harvey Software UK', score: 0.59 }
    ]
  }
];
