import re
import logging
import xml.etree.ElementTree as ET
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse, urlunparse

logger = logging.getLogger("ai_intelligence.sources")

def normalize_source_url(raw_url: str) -> str:
    """Normalize URLs by stripping tracking queries, anchors, trailing slashes, and downcasing hostname."""
    if not raw_url:
        return ""
    
    try:
        parsed = urlparse(raw_url.strip())
        # Clean query parameters commonly used for tracking
        filtered_queries = []
        if parsed.query:
            tracking_keys = {"utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "fbclid"}
            pairs = parsed.query.split("&")
            filtered_queries = [p for p in pairs if p.split("=")[0].lower() not in tracking_keys]

        clean_query = "&".join(filtered_queries)
        clean_path = parsed.path.rstrip("/")
        if not clean_path:
            clean_path = "/"

        netloc = parsed.netloc.lower()
        if netloc.startswith("www."):
            netloc = netloc[4:]

        normalized = urlunparse((
            parsed.scheme.lower(),
            netloc,
            clean_path,
            parsed.params,
            clean_query,
            "" # strip anchor fragment
        ))
        return normalized
    except Exception:
        return raw_url.strip()

def parse_arxiv_xml(xml_content: str) -> List[Dict[str, Any]]:
    """Parses arXiv Atom XML query responses into structured raw records."""
    records = []
    try:
        root = ET.fromstring(xml_content)
        # Atom XML namespace
        ns = {"atom": "http://www.w3.org/2005/Atom"}

        for entry in root.findall("atom:entry", ns):
            id_elem = entry.find("atom:id", ns)
            title_elem = entry.find("atom:title", ns)
            summary_elem = entry.find("atom:summary", ns)
            published_elem = entry.find("atom:published", ns)

            paper_url = id_elem.text.strip() if id_elem is not None and id_elem.text else ""
            title = re.sub(r'\s+', ' ', title_elem.text.strip()) if title_elem is not None and title_elem.text else ""
            abstract = re.sub(r'\s+', ' ', summary_elem.text.strip()) if summary_elem is not None and summary_elem.text else ""
            published = published_elem.text.strip() if published_elem is not None and published_elem.text else ""

            authors = []
            for author in entry.findall("atom:author", ns):
                name_elem = author.find("atom:name", ns)
                if name_elem is not None and name_elem.text:
                    authors.append(name_elem.text.strip())

            categories = []
            for cat in entry.findall("atom:category", ns):
                term = cat.get("term")
                if term:
                    categories.append(term)

            # Check if abstract mentions github
            github_match = re.search(r'https?://github\.com/[a-zA-Z0-9_\-\.]+(?:/[a-zA-Z0-9_\-\.]+)?', abstract)
            github_url = github_match.group(0) if github_match else None

            if title and paper_url:
                records.append({
                    "title": title,
                    "authors": authors,
                    "abstract": abstract,
                    "published_date": published,
                    "paper_url": paper_url,
                    "categories": categories,
                    "github_url": github_url,
                    "raw_text": f"Title: {title}\nAuthors: {', '.join(authors)}\nAbstract: {abstract}\nURL: {paper_url}",
                    "source_url": paper_url
                })
    except Exception as e:
        logger.error(f"Error parsing arXiv XML: {str(e)}")

    return records

def parse_rss_feed(rss_content: str, source_name: str) -> List[Dict[str, Any]]:
    """Parses standard RSS / Atom feeds into item records."""
    records = []
    try:
        root = ET.fromstring(rss_content)
        # Search for all items in RSS 2.0 or Atom
        for item in root.iter():
            tag_name = item.tag.split("}")[-1].lower() if "}" in item.tag else item.tag.lower()
            if tag_name in ["item", "entry"]:
                title = ""
                link = ""
                desc = ""
                pub_date = ""

                for child in item:
                    c_tag = child.tag.split("}")[-1].lower() if "}" in child.tag else child.tag.lower()
                    if c_tag == "title" and child.text:
                        title = child.text.strip()
                    elif c_tag == "link":
                        link = child.get("href") or (child.text.strip() if child.text else "")
                    elif c_tag in ["description", "summary", "content"] and child.text:
                        desc = child.text.strip()
                    elif c_tag in ["pubdate", "published", "updated", "date"] and child.text:
                        pub_date = child.text.strip()

                if link and title:
                    clean_url = normalize_source_url(link)
                    records.append({
                        "title": title,
                        "url": clean_url,
                        "description": desc,
                        "published_date": pub_date,
                        "raw_text": f"Title: {title}\nSummary: {desc}\nURL: {clean_url}",
                        "source_url": clean_url,
                        "source_name": source_name
                    })
    except Exception as e:
        logger.error(f"Error parsing RSS XML: {str(e)}")

    return records
