# AI Ecosystem Intelligence Platform - Architecture Documentation

## 1. System Architecture Overview

The AI Ecosystem Intelligence Platform is an automated pipeline and analytical intelligence workspace engineered for high-throughput acquisition, normalization, entity resolution, and structured querying of AI ecosystem entities: **Startups**, **Foundation Models & Products**, **Research Papers**, **Real-Time Jobs**, and **Industry News**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 EXTERNAL REAL DATA SOURCES                             │
│   arXiv API (cs.AI, cs.LG, cs.CL, stat.ML)  │  Hugging Face Hub API (Models, Pipelines)│
│   Hacker News Algolia API (Launches, News)   │  Jobicy & RemoteOK APIs (Jobs)           │
│   GitHub REST API (Repo Stars Extraction)   │  RSS & Atom Industry Dispatches          │
└─────────────────────────────────────────┬──────────────────────────────────────────────┘
                                          │ Async HTTP / Polling (aiohttp)
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              DATA INGESTION & FRESHNESS ENGINE                         │
│  - Polite Rate Limiting & User-Agent Attribution                                       │
│  - Strict 24-Hour Rolling Window Filter (ISO 8601, RFC 2822, Epoch)                    │
│  - URL Normalization & Anti-Tracking Canonicalizer                                     │
└─────────────────────────────────────────┬──────────────────────────────────────────────┘
                                          │ Normalized Raw Records
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     EXTRACTOR & RESILIENT MULTI-TIER LLM GATEWAY                       │
│  Tier 1: Gemini 2.5 Flash   ──(429/5xx/Fail)──►  Tier 2: Groq LLaMA 3.3 70B Versatile  │
│                                                │                                       │
│  Tier 4: Heuristic Normalizer ◄──(Fail)───────┴──► Tier 3: DeepSeek-V3 Chat            │
│  - Token-Safe Chunking (<12k tokens / 413 guard)                                       │
│  - Pydantic Schema Validation (Coercion, strict typing, hallucination guards)          │
└─────────────────────────────────────────┬──────────────────────────────────────────────┘
                                          │ Structured Entity Objects
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     ENTITY RESOLVER & CANONICAL DEDUPLICATION                          │
│  - Normalization Rules: Suffix stripping (Inc, AI, Labs), Case & Punctuation folding   │
│  - 3-Tier Resolution: Exact Match (1.0) -> Token/Jaccard (0.85) -> Fuzzy Ratio (0.75)  │
│  - Audit Logging: Real-time mapping table (`entity_mappings`)                          │
└─────────────────────────────────────────┬──────────────────────────────────────────────┘
                                          │ Canonical Records
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             SQLITE PERSISTENCE & STORAGE                               │
│  - Strict UNIQUE constraints on primary entity URLs & canonical names                  │
│  - Indexed by `discovered_at`, `published_date`, `posted_date`, `category`             │
│  - ACID compliance via `aiosqlite` & WAL mode                                          │
└─────────────────────────────────────────┬──────────────────────────────────────────────┘
                                          │ Async JSON APIs (FastAPI)
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          REACT 18 + TAILWIND INTELLIGENCE UI                           │
│  - Real-time Pipeline Telemetry & Live Discovery Rates                                 │
│  - Multi-Entity Intelligence Grid & Search Filters                                     │
│  - Interactive LLM Playground with Raw vs Parsed Comparison                            │
│  - Entity Resolution Explorer & Canonical Confidence Badges                            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Async Crawler & Source Ingestion

The ingestion engine (`backend/ingestion.py`, `backend/sources.py`) uses `aiohttp` with asynchronous I/O and respectful rate limits:
- **arXiv Public API**: Batches queries across six CS/Stat categories (`cs.AI`, `cs.LG`, `cs.CL`, `cs.CV`, `cs.NE`, `stat.ML`) using submitted date ordering. Parses Atom XML natively via Python's standard `xml.etree.ElementTree`.
- **Hugging Face Hub API**: Queries official model registries with pagination, sorting by downloads/recency, extracting licenses, pipeline tags, and architecture metadata.
- **Hacker News Algolia Search API**: Harvests YC Launch posts, Show HN entries, and real-time AI news stories using numerical epoch range filters.
- **Jobicy & RemoteOK APIs**: Consumes remote job streams, categorizing role families (ML Engineering, Research, Data Science) and compensation tiers.
- **GitHub REST API Integration**: When research paper abstracts or product records reference a GitHub repository, the engine executes targeted API lookups to retrieve real `stargazers_count`.

---

## 3. Freshness Filtering & 24-Hour Enforcement

`backend/freshness.py` guarantees strict temporal freshness:
- **Multi-Format Parsing**: Robustly parses ISO 8601 strings, RFC 2822 web timestamps, and epoch integers into timezone-aware UTC datetime objects.
- **24-Hour Strict Window**: Calculated against UTC `now`. Any job posting or news item older than 24 hours (or lacking a verifiable publication date) is rejected from the fresh queues.
- **Freshness Classification**: Categorized into four human-readable bands:
  - `< 1 hour`: `Just now (< 1h ago)`
  - `1-6 hours`: `Past few hours (Xh ago)`
  - `6-24 hours`: `Today (Xh ago)`
  - `> 24 hours`: `Historical (> 24h)` (flagged and excluded from real-time views).

---

## 4. Resilient Multi-Tier LLM Extraction Gateway

Extraction (`backend/extractor.py`, `backend/llm_client.py`) transforms unstructured text into strongly-typed Pydantic models with automated multi-tier fallback:

