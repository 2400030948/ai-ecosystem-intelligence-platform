import asyncio
import logging
import time
import aiosqlite
from backend.config import DATABASE_PATH
from backend.ingestion import ingestion_engine

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ai_intelligence.scale_ingestion")

async def run_scale_ingestion():
    t_start = time.time()
    ingestion_engine.reset_counters()
    logger.info("=== STARTING FULL DATA ACQUISITION PIPELINE ===")

    # 1. Research Papers Target: >= 1,000
    logger.info("\n--- 1/5 Acquiring Research Papers (Target: >= 1,000) ---")
    papers_accepted, papers_dups = await ingestion_engine.ingest_arxiv_papers(max_records=1300, chunk_size=350)
    logger.info(f"Research Papers Ingestion: {papers_accepted} accepted, {papers_dups} duplicates.")

    # 2. Products Target: >= 1,000
    logger.info("\n--- 2/5 Acquiring AI Products & Foundation Models (Target: >= 1,000) ---")
    prods_accepted, prods_dups = await ingestion_engine.ingest_huggingface_products(max_records=1300)
    logger.info(f"Products Ingestion: {prods_accepted} accepted, {prods_dups} duplicates.")

    # 3. Startups Target: >= 1,000
    logger.info("\n--- 3/5 Acquiring AI Startups (Target: >= 1,000) ---")
    startups_accepted, startups_dups = await ingestion_engine.ingest_startups(max_records=1300)
    logger.info(f"Startups Ingestion: {startups_accepted} accepted, {startups_dups} duplicates.")

    # 4. Jobs Target: All legitimate published within 24h
    logger.info("\n--- 4/5 Acquiring Fresh AI Jobs (Strict 24h filter) ---")
    jobs_accepted, jobs_dups = await ingestion_engine.ingest_fresh_jobs()
    logger.info(f"Fresh Jobs Ingestion: {jobs_accepted} accepted, {jobs_dups} duplicates.")

    # 5. News Target: All legitimate published within 24h
    logger.info("\n--- 5/5 Acquiring Fresh AI News (Strict 24h filter) ---")
    news_accepted, news_dups = await ingestion_engine.ingest_fresh_news()
    logger.info(f"Fresh News Ingestion: {news_accepted} accepted, {news_dups} duplicates.")

    total_runtime = round(time.time() - t_start, 2)
    ingestion_engine.status = "completed"

    # Query exact counts directly from SQLite
    async with aiosqlite.connect(DATABASE_PATH) as db:
        startups_total = (await (await db.execute("SELECT COUNT(*) FROM startups")).fetchone())[0]
        products_total = (await (await db.execute("SELECT COUNT(*) FROM products")).fetchone())[0]
        papers_total = (await (await db.execute("SELECT COUNT(*) FROM research_papers")).fetchone())[0]
        jobs_total = (await (await db.execute("SELECT COUNT(*) FROM jobs")).fetchone())[0]
        news_total = (await (await db.execute("SELECT COUNT(*) FROM news")).fetchone())[0]
        entity_mappings_total = (await (await db.execute("SELECT COUNT(*) FROM entity_mappings")).fetchone())[0]

    logger.info("\n=======================================================")
    logger.info("=== DATA ACQUISITION RUN COMPLETE ===")
    logger.info("=======================================================")
    logger.info(f"STARTUPS: {startups_total}")
    logger.info(f"PRODUCTS: {products_total}")
    logger.info(f"RESEARCH PAPERS: {papers_total}")
    logger.info(f"JOBS: {jobs_total}")
    logger.info(f"NEWS: {news_total}")
    logger.info(f"ENTITY MAPPINGS: {entity_mappings_total}")
    logger.info(f"Successful Sources: {ingestion_engine.successful_sources}")
    logger.info(f"Failed Sources: {ingestion_engine.failed_sources}")
    logger.info(f"Records Rejected: {ingestion_engine.records_rejected}")
    logger.info(f"Duplicate Records: {ingestion_engine.duplicate_records}")
    logger.info(f"Total Runtime: {total_runtime}s")
    logger.info("=======================================================\n")

if __name__ == "__main__":
    asyncio.run(run_scale_ingestion())
