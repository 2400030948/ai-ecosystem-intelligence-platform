import time
import json
import uuid
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import aiosqlite

from backend.config import DATABASE_PATH
from backend.crawler import crawl_url
from backend.sources import parse_arxiv_xml, parse_rss_feed, normalize_source_url
from backend.extractor import extractor_instance
from backend.resolver import resolve_canonical_entity

logger = logging.getLogger("ai_intelligence.pipeline")

class IngestionPipeline:
    def __init__(self):
        self.extractor = extractor_instance

    async def execute_run(self, source_url: Optional[str] = None, source_id: Optional[str] = None, schema_type: Optional[str] = None, limit: int = 15) -> Dict[str, Any]:
        """
        Executes an end-to-end ingestion pipeline run:
        Source -> Async Crawler -> Raw Content -> Freshness Filter -> LLM Extraction -> Pydantic Validation -> Entity Resolution -> SQLite Database
        """
        run_id = f"run-{uuid.uuid4().hex[:6]}"
        started_at = datetime.now(timezone.utc).isoformat()
        t0 = time.time()

        target_source_url = source_url or "http://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL&sortBy=submittedDate&sortOrder=descending&max_results=10"
        target_source_name = "ArXiv AI Research Feed" if "arxiv" in target_source_url else "AI RSS Feed"
        target_source_id = source_id or "src-01"

        records_discovered = 0
        records_accepted = 0
        records_rejected = 0
        errors = []

        logger.info(f"Starting pipeline run {run_id} on {target_source_url}")

        # 1. Async Crawler Stage
        crawl_res = await crawl_url(target_source_url)
        if not crawl_res.get("success"):
            err_msg = crawl_res.get("error") or f"Failed to crawl {target_source_url}"
            errors.append(err_msg)
            duration = round(time.time() - t0, 2)
            await self._record_run(
                run_id=run_id,
                source=target_source_name,
                source_id=target_source_id,
                discovered=0,
                accepted=0,
                rejected=0,
                duration=duration,
                started_at=started_at,
                status="Failed",
                error_details=err_msg
            )
            return {
                "runId": run_id,
                "status": "Failed",
                "recordsDiscovered": 0,
                "recordsAccepted": 0,
                "recordsRejected": 0,
                "durationSeconds": duration,
                "error": err_msg
            }

        raw_text = crawl_res.get("raw_text", "")
        
        # 2. Raw Content Parse Stage
        candidate_items = []
        if "arxiv.org" in target_source_url:
            candidate_items = parse_arxiv_xml(raw_text)
        elif "<rss" in raw_text or "<feed" in raw_text:
            candidate_items = parse_rss_feed(raw_text, target_source_name)
        else:
            candidate_items = [{
                "title": "Ingested Web Intelligence",
                "raw_text": raw_text[:5000],
                "source_url": target_source_url,
                "published_date": datetime.now(timezone.utc).isoformat()
            }]

        records_discovered = len(candidate_items)
        candidate_items = candidate_items[:limit]

        async with aiosqlite.connect(DATABASE_PATH) as db:
            for item in candidate_items:
                try:
                    clean_url = normalize_source_url(item.get("source_url") or target_source_url)
                    
                    # 3. Research Paper Branch
                    if "arxiv.org" in target_source_url or schema_type == "research":
                        extracted_paper = await self.extractor.extract_research_paper(
                            raw_content=item.get("raw_text", ""),
                            source_url=clean_url,
                            source_name=target_source_name,
                            structured_item=item
                        )
                        if extracted_paper:
                            # Insert into database with duplicate prevention
                            await db.execute("""
                                INSERT OR IGNORE INTO research_papers
                                (id, title, authors, abstract, categories, github_url, github_stars, paper_url, published_date, benchmarks, discovered_at, source_url, collected_at)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (
                                extracted_paper.id,
                                extracted_paper.title,
                                json.dumps(extracted_paper.authors),
                                extracted_paper.abstract,
                                json.dumps(extracted_paper.categories),
                                extracted_paper.githubUrl,
                                extracted_paper.githubStars,
                                extracted_paper.paperUrl,
                                extracted_paper.publishedDate,
                                json.dumps([b.dict() for b in extracted_paper.benchmarks]),
                                extracted_paper.discoveredAt,
                                extracted_paper.sourceUrl,
                                extracted_paper.collectedAt
                            ))
                            records_accepted += 1
                        else:
                            records_rejected += 1

                    # 4. News Branch
                    elif schema_type == "news" or "feed" in target_source_url or "rss" in target_source_url:
                        extracted_news = await self.extractor.extract_news(
                            raw_content=item.get("raw_text", ""),
                            source_url=clean_url,
                            source_name=target_source_name,
                            pub_date_hint=item.get("published_date")
                        )
                        if extracted_news:
                            await db.execute("""
                                INSERT OR IGNORE INTO news
                                (id, headline, summary, source_name, url, published_at, freshness_label, hours_ago, is_fresh, category, sentiment, referenced_entities, discovered_at, source_url, collected_at)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (
                                extracted_news.id,
                                extracted_news.headline,
                                extracted_news.summary,
                                extracted_news.sourceName,
                                extracted_news.url,
                                extracted_news.publishedAt,
                                extracted_news.freshnessLabel,
                                extracted_news.hoursAgo,
                                1 if extracted_news.isFresh else 0,
                                extracted_news.category,
                                extracted_news.sentiment,
                                json.dumps(extracted_news.referencedEntities),
                                extracted_news.discoveredAt,
                                extracted_news.sourceUrl,
                                extracted_news.collectedAt
                            ))
                            records_accepted += 1
                        else:
                            records_rejected += 1

                    # 5. Startup / Product Branch Fallback
                    else:
                        extracted_startup = await self.extractor.extract_startup(
                            raw_content=item.get("raw_text", ""),
                            source_url=clean_url,
                            source_name=target_source_name
                        )
                        if extracted_startup:
                            await db.execute("""
                                INSERT OR IGNORE INTO startups
                                (id, name, legal_name, stage, total_funding, valuation, lead_investors, domain, headquarters, employee_range, flagship_product, tech_stack, tags, summary, verified, discovered_at, source_url, collected_at)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (
                                extracted_startup.id,
                                extracted_startup.name,
                                extracted_startup.legalName,
                                extracted_startup.stage,
                                extracted_startup.totalFunding,
                                extracted_startup.valuation,
                                json.dumps(extracted_startup.leadInvestors),
                                extracted_startup.domain,
                                extracted_startup.headquarters,
                                extracted_startup.employeeRange,
                                extracted_startup.flagshipProduct,
                                json.dumps(extracted_startup.techStack),
                                json.dumps(extracted_startup.tags),
                                extracted_startup.summary,
                                1 if extracted_startup.verified else 0,
                                extracted_startup.discoveredAt,
                                extracted_startup.sourceUrl,
                                extracted_startup.collectedAt
                            ))
                            # Add entity resolution record
                            canon_name, conf, tier, criteria = resolve_canonical_entity(extracted_startup.name, "Startup")
                            await db.execute("""
                                INSERT OR IGNORE INTO entity_mappings
                                (id, raw_name, canonical_name, entity_type, confidence, confidence_tier, source, source_record_id, status, match_criteria, discovered_at)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (
                                f"em-{uuid.uuid4().hex[:6]}",
                                extracted_startup.legalName or extracted_startup.name,
                                canon_name,
                                "Startup",
                                conf,
                                tier,
                                target_source_name,
                                extracted_startup.id,
                                "Confirmed",
                                json.dumps(criteria),
                                extracted_startup.discoveredAt
                            ))
                            records_accepted += 1
                        else:
                            records_rejected += 1

                except Exception as e:
                    logger.warning(f"Error processing record item: {str(e)}")
                    errors.append(str(e))
                    records_rejected += 1

            # Update source stats
            await db.execute("""
                UPDATE sources 
                SET last_crawl = 'Just now',
                    records_found = records_found + ?,
                    total_records_ingested = total_records_ingested + ?
                WHERE id = ? OR url = ?
            """, (records_discovered, records_accepted, target_source_id, target_source_url))

            await db.commit()

        duration = round(time.time() - t0, 2)
        status = "Completed" if records_accepted > 0 or records_discovered > 0 else "Warning"

        await self._record_run(
            run_id=run_id,
            source=target_source_name,
            source_id=target_source_id,
            discovered=records_discovered,
            accepted=records_accepted,
            rejected=records_rejected,
            duration=duration,
            started_at=started_at,
            status=status,
            error_details="; ".join(errors) if errors else None
        )

        return {
            "runId": run_id,
            "status": status,
            "source": target_source_name,
            "recordsDiscovered": records_discovered,
            "recordsAccepted": records_accepted,
            "recordsRejected": records_rejected,
            "durationSeconds": duration,
            "startedAt": started_at,
            "completedAt": datetime.now(timezone.utc).isoformat(),
            "llmModelUsed": "gemini-2.5-flash",
            "errors": errors
        }

    async def _record_run(self, run_id: str, source: str, source_id: str, discovered: int, accepted: int, rejected: int, duration: float, started_at: str, status: str, error_details: Optional[str] = None):
        try:
            async with aiosqlite.connect(DATABASE_PATH) as db:
                await db.execute("""
                    INSERT INTO pipeline_runs
                    (id, run_number, source, source_id, records, valid_records, rejected_records, duration_seconds, started_at, completed_at, status, llm_model_used, error_details)
                    VALUES (?, (SELECT COALESCE(MAX(run_number), 100) + 1 FROM pipeline_runs), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    run_id, source, source_id, discovered, accepted, rejected, duration,
                    started_at, datetime.now(timezone.utc).isoformat(), status, "gemini-2.5-flash", error_details
                ))
                await db.commit()
        except Exception as e:
            logger.error(f"Failed to record pipeline run in DB: {str(e)}")

pipeline_instance = IngestionPipeline()