```
[Incoming Raw Content]
         │
         ▼
[Tier 1: Gemini 2.5 Flash] ──(429 / Quota / 5xx Error)──┐
         │                                               ▼
     (Success)                              [Tier 2: Groq LLaMA 3.3 70B]
         │                                               │
         │                                  (429 / Fail) │ (Success)
         │                                               ▼      │
         │                                  [Tier 3: DeepSeek-V3]│
         │                                               │      │
         │                                  (Fail) ┌─────┘      │
         │                                         ▼            │
         │                            [Tier 4: Heuristic Engine]│
         │                                         │            │
         ▼                                         ▼            ▼
   [Pydantic Validation & Coercion] ◄──────────────┴────────────┘
         │
         ▼
   [Validated Structured Output]
```

### Rate Limiting (429) & Payload Size (413) Handling
- **HTTP 429 (Rate Limit Exceeded)**: Implements exponential backoff with jitter up to 3 retries (`base_delay * 2^attempt + uniform(0, 1)`). If rate limit persists or quota is exhausted, seamlessly falls back to the next LLM provider in the cascade.
- **HTTP 413 (Payload Too Large)**: Content is pre-tokenized and truncated using sliding-window chunking (capped at 12,000 tokens for context safety) with prompt compression before hitting the LLM API.
- **Deterministic Heuristic Guard**: If all external LLM APIs are unreachable or unconfigured, an internal heuristic parser extracts names, metrics, categories, and links, preventing pipeline disruption.

---

## 5. Canonical Entity Resolution & Deduplication

`backend/resolver.py` merges variations of organizational names into single canonical identities:
- **Rule-Based Preprocessing**: Normalizes legal abbreviations (`Inc`, `LLC`, `Corp`, `Ltd`, `AI`, `Labs`, `Technologies`), removes special characters, and folds case.
- **Three-Tier Confidence Scoring**:
  1. **Tier 1 (High - 1.0)**: Exact lookup in curated canonical dictionaries (e.g., `Mistral AI -> Mistral`, `Anthropic PBC -> Anthropic`).
  2. **Tier 2 (High - 0.85-0.95)**: Token-set Jaccard overlap and containment match (`Hugging Face Inc -> Hugging Face`).
  3. **Tier 3 (Medium - 0.70-0.84)**: SequenceMatcher fuzzy ratio with string distance thresholds.
- **Audit Logging**: Every entity resolution event is written to the `entity_mappings` SQLite table with raw name, resolved canonical name, confidence score, tier, and matched criteria.

### Database Deduplication
- SQLite schemas enforce `UNIQUE` constraints on canonical URLs and primary identifiers.
- Insert queries use `INSERT OR IGNORE` with rowcount checking to count duplicates accurately without throwing runtime exceptions.

---

## 6. Anti-Bot and Crawler Compliance

- **User-Agent Header**: Crawlers identify themselves with `AI-Intelligence-Harvester/2.0 (+https://ai-intelligence.dev/crawler-policy)`.
- **Concurrency & Jitter**: Requests to individual host domains are rate-limited with non-blocking `asyncio.sleep` to respect target server capacities.
- **Headless Fallbacks**: Direct API endpoints (e.g., arXiv API, HF API, Algolia API, Jobicy API) are preferred over scraping raw HTML to minimize bandwidth and eliminate cloudflare/captcha blocks.

---

## 7. 500,000+ Record Production Scaling Strategy

To scale this prototype from thousands of records to **500,000+ daily records**, the following production architecture is specified:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   DISTRIBUTED CRAWLER & SCRAPER FLEET                  │
│   Worker 1 (arXiv)  │  Worker 2 (HF)  │  Worker 3 (HN)  │  Worker N   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Pub/Sub / Kafka Messages
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  DISTRIBUTED BROKER & WORK QUEUE                       │
│                   (Apache Kafka / Google Cloud Tasks)                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Partitioned Stream
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   DISTRIBUTED EXTRACTION & RESOLUTION                  │
│  - Distributed Redis Cluster for Bloom Filter URL Deduplication        │
│  - Embedding-based Entity Resolution (Milvus / pgvector)               │
│  - LLM Worker Pool with Dynamic Concurrency Limiters                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Batch Writes (5,000 rows/batch)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     PRODUCTION STORAGE & INDEXING                      │
│  - Primary Store: PostgreSQL / Cloud SQL (TimescaleDB partitioning)   │
│  - Search Engine: Elasticsearch / OpenSearch for full-text indexing    │
│  - Cache: Redis Cluster for <10ms API responses                        │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Distributed Task Queue & Partitioning**:
   - Split ingestion workers across independent Kubernetes pods running Celery or Cloud Tasks.
   - Partition work by source domain and entity type to avoid hitting source IP rate limits.

2. **Distributed Deduplication (Bloom Filters)**:
   - Replace in-memory or SQLite unique checks with a **Redis Bloom Filter** capable of checking 500M+ URLs with a 0.01% false positive rate using <100MB RAM.

3. **High-Throughput Storage**:
   - Migrate from SQLite to **PostgreSQL on Cloud SQL** with TimescaleDB hypertable partitioning for timestamped events (`jobs`, `news`, `pipeline_runs`).
   - Use batched `COPY` commands or `asyncpg` bulk inserts (5,000 records per transaction).

4. **Embedding-Based Entity Resolution at Scale**:
   - Generate dense vector embeddings for entity names using lightweight embedding models (e.g., `text-embedding-004`).
   - Query `pgvector` or `Milvus` for sub-millisecond approximate nearest neighbor (ANN) matching at 500k+ scale.
