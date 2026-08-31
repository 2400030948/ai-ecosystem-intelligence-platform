# AI Ecosystem Intelligence Platform

An enterprise-grade, real-time AI ecosystem intelligence engine that continuously discovers, normalizes, extracts, resolves, and analyzes signals across startups, foundation models, research papers, jobs, and industry news.

---

## 🏛 1. System Architecture

The platform combines an asynchronous crawler fleet with a multi-tier LLM extraction pipeline and canonical entity resolution:

1. **Async Discovery & Crawler Fleet**: Built on Python `aiohttp` with connection pooling, bounded concurrency, polite User-Agent attribution, and automatic exponential backoff with jitter on HTTP 429/5xx errors.
2. **Real-World Data Ingestion**:
   - **arXiv Public API**: Real papers from `cs.AI`, `cs.LG`, `cs.CL`, `cs.CV`, `cs.NE`, and `stat.ML`.
   - **Hugging Face Hub API**: AI foundation models, open-weight artifacts, licenses, and pipeline classifications.
   - **Hacker News Algolia Search API**: Startup launches (`Launch HN`, `Show HN`), announcements, and AI news.
   - **Jobicy & RemoteOK APIs**: Remote software engineering, AI research, and machine learning jobs.
   - **GitHub REST API**: Live repository star counts extracted from research paper implementations.
3. **Freshness Enforcement Engine**: Strict 24-hour publication SLA for News and Jobs via multi-tier ISO/RFC date parsers (JSON-LD, OpenGraph, `<time>`, and epoch timestamps).
4. **Resilient Multi-Tier LLM Gateway**: Provider fallback cascade (**Gemini 2.5 Flash** → **Groq LLaMA-3.3 70B** → **DeepSeek V3** → **Deterministic Rules**). Strictly anti-hallucinatory with Pydantic schema validation and verified GitHub star lookups via public REST APIs.
5. **Deterministic Entity Resolution**: Canonical taxonomy lookup with automated legal suffix stripping (`Inc`, `LLC`, `PBC`, `GmbH`, etc.), fuzzy string matching, and confidence audit logging (`entity_mappings`).
6. **Storage & Serving**: Local SQLite database with Write-Ahead Logging (`WAL`), served via FastAPI with CORS and React 18 + Tailwind CSS frontend.

---

## 📊 2. Currently Collected Data vs. Theoretical Scaling

> **Important Distinction:** The numbers below reflect actual, verified records collected from real external APIs and persisted in the local SQLite database.

### Currently Stored Live Records
- **STARTUPS**: `1,259`
- **PRODUCTS & MODELS**: `1,004`
- **RESEARCH PAPERS**: `1,305`
- **JOBS (Strict 24h Window)**: `16`
- **NEWS (Strict 24h Window)**: `217`
- **CANONICAL ENTITY MAPPINGS**: `1,185`

### Theoretical 500,000+ Records/Day Scaling Architecture
The system design includes a blueprinted distributed architecture for scaling beyond 500,000 records/day:
- **Distributed Queue**: Apache Kafka / Google Cloud Tasks partitioning work across distributed worker pods.
- **Deduplication**: Distributed Redis Bloom Filters for sub-millisecond, memory-efficient URL deduplication (<100MB RAM for 500M URLs).
- **Storage**: PostgreSQL / Cloud SQL with TimescaleDB hypertable time-partitioning and Elasticsearch for full-text search.
- **Entity Resolution**: Dense vector embeddings (`pgvector` / Milvus) for sub-millisecond semantic entity matching.

---

## 🚀 3. Features

- **Multi-Entity Grid**: Unified view across Startups, Products, Papers, Jobs, and News.
- **Strict 24-Hour Freshness**: Guaranteed real-time visibility with freshness tags (`Just now`, `Past few hours`, `Today`).
- **Entity Resolution Registry**: Audit trail tracking raw aliases to canonical names with confidence scores.
- **Interactive LLM Playground**: Test extraction schemas with Gemini, Groq, or DeepSeek and compare raw text vs parsed JSON.
- **Pipeline Telemetry Dashboard**: Live monitoring of ingestion rates, discovery counts, accepted/rejected metrics, and provider latency.
- **One-Click Data Export**: Automated export of clean CSVs and comprehensive data quality reports.

---

## 🛠 4. Tech Stack

