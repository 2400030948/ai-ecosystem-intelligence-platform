import re
import json
import logging
from typing import Optional, Tuple
from datetime import datetime, timezone, timedelta
from dateutil import parser as date_parser
from bs4 import BeautifulSoup

from backend.config import FRESHNESS_WINDOW_HOURS

logger = logging.getLogger("ai_intelligence.freshness")

def parse_iso_or_rfc_date(date_str: str) -> Optional[datetime]:
    """Parse various string date formats into an aware UTC datetime object."""
    if not date_str or not isinstance(date_str, str):
        return None
    
    clean_str = date_str.strip()
    try:
        dt = date_parser.parse(clean_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        else:
            dt = dt.astimezone(timezone.utc)
        return dt
    except Exception:
        # Try custom common regex patterns if dateutil fails
        patterns = [
            r'(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})',
            r'(\d{4})-(\d{2})-(\d{2})',
            r'([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})'
        ]
        for p in patterns:
            match = re.search(p, clean_str)
            if match:
                try:
                    dt = date_parser.parse(match.group(0))
                    if dt.tzinfo is None:
                        dt = dt.replace(tzinfo=timezone.utc)
                    else:
                        dt = dt.astimezone(timezone.utc)
                    return dt
                except Exception:
                    continue
    return None

def extract_date_from_html(html_content: str) -> Optional[datetime]:
    """
    Extract publication date from HTML following strict hierarchy:
    1. JSON-LD
    2. OpenGraph / meta tags
    3. HTML <time> elements
    4. Regex pattern matching on text
    """
    if not html_content:
        return None

    soup = BeautifulSoup(html_content, 'html.parser')

    # 1. JSON-LD structured data
    for script in soup.find_all('script', type='application/ld+json'):
        try:
            data = json.loads(script.string or "{}")
            if isinstance(data, list):
                candidates = data
            elif isinstance(data, dict):
                candidates = [data] + data.get('@graph', [])
            else:
                candidates = []

            for item in candidates:
                for key in ['datePublished', 'dateCreated', 'dateModified', 'uploadDate']:
                    if key in item and item[key]:
                        parsed = parse_iso_or_rfc_date(str(item[key]))
                        if parsed:
                            return parsed
        except Exception:
            continue

    # 2. OpenGraph and meta tags
    meta_keys = [
        {'property': 'article:published_time'},
        {'name': 'article:published_time'},
        {'property': 'og:article:published_time'},
        {'property': 'og:published_time'},
        {'name': 'publication_date'},
        {'name': 'date'},
        {'name': 'dc.date'},
        {'name': 'dc.date.issued'},
        {'name': 'parsely-pub-date'},
        {'name': 'sailthru.date'}
    ]
    for key in meta_keys:
        tag = soup.find('meta', key)
        if tag and tag.get('content'):
            parsed = parse_iso_or_rfc_date(tag['content'])
            if parsed:
                return parsed

    # 3. HTML <time> elements
    for time_tag in soup.find_all('time'):
        val = time_tag.get('datetime') or time_tag.get('pubdate') or time_tag.get_text()
        if val:
            parsed = parse_iso_or_rfc_date(val)
            if parsed:
                return parsed

    # 4. Source specific regex patterns in body text
    date_regex = re.compile(
        r'\b(?:published|posted|date|updated)\s*(?:on|at|:)?\s*([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}|\d{4}-\d{2}-\d{2})\b',
        re.IGNORECASE
    )
    text_snippet = soup.get_text()[:4000]
    match = date_regex.search(text_snippet)
    if match:
        parsed = parse_iso_or_rfc_date(match.group(1))
        if parsed:
            return parsed

    return None

def evaluate_freshness(
    date_input: Optional[str] = None,
    html_content: Optional[str] = None,
    max_hours: int = FRESHNESS_WINDOW_HOURS
) -> Tuple[bool, Optional[str], int, str]:
    """
    Evaluates whether content was published within the last max_hours (UTC).
    
    Returns:
        (is_fresh, normalized_utc_iso, hours_ago, freshness_label)
    """
    pub_dt: Optional[datetime] = None

    if date_input:
        pub_dt = parse_iso_or_rfc_date(date_input)

    if not pub_dt and html_content:
        pub_dt = extract_date_from_html(html_content)

    if not pub_dt:
        return (False, None, 9999, "Unknown Date (Rejected)")

    now_utc = datetime.now(timezone.utc)
    # If date is slightly in future due to clock skew, clamp to now
    if pub_dt > now_utc:
        pub_dt = now_utc

    delta = now_utc - pub_dt
    hours_ago = int(delta.total_seconds() // 3600)
    is_fresh = delta <= timedelta(hours=max_hours)

    if hours_ago <= 1:
        label = "Just now"
    elif hours_ago < 24:
        label = f"{hours_ago}h ago"
    elif hours_ago < 48:
        label = "1d ago"
    else:
        label = f"{hours_ago // 24}d ago"

    return (is_fresh, pub_dt.isoformat(), hours_ago, label)
