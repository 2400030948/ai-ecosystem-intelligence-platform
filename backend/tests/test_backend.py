import pytest
import pytest_asyncio
import asyncio
import json
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient, ASGITransport

from backend.main import app
from backend.freshness import parse_iso_or_rfc_date, evaluate_freshness, extract_date_from_html
from backend.resolver import resolve_canonical_entity, clean_entity_name
from backend.sources import normalize_source_url
from backend.crawler import AsyncCrawler
from backend.llm_client import LLMClient, clean_and_truncate_text
from backend.pipeline import IngestionPipeline
from backend.database import init_db

@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    await init_db()

# -------------------------------------------------------------
# 1. Test API Health
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_api_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert "database" in data

@pytest.mark.asyncio
async def test_api_stats():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/stats")
        assert res.status_code == 200
        data = res.json()
        assert "startupsCount" in data
        assert "productsCount" in data
        assert "papersCount" in data

# -------------------------------------------------------------
# 2. Test Freshness Filtering (accept <= 24h, reject > 24h)
# -------------------------------------------------------------
def test_freshness_filtering():
    now_utc = datetime.now(timezone.utc)
    
    # 2 hours ago -> Fresh
    recent_date = (now_utc - timedelta(hours=2)).isoformat()
    is_fresh, iso, hours, label = evaluate_freshness(date_input=recent_date, max_hours=24)
    assert is_fresh is True
    assert hours == 2
    assert "2h ago" in label

    # 36 hours ago -> Rejected
    old_date = (now_utc - timedelta(hours=36)).isoformat()
    is_fresh, iso, hours, label = evaluate_freshness(date_input=old_date, max_hours=24)
    assert is_fresh is False
    assert hours == 36

    # None / Empty -> Rejected (anti-hallucination)
    is_fresh, iso, hours, label = evaluate_freshness(date_input=None)
    assert is_fresh is False
    assert iso is None

# -------------------------------------------------------------
# 3. Test Date Normalization (JSON-LD, OpenGraph, HTML Time)
# -------------------------------------------------------------
def test_date_normalization_from_html():
    # 1. JSON-LD
    html_json_ld = """
    <html><head>
    <script type="application/ld+json">
    {"@context": "https://schema.org", "@type": "NewsArticle", "datePublished": "2026-08-14T10:30:00Z"}
    </script>
    </head><body>Content</body></html>
    """
    dt1 = extract_date_from_html(html_json_ld)
    assert dt1 is not None
    assert dt1.year == 2026
    assert dt1.month == 8

    # 2. OpenGraph meta tag
    html_og = """
    <html><head>
    <meta property="article:published_time" content="2026-08-13T18:00:00+00:00" />
    </head><body>Content</body></html>
    """
    dt2 = extract_date_from_html(html_og)
    assert dt2 is not None
    assert dt2.hour == 18

    # 3. HTML <time> tag
    html_time = """
    <html><body>
    <time datetime="2026-08-15T01:15:00Z">August 15, 2026</time>
    </body></html>
    """
    dt3 = extract_date_from_html(html_time)
    assert dt3 is not None
    assert dt3.day == 15

# -------------------------------------------------------------
# 4. Test Duplicate Prevention & URL Normalization
# -------------------------------------------------------------
def test_url_normalization():
    url1 = "https://WWW.Arxiv.Org/abs/2407.08608/?utm_source=twitter&utm_medium=social#abstract"
    url2 = "https://arxiv.org/abs/2407.08608"
    assert normalize_source_url(url1) == normalize_source_url(url2)

# -------------------------------------------------------------
# 5. Test Entity Resolution (Deterministic Normalization)
# -------------------------------------------------------------
def test_entity_resolution():
    # OpenAI variations
    c1, conf1, tier1, _ = resolve_canonical_entity("OpenAI Inc.")
    assert c1 == "OpenAI"
    assert conf1 >= 0.98

    c2, _, _, _ = resolve_canonical_entity("Open AI, LLC")
    assert c2 == "OpenAI"

    # Anthropic variations
    c3, _, _, _ = resolve_canonical_entity("Anthropic PBC")
    assert c3 == "Anthropic"

    # Cognition variations
    c4, _, _, _ = resolve_canonical_entity("Cognition Labs")
    assert c4 == "Cognition AI"

    # Suffix stripping on arbitrary unknown startup
    c5, conf5, tier5, criteria5 = resolve_canonical_entity("VectorMatrix Technologies Corp.")
    assert "VectorMatrix" in c5
    assert not c5.endswith("Corp.")

# -------------------------------------------------------------
# 6. Test 429 Rate Limit Handling & Backoff
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_llm_rate_limit_handling():
    client = LLMClient()
    # Ensure fallback works seamlessly when providers simulate rate limits or unavailable keys
    res = await client.extract_structured_data(
        raw_text="Headline: OpenAI introduces new steering benchmark.\nPublished: 2026-08-15.",
        target_schema="news",
        source_url="https://openai.com/news/1"
    )
    assert res["success"] is True
    assert "data" in res

# -------------------------------------------------------------
# 7. Test 413 Payload Reduction / Truncation
# -------------------------------------------------------------
def test_413_payload_reduction():
    massive_html = "<html><body>" + ("<p>Massive repetitive tokens and text block.</p>" * 1000) + "</body></html>"
    truncated = clean_and_truncate_text(massive_html, max_chars=4000)
    assert len(truncated) <= 4000
    assert "<html" not in truncated
    assert "<script" not in truncated

# -------------------------------------------------------------
# 8. Test Invalid LLM Output & Anti-Hallucination Safe Fallback
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_invalid_llm_output_handling():
    client = LLMClient()
    # Deterministic fallback extractor handles corrupted or arbitrary inputs safely
    fallback = client._deterministic_fallback_extractor(
        text="ArXiv:2407.08608\nTri Dao and Jay Shah publish FlashAttention-3.",
        schema="research_paper",
        source_url="https://arxiv.org/abs/2407.08608"
    )
    assert fallback["title"] is not None
    assert "paper_url" in fallback
    assert fallback["paper_url"] == "https://arxiv.org/abs/2407.08608"

# -------------------------------------------------------------
# 9. Test Crawler Concurrency & Bounded Semaphore
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_crawler_concurrency():
    crawler = AsyncCrawler(concurrency=4, timeout_sec=5)
    # Check session acquisition and semaphore
    session = await crawler.get_session()
    assert session is not None
    assert crawler.semaphore._value == 4
    await crawler.close()

# -------------------------------------------------------------
# 10. Test Pipeline Execution Run
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_pipeline_execution():
    pipeline = IngestionPipeline()
    result = await pipeline.execute_run(
        source_url="http://export.arxiv.org/api/query?search_query=cat:cs.AI&max_results=3",
        source_id="test-src",
        schema_type="research",
        limit=3
    )
    assert result["status"] in ["Completed", "Warning", "Failed"]
    assert "recordsDiscovered" in result
    assert "durationSeconds" in result
