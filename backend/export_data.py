import os
import csv
import json
import sqlite3
import datetime
from urllib.parse import urlparse
from backend.config import DATABASE_PATH

EXPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "exports")
os.makedirs(EXPORTS_DIR, exist_ok=True)

def validate_url(url_str):
    if not url_str or not isinstance(url_str, str):
        return False
    parsed = urlparse(url_str)
    return bool(parsed.scheme in ("http", "https") and parsed.netloc)

def validate_iso_timestamp(ts_str):
    if not ts_str:
        return False
    try:
        datetime.datetime.fromisoformat(str(ts_str).replace("Z", "+00:00"))
        return True
    except Exception:
        return False

def run_export_and_quality_check():
    print(f"Connecting to database: {DATABASE_PATH}")
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # 1. Run Data Quality Checks
    quality_report = {
        "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "database_path": DATABASE_PATH,
        "metrics": {},
        "issues_found": {}
    }

    tables = {
        "startups": {
            "query": "SELECT * FROM startups ORDER BY discovered_at DESC",
            "csv_file": "startups.csv",
            "url_fields": ["domain", "source_url"],
            "required_fields": ["id", "name", "source_url", "discovered_at"],
            "timestamp_fields": ["discovered_at", "collected_at"]
        },
        "products": {
            "query": "SELECT * FROM products ORDER BY discovered_at DESC",
            "csv_file": "products.csv",
            "url_fields": ["product_url", "source_url"],
            "required_fields": ["id", "name", "maker", "product_url", "source_url"],
            "timestamp_fields": ["discovered_at", "collected_at"]
        },
        "research_papers": {
            "query": "SELECT * FROM research_papers ORDER BY published_date DESC",
            "csv_file": "research_papers.csv",
            "url_fields": ["paper_url", "source_url"],
            "required_fields": ["id", "title", "paper_url", "published_date", "source_url"],
            "timestamp_fields": ["published_date", "discovered_at", "collected_at"]
        },
        "jobs": {
            "query": "SELECT * FROM jobs ORDER BY posted_date DESC",
            "csv_file": "jobs.csv",
            "url_fields": ["job_url", "source_url"],
            "required_fields": ["id", "title", "company", "job_url", "posted_date", "source_url"],
            "timestamp_fields": ["posted_date", "discovered_at", "collected_at"],
            "is_freshness_critical": True
        },
        "news": {
            "query": "SELECT * FROM news ORDER BY published_at DESC",
            "csv_file": "news.csv",
            "url_fields": ["url", "source_url"],
            "required_fields": ["id", "headline", "url", "published_at", "source_url"],
            "timestamp_fields": ["published_at", "discovered_at", "collected_at"],
            "is_freshness_critical": True
        },
        "entity_mappings": {
            "query": "SELECT * FROM entity_mappings ORDER BY discovered_at DESC",
            "csv_file": "entity_mapping_log.csv",
            "url_fields": [],
            "required_fields": ["id", "raw_name", "canonical_name", "confidence", "confidence_tier"],
            "timestamp_fields": ["discovered_at"]
        }
    }

    now_utc = datetime.datetime.now(datetime.timezone.utc)
    exported_counts = {}

    for t_name, cfg in tables.items():
        cur.execute(cfg["query"])
        rows = cur.fetchall()
        row_count = len(rows)
        exported_counts[t_name] = row_count

        issues = {
            "missing_source_urls": 0,
            "invalid_urls": 0,
            "missing_required_fields": 0,
            "invalid_timestamps": 0,
            "older_than_24h": 0,
            "invalid_github_stars": 0
        }

        # Validate rows
        for r in rows:
            # Required fields
            for rf in cfg["required_fields"]:
                if not r[rf]:
                    issues["missing_required_fields"] += 1

            # Source URLs
            if "source_url" in r.keys():
                if not r["source_url"]:
                    issues["missing_source_urls"] += 1
                elif not validate_url(r["source_url"]):
                    issues["invalid_urls"] += 1

            # URL fields
            for uf in cfg["url_fields"]:
                if r[uf] and not validate_url(r[uf]):
                    issues["invalid_urls"] += 1

            # Timestamp fields
            for tf in cfg["timestamp_fields"]:
                if r[tf] and not validate_iso_timestamp(r[tf]):
                    issues["invalid_timestamps"] += 1

            # 24h freshness check for jobs & news
            if cfg.get("is_freshness_critical"):
                date_val = r["posted_date"] if "posted_date" in r.keys() else r["published_at"]
                if date_val:
                    try:
                        dt = datetime.datetime.fromisoformat(str(date_val).replace("Z", "+00:00"))
                        if dt.tzinfo is None:
                            dt = dt.replace(tzinfo=datetime.timezone.utc)
                        delta_hours = (now_utc - dt).total_seconds() / 3600.0
                        if delta_hours > 24.0 or delta_hours < -1.0:
                            issues["older_than_24h"] += 1
                    except Exception:
                        issues["invalid_timestamps"] += 1

            # GitHub stars check for research papers
            if t_name == "research_papers":
                stars = r["github_stars"]
                if stars is not None and not isinstance(stars, (int, float)):
                    issues["invalid_github_stars"] += 1

        quality_report["metrics"][t_name] = {
            "total_records": row_count,
            "health_status": "PASSED" if sum(issues.values()) == 0 else "WARNINGS_FOUND"
        }
        quality_report["issues_found"][t_name] = issues

        # Write to CSV
        csv_path = os.path.join(EXPORTS_DIR, cfg["csv_file"])
        if rows:
            columns = rows[0].keys()
            with open(csv_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(columns)
                for r in rows:
                    writer.writerow([r[col] for col in columns])
        else:
            with open(csv_path, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(cfg["required_fields"])

        print(f"Exported {row_count} rows -> {csv_path}")

    # Write Data Quality Report JSON
    quality_report_path = os.path.join(EXPORTS_DIR, "data_quality_report.json")
    with open(quality_report_path, "w", encoding="utf-8") as f:
        json.dump(quality_report, f, indent=2)

    print(f"Data quality report saved -> {quality_report_path}")
    conn.close()

    print("\n=======================================================")
    print("=== FINAL DATA EXPORT SUMMARY ===")
    print("=======================================================")
    for k, v in exported_counts.items():
        print(f"{k.upper()}: {v}")
    print("=======================================================\n")

if __name__ == "__main__":
    run_export_and_quality_check()
