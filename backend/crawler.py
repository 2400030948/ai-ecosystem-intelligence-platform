import asyncio
import random
import logging
from typing import Dict, Any, List, Optional
import aiohttp
from bs4 import BeautifulSoup

from backend.config import (
    CRAWLER_CONCURRENCY,
    CRAWLER_TIMEOUT_SEC,
    CRAWLER_MAX_RETRIES,
    CRAWLER_USER_AGENT
)

logger = logging.getLogger("ai_intelligence.crawler")

class AsyncCrawler:
    def __init__(
        self,
        concurrency: int = CRAWLER_CONCURRENCY,
        timeout_sec: int = CRAWLER_TIMEOUT_SEC,
        max_retries: int = CRAWLER_MAX_RETRIES
    ):
        self.semaphore = asyncio.Semaphore(concurrency)
        self.timeout = aiohttp.ClientTimeout(total=timeout_sec, connect=5)
        self.max_retries = max_retries
        self._session: Optional[aiohttp.ClientSession] = None

    async def get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            connector = aiohttp.TCPConnector(limit=50, limit_per_host=10, ssl=False)
            headers = {
                "User-Agent": CRAWLER_USER_AGENT,
                "Accept": "text/html,application/xhtml+xml,application/xml,application/json;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Cache-Control": "no-cache"
            }
            self._session = aiohttp.ClientSession(
                connector=connector,
                timeout=self.timeout,
                headers=headers
            )
        return self._session

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()

    async def crawl_url(self, url: str) -> Dict[str, Any]:
        """
        Asynchronously fetches a URL with retries, exponential backoff, jitter,
        and bot-detection handling.
        """
        async with self.semaphore:
            session = await self.get_session()
            for attempt in range(1, self.max_retries + 1):
                try:
                    logger.info(f"Crawling {url} (Attempt {attempt}/{self.max_retries})")
                    async with session.get(url, allow_redirects=True) as response:
                        status = response.status
                        
                        # 1. Successful response
                        if status == 200:
                            content_type = response.headers.get("Content-Type", "").lower()
                            if "application/json" in content_type:
                                data = await response.json()
                                text = await response.text()
                                return {
                                    "url": str(response.url),
                                    "status": 200,
                                    "is_json": True,
                                    "json_data": data,
                                    "raw_text": text,
                                    "success": True,
                                    "error": None
                                }
                            else:
                                raw_text = await response.text()
                                # Bot check for Cloudflare / Datadome challenge
                                if any(x in raw_text.lower() for x in ["cf-browser-verification", "ddos-guard", "please turn javascript on", "ray id"]):
                                    logger.warning(f"Bot protection challenge encountered on {url}")
                                    return {
                                        "url": str(response.url),
                                        "status": 403,
                                        "is_json": False,
                                        "raw_text": raw_text[:2000],
                                        "success": False,
                                        "error": "Bot Protection Challenge Detected"
                                    }

                                return {
                                    "url": str(response.url),
                                    "status": 200,
                                    "is_json": False,
                                    "raw_text": raw_text,
                                    "success": True,
                                    "error": None
                                }

                        # 2. Permanent client errors (don't retry 404, 410, 401)
                        if status in [404, 410, 401]:
                            logger.warning(f"Non-recoverable HTTP status {status} for {url}")
                            return {
                                "url": url,
                                "status": status,
                                "is_json": False,
                                "raw_text": "",
                                "success": False,
                                "error": f"HTTP {status}"
                            }

                        # 3. Rate limited (429) or Server errors (500, 502, 503, 504) -> Retry with backoff
                        if status in [429, 500, 502, 503, 504]:
                            logger.warning(f"Transient HTTP {status} for {url}, retrying...")
                            if attempt < self.max_retries:
                                backoff = (2 ** attempt) + random.uniform(0.1, 1.0)
                                await asyncio.sleep(backoff)
                                continue

                        return {
                            "url": url,
                            "status": status,
                            "is_json": False,
                            "raw_text": "",
                            "success": False,
                            "error": f"HTTP {status}"
                        }

                except (aiohttp.ClientError, asyncio.TimeoutError) as e:
                    logger.warning(f"Network error on {url} (attempt {attempt}): {str(e)}")
                    if attempt < self.max_retries:
                        backoff = (2 ** attempt) + random.uniform(0.1, 0.8)
                        await asyncio.sleep(backoff)
                    else:
                        return {
                            "url": url,
                            "status": 0,
                            "is_json": False,
                            "raw_text": "",
                            "success": False,
                            "error": f"Network Error: {str(e)}"
                        }
                except Exception as e:
                    logger.error(f"Unexpected crawler error on {url}: {str(e)}")
                    return {
                        "url": url,
                        "status": 0,
                        "is_json": False,
                        "raw_text": "",
                        "success": False,
                        "error": str(e)
                    }

            return {
                "url": url,
                "status": 0,
                "is_json": False,
                "raw_text": "",
                "success": False,
                "error": "Max retries exceeded"
            }

    async def crawl_many(self, urls: List[str]) -> List[Dict[str, Any]]:
        """Concurrent batch crawl for a list of URLs."""
        tasks = [self.crawl_url(u) for u in urls]
        return await asyncio.gather(*tasks, return_exceptions=False)

# Global singleton
crawler_instance = AsyncCrawler()

async def crawl_url(url: str) -> Dict[str, Any]:
    return await crawler_instance.crawl_url(url)

async def crawl_many(urls: List[str]) -> List[Dict[str, Any]]:
    return await crawler_instance.crawl_many(urls)
