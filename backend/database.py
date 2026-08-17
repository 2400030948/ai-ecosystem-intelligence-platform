import aiosqlite
import json
import logging
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.config import DATABASE_PATH

logger = logging.getLogger("ai_intelligence.database")

async def get_db():
    db = await aiosqlite.connect(DATABASE_PATH)
    db.row_factory = aiosqlite.Row
    try:
        yield db
    finally:
        await db.close()

async def init_db():
    """Initialize database tables and indexes."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("PRAGMA journal_mode=WAL;")
        await db.execute("PRAGMA foreign_keys=ON;")

        # Startups
        await db.execute("""
            CREATE TABLE IF NOT EXISTS startups (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                legal_name TEXT,
                stage TEXT DEFAULT 'Growth',
                total_funding TEXT,
                valuation TEXT,
                lead_investors TEXT, -- JSON array
                domain TEXT,
                headquarters TEXT,
                employee_range TEXT,
                flagship_product TEXT,
                tech_stack TEXT, -- JSON array
                tags TEXT, -- JSON array
                summary TEXT,
                verified INTEGER DEFAULT 1,
                discovered_at TEXT,
                source_url TEXT UNIQUE,
                collected_at TEXT
            );
        """)
        await db.execute("CREATE INDEX IF NOT EXISTS idx_startups_name ON startups(name);")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_startups_stage ON startups(stage);")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_startups_source_url ON startups(source_url);")

        # Products
        await db.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                maker TEXT NOT NULL,
                category TEXT NOT NULL,
                pricing_model TEXT DEFAULT 'PAID',
                deployment_type TEXT,
                benchmark_score TEXT,
                context_window TEXT,
                license TEXT,
                capabilities TEXT, -- JSON array
                release_date TEXT,
                product_url TEXT,
                verified INTEGER DEFAULT 1,
                discovered_at TEXT,
                source_url TEXT UNIQUE,
                collected_at TEXT
            );
        """)
        await db.execute("CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_products_maker ON products(maker);")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_products_pricing ON products(pricing_model);")

        # Research Papers
        await db.execute("""
            CREATE TABLE IF NOT EXISTS research_papers (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                authors TEXT, -- JSON array
                abstract TEXT,
                categories TEXT, -- JSON array
                github_url TEXT,
                github_stars INTEGER DEFAULT 0,
                paper_url TEXT UNIQUE NOT NULL,
                published_date TEXT NOT NULL,
                benchmarks TEXT, -- JSON array
                discovered_at TEXT,
                source_url TEXT,
                collected_at TEXT
            );
        """)
        await db.execute("CREATE INDEX IF NOT EXISTS idx_papers_title ON research_papers(title);")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_papers_published ON research_papers(published_date);")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_papers_url ON research_papers(paper_url);")

        # Jobs
        await db.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                company TEXT NOT NULL,
                canonical_company TEXT,
                role_family TEXT NOT NULL,
                location TEXT NOT NULL,
                remote INTEGER DEFAULT 0,
                experience_level TEXT DEFAULT 'Mid-Senior',
                compensation TEXT,
                tech_stack TEXT, -- JSON array
                job_url TEXT UNIQUE NOT NULL,
                posted_date TEXT NOT NULL,
                freshness_label TEXT DEFAULT 'Within 24 hours',
                is_within_24h INTEGER DEFAULT 1,
                discovered_at TEXT,
                source_url TEXT,
                collected_at TEXT
            );
        """)
        await db.execute("CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_jobs_role ON jobs(role_family);")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_jobs_posted ON jobs(posted_date);")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_jobs_url ON jobs(job_url);")

        # News
        await db.execute("""
            CREATE TABLE IF NOT EXISTS news (
                id TEXT PRIMARY KEY,
                headline TEXT NOT NULL,
                summary TEXT NOT NULL,
                source_name TEXT NOT NULL,
                url TEXT UNIQUE NOT NULL,
                published_at TEXT NOT NULL,
                freshness_label TEXT DEFAULT 'Recent',
                hours_ago INTEGER DEFAULT 0,
                is_fresh INTEGER DEFAULT 1,
                category TEXT DEFAULT 'Model Release',
                sentiment TEXT DEFAULT 'Neutral',
                referenced_entities TEXT, -- JSON array
                discovered_at TEXT,
                source_url TEXT,
                collected_at TEXT
            );
        """)
        await db.execute("CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_at);")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_news_url ON news(url);")

        # Entity Mappings
        await db.execute("""
            CREATE TABLE IF NOT EXISTS entity_mappings (
                id TEXT PRIMARY KEY,
                raw_name TEXT NOT NULL,
                canonical_name TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                confidence REAL NOT NULL,
                confidence_tier TEXT NOT NULL,
                source TEXT NOT NULL,
                source_record_id TEXT,
                status TEXT DEFAULT 'Confirmed',
                match_criteria TEXT, -- JSON array
                discovered_at TEXT,
                UNIQUE(raw_name, entity_type)
            );
        """)
        await db.execute("CREATE INDEX IF NOT EXISTS idx_mappings_raw ON entity_mappings(raw_name);")
        await db.execute("CREATE INDEX IF NOT EXISTS idx_mappings_canonical ON entity_mappings(canonical_name);")

        # Sources
        await db.execute("""
            CREATE TABLE IF NOT EXISTS sources (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                url TEXT UNIQUE NOT NULL,
                status TEXT DEFAULT 'Active',
                last_crawl TEXT DEFAULT 'Never',
                crawl_frequency TEXT DEFAULT '15m',
                records_found INTEGER DEFAULT 0,
                total_records_ingested INTEGER DEFAULT 0,
                error_rate REAL DEFAULT 0.0
            );
        """)

        # Pipeline Runs
        await db.execute("""
            CREATE TABLE IF NOT EXISTS pipeline_runs (
                id TEXT PRIMARY KEY,
                run_number INTEGER,
                source TEXT NOT NULL,
                source_id TEXT NOT NULL,
                records INTEGER DEFAULT 0,
                valid_records INTEGER DEFAULT 0,
                rejected_records INTEGER DEFAULT 0,
                duration_seconds REAL DEFAULT 0.0,
                started_at TEXT NOT NULL,
                completed_at TEXT,
                status TEXT NOT NULL,
                llm_model_used TEXT NOT NULL,
                error_details TEXT
            );
        """)
        await db.execute("CREATE INDEX IF NOT EXISTS idx_runs_started ON pipeline_runs(started_at);")

        await db.commit()
        await seed_initial_sources_if_empty(db)
        await seed_initial_entities_if_empty(db)

async def seed_initial_sources_if_empty(db: aiosqlite.Connection):
    cursor = await db.execute("SELECT COUNT(*) FROM sources;")
    count = (await cursor.fetchone())[0]
    if count == 0:
        seed_sources = [
            ("src-01", "ArXiv AI Research Feed (cs.AI / cs.CL / cs.LG)", "ARXIV", "http://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL&sortBy=submittedDate&sortOrder=descending&max_results=25", "Active", "12m ago", "15m", 320, 1420, 0.02),
            ("src-02", "HuggingFace Daily Papers", "API", "https://huggingface.co/api/daily_papers", "Active", "24m ago", "30m", 180, 890, 0.01),
            ("src-03", "Y Combinator AI Companies RSS Feed", "RSS", "https://news.ycombinator.com/rss", "Active", "8m ago", "10m", 140, 620, 0.00),
            ("src-04", "TechCrunch AI Feed", "RSS", "https://techcrunch.com/category/artificial-intelligence/feed/", "Active", "15m ago", "20m", 210, 940, 0.03),
            ("src-05", "VentureBeat AI News", "RSS", "https://venturebeat.com/category/ai/feed/", "Active", "30m ago", "30m", 160, 780, 0.01),
            ("src-06", "OpenAI Research & Announcements", "HTML", "https://openai.com/news/rss.xml", "Active", "1h ago", "1h", 45, 230, 0.00)
        ]
        for s in seed_sources:
            await db.execute("""
                INSERT OR IGNORE INTO sources 
                (id, name, type, url, status, last_crawl, crawl_frequency, records_found, total_records_ingested, error_rate)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, s)
        await db.commit()

