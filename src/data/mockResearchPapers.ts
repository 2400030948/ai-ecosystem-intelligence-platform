import { ResearchPaper } from '../types';

export const mockResearchPapers: ResearchPaper[] = [
  {
    id: 'ppr-01',
    title: 'Reasoning with Large Language Models via Multi-Step Verification Chains',
    authors: ['Sarah Chen', 'Dmitri Volkov', 'Kavita Raman', 'Alexandre Mercier'],
    primaryAuthorAffiliation: 'AI Frontier Lab & Stanford University',
    publishedDate: '2026-08-14',
    arxivId: '2608.08912',
    paperUrl: 'https://arxiv.org/abs/2608.08912',
    githubUrl: 'https://github.com/frontier-reasoning/verification-chains',
    githubStars: 14250,
    githubStarsDelta7d: 3820,
    source: 'ArXiv cs.AI Feed',
    abstract: 'We introduce a novel self-correction framework where LLMs decompose complex deductive reasoning into verified programmatic lemmas, reducing hallucination rates in mathematical theorem proving and competitive programming by 47%.',
    benchmarks: [
      { name: 'MATH 500', score: '91.4%', metric: 'Accuracy' },
      { name: 'HumanEval+', score: '88.2%', metric: 'Pass@1' },
      { name: 'GSM8K', score: '98.1%', metric: 'Exact Match' }
    ],
    categories: ['cs.AI', 'cs.CL', 'cs.LG'],
    citationsCount: 142
  },
  {
    id: 'ppr-02',
    title: 'FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-Precision',
    authors: ['Tri Dao', 'Jay Shah', 'Dan Fu'],
    primaryAuthorAffiliation: 'Princeton University & Together AI',
    publishedDate: '2026-08-12',
    arxivId: '2608.05190',
    paperUrl: 'https://arxiv.org/abs/2608.05190',
    githubUrl: 'https://github.com/Dao-AILab/flash-attention',
    githubStars: 21980,
    githubStarsDelta7d: 1450,
    source: 'ArXiv cs.LG & GitHub Trending',
    abstract: 'FlashAttention-3 exploits asynchronous hardware execution units on Hopper and Blackwell architectures with hardware-accelerated FP8 GEMMs to speed up attention kernels up to 2.2x over FlashAttention-2.',
    benchmarks: [
      { name: 'H100 FP16 Forward', score: '850 TFLOPs/s', metric: 'Throughput' },
      { name: 'H100 FP8 Forward', score: '1.2 PFLOPs/s', metric: 'Throughput' }
    ],
    categories: ['cs.LG', 'cs.DC', 'cs.AR'],
    citationsCount: 512
  },
  {
    id: 'ppr-03',
    title: 'π0: A Vision-Language-Action Flow Model for Generalist Robot Manipulation',
    authors: ['Kevin Black', 'Aditi Mavalankar', 'Pranav Atreya', 'Sergey Levine'],
    primaryAuthorAffiliation: 'Physical Intelligence',
    publishedDate: '2026-08-10',
    arxivId: '2608.03120',
    paperUrl: 'https://arxiv.org/abs/2608.03120',
    githubUrl: 'https://github.com/physical-intelligence/open-pi-zero',
    githubStars: 8740,
    githubStarsDelta7d: 2100,
    source: 'ArXiv cs.RO',
    abstract: 'We present π0, a general-purpose robotic foundation policy pretrained on diverse physical manipulation trajectories. Using continuous flow matching over high-frequency joint states, π0 executes complex dexterous tasks from laundry folding to table clearing across seven distinct robot embodiments.',
    benchmarks: [
      { name: 'Multi-Task Success Rate', score: '84.6%', metric: 'Unseen Kitchens' },
      { name: 'Dexterous Folding', score: '79.2%', metric: 'Zero-shot' }
    ],
    categories: ['cs.RO', 'cs.AI', 'cs.CV'],
    citationsCount: 88
  },
  {
    id: 'ppr-04',
    title: 'Sparse Mixture of Experts with Dynamic Token Routing at 1M Context Length',
    authors: ['Helena Zhou', 'Lucas Dubois', 'Yannick Vogel'],
    primaryAuthorAffiliation: 'Mistral Research Lab',
    publishedDate: '2026-08-08',
    arxivId: '2608.01944',
    paperUrl: 'https://arxiv.org/abs/2608.01944',
    githubUrl: 'https://github.com/mistralai/mistral-inference',
    githubStars: 16400,
    githubStarsDelta7d: 980,
    source: 'ArXiv cs.CL',
    abstract: 'A deep exploration of dynamic routing stability in sparse MoE models scaling beyond 1,000,000 tokens. Proposes an auxiliary-loss-free load balancer that eliminates expert collapse during ultra-long sequence processing.',
    benchmarks: [
      { name: 'Needle In A Haystack (1M)', score: '99.8%', metric: 'Retrieval Accuracy' },
      { name: 'RULER Long-Context', score: '89.4%', metric: 'Aggregate F1' }
    ],
    categories: ['cs.CL', 'cs.LG'],
    citationsCount: 65
  },
  {
    id: 'ppr-05',
    title: 'Self-Play Fine-Tuning of Reasoning LLMs Without Human Labels',
    authors: ['Zixin Ding', 'Marcus Aurelius', 'Tengyu Ma'],
    primaryAuthorAffiliation: 'Stanford AI Lab & DeepMind',
    publishedDate: '2026-08-05',
    arxivId: '2608.00412',
    paperUrl: 'https://arxiv.org/abs/2608.00412',
    githubUrl: 'https://github.com/stanford-nlp/spin-reasoning',
    githubStars: 11200,
    githubStarsDelta7d: 1120,
    source: 'ArXiv cs.AI',
    abstract: 'We present SPIN-Reasoning, a self-play method that iteratively pits a model against its previous generation checkpoint to uncover logical contradictions in reasoning traces, generating synthetic reward signals without supervised ground truth.',
    benchmarks: [
      { name: 'Arena-Hard Auto-Eval', score: '82.4', metric: 'Win Rate %' },
      { name: 'AIME 2026', score: '63.3%', metric: 'Solved' }
    ],
    categories: ['cs.AI', 'cs.LG', 'stat.ML'],
    citationsCount: 190
  },
  {
    id: 'ppr-06',
    title: 'BitNet b1.58 2.0: Native 1-Bit LLMs with Sub-Millisecond Token Latencies',
    authors: ['Shuming Ma', 'Hongyu Wang', 'Furu Wei'],
    primaryAuthorAffiliation: 'Microsoft Research',
    publishedDate: '2026-08-02',
    arxivId: '2607.19980',
    paperUrl: 'https://arxiv.org/abs/2607.19980',
    githubUrl: 'https://github.com/microsoft/BitNet',
    githubStars: 19300,
    githubStarsDelta7d: 2600,
    source: 'ArXiv cs.AI & GitHub',
    abstract: 'We demonstrate that 1.58-bit ternary weight architectures matching LLaMA 3 70B accuracy can be synthesized directly into integer silicon kernels, reducing inference memory bandwidth constraints by 8x.',
    benchmarks: [
      { name: 'Inference Energy (Joules/Token)', score: '0.14x', metric: 'Normalized vs FP16' },
      { name: 'MMLU Benchmark', score: '78.9%', metric: '5-shot Accuracy' }
    ],
    categories: ['cs.AI', 'cs.AR', 'cs.NE'],
    citationsCount: 340
  }
];
