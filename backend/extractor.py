import re
import json
import logging
import uuid
import aiohttp
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from backend.schemas import (
    StartupExtraction,
    ProductExtraction,
    ResearchPaperExtraction,
    JobExtraction,
    NewsExtraction,
    BenchmarkMetric
)
from backend.llm_client import llm_client_instance
from backend.resolver import resolve_canonical_entity
from backend.freshness import evaluate_freshness

logger = logging.getLogger("ai_intelligence.extractor")

async def fetch_real_github_stars(github_url: str) -> Optional[int]:
    """
    Fetches real GitHub repository star count from public GitHub API.
    Never invents or hallucinates stars.
    """
    if not github_url or "github.com" not in github_url:
        return None

    # Parse owner and repo from URL
    match = re.search(r'github\.com/([^/]+)/([^/#?]+)', github_url)
    if not match:
        return None

    owner, repo = match.group(1), match.group(2)
    # Strip .git suffix if present
    repo = re.sub(r'\.git$', '', repo)

    api_url = f"https://api.github.com/repos/{owner}/{repo}"
    try:
        async with aiohttp.ClientSession() as session:
            headers = {"User-Agent": "AI-Intelligence-StarFetcher/1.0"}
            async with session.get(api_url, headers=headers, timeout=aiohttp.ClientTimeout(total=5)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    stars = data.get("stargazers_count")
                    if isinstance(stars, int):
                        return stars
                else:
                    logger.debug(f"GitHub API returned HTTP {resp.status} for {owner}/{repo}")
    except Exception as e:
        logger.debug(f"Could not retrieve real GitHub stars for {github_url}: {str(e)}")

    return None

class ContentExtractor:
    def __init__(self):
        self.llm = llm_client_instance

    async def extract_startup(self, raw_content: str, source_url: str, source_name: str) -> Optional[StartupExtraction]:
        res = await self.llm.extract_structured_data(raw_content, "startup", source_url)
        data = res.get("data", {})
        if not data or not data.get("name"):
            return None

        raw_name = data["name"]
        canonical_name, confidence, tier, criteria = resolve_canonical_entity(raw_name, "Startup")

        startup = StartupExtraction(
            id=f"st-{uuid.uuid4().hex[:6]}",
            name=canonical_name,
            legalName=data.get("legal_name") or raw_name,
            stage=data.get("stage") or "Growth",
            totalFunding=data.get("total_funding") or data.get("funding_round_size"),
            valuation=data.get("valuation"),
            leadInvestors=data.get("lead_investors") if isinstance(data.get("lead_investors"), list) else ([data["lead_investor"]] if data.get("lead_investor") else []),
            domain=data.get("domain"),
            headquarters=data.get("headquarters"),
            employeeRange=data.get("employee_range"),
            flagshipProduct=data.get("flagship_product"),
            techStack=data.get("tech_stack", []),
            tags=data.get("tags", []),
            summary=data.get("summary") or f"Intelligence profile extracted for {canonical_name}.",
            verified=True,
            discoveredAt=datetime.now(timezone.utc).isoformat(),
            source=source_name,
            sourceUrl=source_url
        )
        return startup

    async def extract_product(self, raw_content: str, source_url: str, source_name: str) -> Optional[ProductExtraction]:
        res = await self.llm.extract_structured_data(raw_content, "product", source_url)
        data = res.get("data", {})
        if not data or not data.get("name") and not data.get("product_name"):
            return None

        name = data.get("name") or data.get("product_name")
        raw_maker = data.get("maker") or "AI Ecosystem"
        canonical_maker, _, _, _ = resolve_canonical_entity(raw_maker, "Startup")

        pricing = (data.get("pricing_model") or "PAID").upper()
        if pricing not in ["FREE", "FREEMIUM", "PAID", "ENTERPRISE"]:
            pricing = "PAID"

        product = ProductExtraction(
            id=f"prod-{uuid.uuid4().hex[:6]}",
            name=name,
            maker=canonical_maker,
            category=data.get("category") or "Foundation Model",
            pricingModel=pricing,
            deploymentType=data.get("deployment_type") or "Cloud Managed",
            benchmarkScore=data.get("benchmark_score"),
            contextWindow=data.get("context_window"),
            license=data.get("license"),
            capabilities=data.get("capabilities", []),
            releaseDate=data.get("release_date"),
            productUrl=data.get("product_url") or source_url,
            verified=True,
            discoveredAt=datetime.now(timezone.utc).isoformat(),
            source=source_name,
            sourceUrl=source_url
        )
        return product

    async def extract_research_paper(self, raw_content: str, source_url: str, source_name: str, structured_item: Optional[Dict] = None) -> Optional[ResearchPaperExtraction]:
        # If arXiv XML entry was parsed directly, prioritize structured metadata
        if structured_item and structured_item.get("title"):
            title = structured_item["title"]
            authors = structured_item.get("authors", [])
            abstract = structured_item.get("abstract", "")
            paper_url = structured_item.get("paper_url") or source_url
            pub_date = structured_item.get("published_date") or datetime.now(timezone.utc).isoformat()
            categories = structured_item.get("categories", ["cs.AI"])
            github_url = structured_item.get("github_url")
        else:
            res = await self.llm.extract_structured_data(raw_content, "research_paper", source_url)
            data = res.get("data", {})
            if not data or (not data.get("title") and not data.get("paper_title")):
                return None

            title = data.get("title") or data.get("paper_title")
            authors = data.get("authors", [])
            abstract = data.get("abstract", "")
            paper_url = data.get("paper_url") or source_url
            pub_date = data.get("published_date") or datetime.now(timezone.utc).isoformat()
            categories = data.get("categories", ["cs.AI"])
            github_url = data.get("github_url")

        # Anti-Hallucination: Fetch real GitHub stars directly via GitHub API
        real_stars = None
        if github_url:
            real_stars = await fetch_real_github_stars(github_url)

        paper = ResearchPaperExtraction(
            id=f"rp-{uuid.uuid4().hex[:6]}",
            title=title,
            authors=authors if isinstance(authors, list) else [authors],
            abstract=abstract,
            categories=categories if isinstance(categories, list) else [categories],
            githubUrl=github_url,
            githubStars=real_stars,
            paperUrl=paper_url,
            publishedDate=pub_date,
            benchmarks=[],
            discoveredAt=datetime.now(timezone.utc).isoformat(),
            source=source_name,
            sourceUrl=source_url
        )
        return paper

    async def extract_job(self, raw_content: str, source_url: str, source_name: str) -> Optional[JobExtraction]:
        is_fresh, pub_iso, hours_ago, label = evaluate_freshness(html_content=raw_content)
        if not is_fresh or not pub_iso:
            logger.info(f"Job rejected due to freshness filter (>24h or unknown date): {source_url}")
            return None

        res = await self.llm.extract_structured_data(raw_content, "job", source_url)
        data = res.get("data", {})
        if not data or not data.get("title") or not data.get("company"):
            return None

        raw_company = data["company"]
        canonical_company, _, _, _ = resolve_canonical_entity(raw_company, "Startup")

        job = JobExtraction(
            id=f"job-{uuid.uuid4().hex[:6]}",
            title=data["title"],
            company=raw_company,
            canonicalCompany=canonical_company,
            roleFamily=data.get("role_family") or "ML Engineering",
            location=data.get("location") or "Remote",
            remote=bool(data.get("remote", True)),
            experienceLevel=data.get("experience_level") or "Senior",
            compensation=data.get("compensation"),
            techStack=data.get("tech_stack", []),
            jobUrl=data.get("job_url") or source_url,
            postedDate=pub_iso,
            freshnessLabel=label,
            isWithin24Hours=True,
            discoveredAt=datetime.now(timezone.utc).isoformat(),
            source=source_name,
            sourceUrl=source_url
        )
        return job

    async def extract_news(self, raw_content: str, source_url: str, source_name: str, pub_date_hint: Optional[str] = None) -> Optional[NewsExtraction]:
        is_fresh, pub_iso, hours_ago, label = evaluate_freshness(date_input=pub_date_hint, html_content=raw_content)
        if not is_fresh or not pub_iso:
            logger.info(f"News item rejected due to freshness constraint: {source_url}")
            return None

        res = await self.llm.extract_structured_data(raw_content, "news", source_url)
        data = res.get("data", {})
        headline = data.get("headline") or data.get("title")
        if not headline:
            return None

        referenced = data.get("referenced_entities", [])
        canonical_entities = []
        for entity in referenced:
            canon, _, _, _ = resolve_canonical_entity(entity, "Startup")
            canonical_entities.append(canon)

        news = NewsExtraction(
            id=f"news-{uuid.uuid4().hex[:6]}",
            headline=headline,
            summary=data.get("summary") or headline,
            sourceName=source_name,
            url=source_url,
            publishedAt=pub_iso,
            freshnessLabel=label,
            hoursAgo=hours_ago,
            isFresh=True,
            category=data.get("category") or "Model Release",
            sentiment=data.get("sentiment") or "Positive",
            referencedEntities=canonical_entities,
            discoveredAt=datetime.now(timezone.utc).isoformat(),
            source=source_name,
            sourceUrl=source_url
        )
        return news

extractor_instance = ContentExtractor()
