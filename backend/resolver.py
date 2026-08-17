import re
from typing import Tuple, List
from backend.config import SEED_CANONICAL_COMPANIES

# Common entity suffixes to strip during normalization
SUFFIX_PATTERNS = [
    r'\binc\.?$',
    r'\bpbc\.?$',
    r'\bltd\.?$',
    r'\bllc\.?$',
    r'\bl\.l\.c\.?$',
    r'\bcorp\.?$',
    r'\bcorporation$',
    r'\btechnologies$',
    r'\btechnology$',
    r'\bco\.?$',
    r'\bcompany$',
    r'\bgmbh$',
    r'\bsas$',
    r'\bs\.a\.s\.?$',
    r'\blabs\.?$'
]

def clean_entity_name(raw_name: str) -> str:
    """Normalize raw entity string deterministically."""
    if not raw_name:
        return ""
    name = raw_name.strip()
    name = re.sub(r'[\r\n\t]+', ' ', name)
    name = re.sub(r'\s+', ' ', name)
    return name

def resolve_canonical_entity(raw_name: str, entity_type: str = "Startup") -> Tuple[str, float, str, List[str]]:
    """
    Deterministically resolves a raw entity name to its canonical name.
    
    Returns:
        (canonical_name, confidence_score, confidence_tier, match_criteria)
    """
    cleaned = clean_entity_name(raw_name)
    if not cleaned:
        return ("Unknown Entity", 0.0, "Review", ["Empty Name"])

    criteria = []
    lower_name = cleaned.lower()

    # 1. Direct match in canonical dictionary
    if lower_name in SEED_CANONICAL_COMPANIES:
        criteria.append("Exact Canonical Seed Lookup")
        return (SEED_CANONICAL_COMPANIES[lower_name], 1.0, "High", criteria)

    # 2. Suffix stripping normalization in loop
    normalized = lower_name
    normalized = re.sub(r'[,]+', ' ', normalized)
    normalized = re.sub(r'\s+', ' ', normalized).strip()
    normalized = re.sub(r'[.]+', '', normalized).strip()

    # Iterative suffix removal
    stripped_any = True
    while stripped_any:
        stripped_any = False
        for pattern in SUFFIX_PATTERNS:
            match = re.search(pattern, normalized, re.IGNORECASE)
            if match:
                normalized = re.sub(pattern, '', normalized, flags=re.IGNORECASE).strip()
                normalized = re.sub(r'[,.]+$', '', normalized).strip()
                criteria.append(f"Stripped Suffix: {match.group(0)}")
                stripped_any = True
                break

    # Check canonical dictionary again after suffix strip
    if normalized in SEED_CANONICAL_COMPANIES:
        criteria.append("Canonical Seed Lookup Post-Suffix Normalization")
        return (SEED_CANONICAL_COMPANIES[normalized], 0.98, "High", criteria)

    # Check space-collapsed version (e.g. "open ai" -> "openai")
    collapsed = re.sub(r'[^a-z0-9]', '', normalized)
    for k, v in SEED_CANONICAL_COMPANIES.items():
        if re.sub(r'[^a-z0-9]', '', k) == collapsed:
            criteria.append("Character Collapse Canonical Lookup")
            return (v, 0.98, "High", criteria)

    # Special handling for common AI prefixes / suffixes
    trimmed_ai = re.sub(r'\s+ai$', '', normalized, flags=re.IGNORECASE).strip()
    if trimmed_ai in SEED_CANONICAL_COMPANIES:
        criteria.append("AI Token Disambiguation")
        return (SEED_CANONICAL_COMPANIES[trimmed_ai], 0.95, "High", criteria)

    # 3. Capitalization Fallback based on stripped tokens
    # Find original token casing if available
    orig_words = cleaned.split()
    norm_words = normalized.split()
    
    result_words = []
    for i, nw in enumerate(norm_words):
        # Look for corresponding original word
        if i < len(orig_words) and orig_words[i].lower().rstrip(",.") == nw:
            result_words.append(orig_words[i].rstrip(",."))
        else:
            result_words.append(nw.capitalize())

    canonical_fallback = " ".join(result_words) if result_words else cleaned
    criteria.append("Deterministic Capitalization Fallback")

    confidence = 0.85 if len(criteria) > 1 else 0.75
    tier = "Medium" if confidence >= 0.8 else "Review"

    return (canonical_fallback, confidence, tier, criteria)