- **Backend**: Python 3.11, FastAPI, `aiohttp`, `aiosqlite`, Pydantic v2, `google-genai` SDK, `pytest`, `pytest-asyncio`.
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Motion.
- **Database**: SQLite 3 (WAL Mode) / Asynchronous SQLite.

---

## 📁 5. Folder Structure

```
├── backend/
│   ├── main.py                  # FastAPI server & route handlers
│   ├── config.py                # App configuration & settings
│   ├── database.py              # SQLite connection & schema initialization
│   ├── schemas.py               # Pydantic models for validation
│   ├── sources.py               # Data parsers (arXiv XML, RSS, HF, HN)
│   ├── ingestion.py             # Asynchronous ingestion engine
│   ├── extractor.py             # Entity extraction controller
│   ├── llm_client.py            # Multi-tier LLM gateway (Gemini/Groq/DeepSeek)
│   ├── freshness.py             # 24-hour freshness validation engine
│   ├── resolver.py              # Canonical entity resolution & deduplication
│   ├── export_data.py           # CSV export & data quality verification
│   ├── scale_ingestion.py       # Scaled ingestion driver script
│   └── tests/                   # Pytest automated test suite
├── exports/                     # Generated CSV exports & quality reports
│   ├── startups.csv
│   ├── products.csv
│   ├── research_papers.csv
│   ├── jobs.csv
│   ├── news.csv
│   ├── entity_mapping_log.csv
│   └── data_quality_report.json
├── src/                         # React 18 frontend
│   ├── App.tsx                  # Main workspace application component
│   ├── types.ts                 # TypeScript type definitions
│   └── ...
├── architecture.md              # Detailed architecture specification
├── metadata.json                # Applet configuration metadata
└── package.json                 # Node dependencies & Vite build scripts
```

---

## ⚙️ 6. Setup & Installation

### 1. Prerequisites
- **Node.js**: v18+
- **Python**: v3.11+
- **pip**: installed

### 2. Environment Variables
Create a `.env` file in the root directory:
```bash
GEMINI_API_KEY="your-gemini-api-key"
GROQ_API_KEY="your-groq-api-key"        # Optional fallback Tier 2
DEEPSEEK_API_KEY="your-deepseek-api-key"  # Optional fallback Tier 3
VITE_API_URL="http://localhost:8000"
```

### 3. Backend Startup
```bash
# Install Python backend dependencies
pip install -r backend/requirements.txt

# Start FastAPI backend server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Frontend Startup
```bash
# Install NPM dependencies
npm install

# Start Vite React dev server
npm run dev
```

---

## 📡 7. REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and database connectivity |
| `GET` | `/api/stats` | Platform aggregates and KPI statistics |
| `GET` | `/api/startups` | AI Startups with funding, valuation, and tech stack |
| `GET` | `/api/products` | AI Foundation models, tools, and pricing tags |
| `GET` | `/api/research-papers` | arXiv research papers with GitHub stars |
| `GET` | `/api/jobs` | Verified AI roles with 24-hour freshness filters |
| `GET` | `/api/news` | 24-hour AI industry dispatches with sentiment |
| `GET` | `/api/entity-mappings` | Entity resolution alias registry and confidence scores |
| `GET` | `/api/pipeline/progress`| Live ingestion progress, telemetry, and discovery rates |
| `POST` | `/api/pipeline/run` | Trigger an asynchronous data acquisition run |
| `GET` | `/api/llm/providers` | LLM gateway telemetry (latency, RPM, TPM) |
| `POST` | `/api/llm/test-extraction` | Playground for testing LLM extraction against raw text |

---

## 🧪 8. Testing & Verification

Run the comprehensive automated test suite (12 unit and integration tests):
```bash
pytest backend/tests/ -v
```

---

## 💾 9. Data Export & Quality Report

To re-run data validation and regenerate all CSV exports:
```bash
PYTHONPATH=. python3 backend/export_data.py
```

Generated files in `exports/`:
- `exports/startups.csv`
- `exports/products.csv`
- `exports/research_papers.csv`
- `exports/jobs.csv`
- `exports/news.csv`
- `exports/entity_mapping_log.csv`
- `exports/data_quality_report.json`

---

## ⚠️ 10. Known Limitations

- **Free-Tier Job APIs**: Real job postings strictly published within the last 24 hours naturally fluctuate based on current hiring volumes across external job boards (typically 15-50 verified postings/day).
- **Public API Rate Limits**: Unauthenticated calls to the GitHub API are rate-limited to 60 requests/hour; authenticated tokens raise this to 5,000/hour.
