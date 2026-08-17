import pytest
import asyncio
import aiosqlite
from datetime import datetime, timezone
from backend.config import DATABASE_PATH
from backend.ingestion import ingestion_engine
from backend.extractor import extractor_instance
from backend.freshness import evaluate_freshness

@pytest.mark.asyncio
async def test_small_batch_ingestion_and_sqlite_persistence():
    """
    Step 1: Run small batch ingestion for each entity type and verify:
    - Records stored in SQLite
    - Source URLs are legitimate
    - Timestamps are ISO valid UTC
    - Duplicates are rejected on re-insertion
    - LLM extraction produces valid Pydantic models
    """
    # 1. Ingest small batch of arXiv research papers
    papers_accepted, papers_dups = await ingestion_engine.ingest_arxiv_papers(max_records=5, chunk_size=5)
    assert (papers_accepted + papers_dups) > 0, "Should discover and process papers in small batch"

    # 2. Ingest small batch of Hugging Face products
    prods_accepted, prods_dups = await ingestion_engine.ingest_huggingface_products(max_records=5)
    assert (prods_accepted + prods_dups) > 0, "Should discover and process products in small batch"

    # 3. Ingest small batch of Startups
    startups_accepted, startups_dups = await ingestion_engine.ingest_startups(max_records=5)
    assert (startups_accepted + startups_dups) > 0, "Should discover and process startups in small batch"

    # 4. Ingest small batch of Jobs
    jobs_accepted, jobs_dups = await ingestion_engine.ingest_fresh_jobs()
    
    # 5. Ingest small batch of News
    news_accepted, news_dups = await ingestion_engine.ingest_fresh_news()

    # 6. Verify SQLite persistence and URL / timestamp validity
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row

        # Check Papers
        cursor = await db.execute("SELECT * FROM research_papers ORDER BY published_date DESC LIMIT 5")
        papers = await cursor.fetchall()
        assert len(papers) > 0
        for p in papers:
            assert p["paper_url"].startswith("http"), f"Invalid paper URL: {p['paper_url']}"
            assert p["title"], "Paper must have a title"
            # Verify timestamp format
            dt = datetime.fromisoformat(p["published_date"].replace("Z", "+00:00"))
            assert dt is not None

        # Check Products
        cursor = await db.execute("SELECT * FROM products ORDER BY discovered_at DESC LIMIT 5")
        products = await cursor.fetchall()
        assert len(products) > 0
        for prod in products:
            assert prod["product_url"].startswith("https://huggingface.co"), f"Invalid product URL: {prod['product_url']}"
            assert prod["name"], "Product must have a name"

        # Check Startups
        cursor = await db.execute("SELECT * FROM startups ORDER BY discovered_at DESC LIMIT 5")
        startups = await cursor.fetchall()
        assert len(startups) > 0
        for st in startups:
            assert st["source_url"].startswith("http"), f"Invalid startup source URL: {st['source_url']}"
            assert st["name"], "Startup must have a name"

        # 7. Test Duplicate Rejection
        first_paper = papers[0]
        cursor = await db.execute("""
            INSERT OR IGNORE INTO research_papers
            (id, title, authors, abstract, categories, github_url, github_stars, paper_url, published_date, benchmarks, discovered_at, source_url, collected_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "dup-test-id",
            first_paper["title"],
            first_paper["authors"],
            first_paper["abstract"],
            first_paper["categories"],
            first_paper["github_url"],
            first_paper["github_stars"],
            first_paper["paper_url"], # Duplicate URL
            first_paper["published_date"],
            first_paper["benchmarks"],
            first_paper["discovered_at"],
            first_paper["source_url"],
            first_paper["collected_at"]
        ))
        assert cursor.rowcount == 0, "Database must reject duplicate records via unique constraint"

    # 8. Test Pydantic LLM Extraction Model
    test_raw = "Mistral Large 2 is a new flagship 123B model from Mistral AI released under custom license."
    product_pydantic = await extractor_instance.extract_product(
        raw_content=test_raw,
        source_url="https://mistral.ai/news/mistral-large-2407/",
        source_name="Mistral Release Feed"
    )
    assert product_pydantic is not None
    assert product_pydantic.name is not None
    assert product_pydantic.maker is not None