async def seed_initial_entities_if_empty(db: aiosqlite.Connection):
    cursor = await db.execute("SELECT COUNT(*) FROM startups;")
    count = (await cursor.fetchone())[0]
    if count == 0:
        # Seed Baseline Startups
        startups = [
            (
                "st-01", "Anthropic", "Anthropic PBC", "Series D", "$7.3B", "$18.4B",
                json.dumps(["Amazon", "Google", "Menlo Ventures", "Spark Capital"]),
                "anthropic.com", "San Francisco, CA", "500-1000", "Claude 3.5 Sonnet",
                json.dumps(["Constitutional AI", "RLHF", "Rust", "PyTorch", "Kubernetes"]),
                json.dumps(["Foundation Models", "Safety", "Enterprise AI", "LLM"]),
                "AI research and safety enterprise developing steering and frontier Claude language systems.",
                1, "2026-08-14T08:00:00Z", "https://anthropic.com/about", "2026-08-14T08:00:00Z"
            ),
            (
                "st-02", "Cognition AI", "Cognition Labs Inc.", "Series B", "$175M", "$2.0B",
                json.dumps(["Founders Fund", "Patrick Collison", "Elad Gil"]),
                "cognition.ai", "San Francisco, CA", "20-50", "Devin",
                json.dumps(["Autonomous Agents", "Code LLMs", "Sandboxed Execution", "TypeScript"]),
                json.dumps(["Agentic AI", "Developer Tools", "Code Synthesis"]),
                "Applied AI lab building Devin, the first fully autonomous software engineer agent.",
                1, "2026-08-14T10:00:00Z", "https://cognition.ai", "2026-08-14T10:00:00Z"
            ),
            (
                "st-03", "Mistral AI", "Mistral AI SAS", "Series B", "$1.1B", "$6.0B",
                json.dumps(["Andreessen Horowitz", "Lightspeed", "General Catalyst"]),
                "mistral.ai", "Paris, France", "100-250", "Mistral Large 2",
                json.dumps(["Mixture of Experts", "FlashAttention", "C++", "Triton"]),
                json.dumps(["Open Weights", "European AI", "Multilingual", "MoE"]),
                "European AI champion delivering high-performance open-weight and proprietary language models.",
                1, "2026-08-14T11:00:00Z", "https://mistral.ai", "2026-08-14T11:00:00Z"
            ),
            (
                "st-04", "Physical Intelligence", "Physical Intelligence Co.", "Series A", "$470M", "$2.4B",
                json.dumps(["Jeff Bezos", "Thrive Capital", "Lux Capital", "OpenAI"]),
                "physicalintelligence.company", "San Francisco, CA", "20-50", "π0 (pi-zero)",
                json.dumps(["Generalist Robot Policy", "VLA Models", "JAX", "MuJoCo"]),
                json.dumps(["Robotics", "Embodied AI", "Physical World Foundation"]),
                "Pioneering general-purpose foundation models and robot policies for physical machines.",
                1, "2026-08-14T12:00:00Z", "https://physicalintelligence.company", "2026-08-14T12:00:00Z"
            ),
            (
                "st-05", "Groq", "Groq Inc.", "Series D", "$640M", "$2.8B",
                json.dumps(["BlackRock", "Neuberger Berman", "Type One Ventures"]),
                "groq.com", "Mountain View, CA", "250-500", "LPU Inference Engine",
                json.dumps(["Language Processing Unit", "Compiler Architecture", "Ultra-low Latency"]),
                json.dumps(["AI Silicon", "Fast Inference", "Custom Hardware"]),
                "Creators of the LPU Inference Engine, delivering deterministic token throughput exceeding 800 t/s.",
                1, "2026-08-14T13:00:00Z", "https://groq.com", "2026-08-14T13:00:00Z"
            )
        ]
        for st in startups:
            await db.execute("""
                INSERT OR IGNORE INTO startups 
                (id, name, legal_name, stage, total_funding, valuation, lead_investors, domain, headquarters, employee_range, flagship_product, tech_stack, tags, summary, verified, discovered_at, source_url, collected_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, st)

        # Seed Baseline Products
        products = [
            (
                "prod-01", "Claude 3.5 Sonnet", "Anthropic", "Language Model", "PAID", "Managed API / Cloud",
                "93.7% HumanEval", "200k tokens", "Commercial API", json.dumps(["Artifacts UI", "Fast Coding", "Vision Analysis"]),
                "2026-06-20", "https://anthropic.com/claude", 1, "2026-08-14T08:00:00Z", "https://anthropic.com/claude-3-5", "2026-08-14T08:00:00Z"
            ),
            (
                "prod-02", "Devin 2.0", "Cognition AI", "Agentic Platform", "ENTERPRISE", "Cloud Sandbox",
                "48.6% SWE-bench", "128k tokens", "Proprietary", json.dumps(["Automated Debugging", "Repo Comprehension", "Test Synthesis"]),
                "2026-08-01", "https://cognition.ai/devin", 1, "2026-08-14T10:00:00Z", "https://cognition.ai/devin-2", "2026-08-14T10:00:00Z"
            ),
            (
                "prod-03", "Mistral Large 2", "Mistral AI", "Language Model", "PAID", "Self-Hosted / API",
                "84.0% MMLU", "128k tokens", "Commercial / Research", json.dumps(["123B Parameters", "Multilingual 80+ Langs", "Function Calling"]),
                "2026-07-24", "https://mistral.ai/news/mistral-large-2407", 1, "2026-08-14T11:00:00Z", "https://mistral.ai/news/large-2", "2026-08-14T11:00:00Z"
            ),
            (
                "prod-04", "π0 Generalist Robot Policy", "Physical Intelligence", "Robotics Foundation", "ENTERPRISE", "On-Device / Robot Embedded",
                "89.2% Task Success", "VLA Multimodal", "Proprietary", json.dumps(["Dexterous Manipulation", "Cross-Embodiment Transfer"]),
                "2026-08-10", "https://physicalintelligence.company/pi0", 1, "2026-08-14T12:00:00Z", "https://physicalintelligence.company/pi0-spec", "2026-08-14T12:00:00Z"
            )
        ]
        for p in products:
            await db.execute("""
                INSERT OR IGNORE INTO products 
                (id, name, maker, category, pricing_model, deployment_type, benchmark_score, context_window, license, capabilities, release_date, product_url, verified, discovered_at, source_url, collected_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, p)

        # Seed Baseline Papers
        papers = [
            (
                "rp-01", "FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-precision",
                json.dumps(["Tri Dao", "Jay Shah", "Dan Fu", "Christopher Ré"]),
                "FlashAttention-3 speedups reach up to 1.5-2.0x on Hopper H100 GPUs using Tensor Core asynchronous pipelines and FP8 quantization.",
                json.dumps(["cs.LG", "cs.DC", "cs.AI"]),
                "https://github.com/Dao-AILab/flash-attention", 21400,
                "https://arxiv.org/abs/2407.08608", "2026-08-14T14:20:00Z",
                json.dumps([{"name": "H100 Speedup", "score": "2.0x", "metric": "TFLOPs/s"}]),
                "2026-08-14T14:20:00Z", "https://arxiv.org/abs/2407.08608", "2026-08-14T14:20:00Z"
            ),
            (
                "rp-02", "Scaling Law for Pre-training with DeepSeek-V3",
                json.dumps(["DeepSeek AI Team", "Liang W.", "Pan S."]),
                "Architectural analysis of Multi-Head Latent Attention (MLA) and DeepSeekMoE, training 671B parameter models at fractions of traditional compute cost.",
                json.dumps(["cs.CL", "cs.AI"]),
                "https://github.com/deepseek-ai/DeepSeek-V3", 38200,
                "https://arxiv.org/abs/2412.19437", "2026-08-14T18:00:00Z",
                json.dumps([{"name": "Cost Efficiency", "score": "91.2%", "metric": "FLOP Parity"}]),
                "2026-08-14T18:00:00Z", "https://arxiv.org/abs/2412.19437", "2026-08-14T18:00:00Z"
            )
        ]
        for rp in papers:
            await db.execute("""
                INSERT OR IGNORE INTO research_papers 
                (id, title, authors, abstract, categories, github_url, github_stars, paper_url, published_date, benchmarks, discovered_at, source_url, collected_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, rp)

        # Seed Baseline Entity Mappings
        mappings = [
            ("em-01", "OpenAI Inc.", "OpenAI", "Startup", 1.0, "High", "SEC Filings", "sec-0912", "Confirmed", json.dumps(["Exact Canonical Token", "Suffix Strip"]), "2026-08-14T10:00:00Z"),
            ("em-02", "Anthropic PBC", "Anthropic", "Startup", 1.0, "High", "YC Directory", "yc-401", "Confirmed", json.dumps(["Public Benefit Corp suffix"]), "2026-08-14T10:00:00Z"),
            ("em-03", "Cognition Labs", "Cognition AI", "Startup", 0.98, "High", "GitHub Organization", "gh-cognition", "Confirmed", json.dumps(["Domain Aliasing"]), "2026-08-14T10:00:00Z"),
            ("em-04", "Modal Compute", "Modal Labs", "Startup", 0.94, "High", "HN Mention", "hn-3982", "Confirmed", json.dumps(["Lexical match"]), "2026-08-14T10:00:00Z")
        ]
        for em in mappings:
            await db.execute("""
                INSERT OR IGNORE INTO entity_mappings 
                (id, raw_name, canonical_name, entity_type, confidence, confidence_tier, source, source_record_id, status, match_criteria, discovered_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, em)

        # Seed Recent Pipeline Run
        await db.execute("""
            INSERT OR IGNORE INTO pipeline_runs
            (id, run_number, source, source_id, records, valid_records, rejected_records, duration_seconds, started_at, completed_at, status, llm_model_used, error_details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "run-101", 101, "ArXiv AI Research Feed", "src-01", 25, 24, 1, 3.42,
            "2026-08-15T02:00:00Z", "2026-08-15T02:00:03Z", "Completed", "gemini-2.5-flash", None
        ))

        await db.commit()
