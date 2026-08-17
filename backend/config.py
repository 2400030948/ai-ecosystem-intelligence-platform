import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Database configuration
DATABASE_PATH = os.getenv("DATABASE_PATH", str(BASE_DIR / "ai_intelligence.db"))

# LLM API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")

# Server configuration
BACKEND_HOST = os.getenv("BACKEND_HOST", "0.0.0.0")
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8000"))

# Crawler settings
CRAWLER_CONCURRENCY = int(os.getenv("CRAWLER_CONCURRENCY", "8"))
CRAWLER_TIMEOUT_SEC = int(os.getenv("CRAWLER_TIMEOUT_SEC", "15"))
CRAWLER_MAX_RETRIES = int(os.getenv("CRAWLER_MAX_RETRIES", "3"))
CRAWLER_USER_AGENT = os.getenv(
    "CRAWLER_USER_AGENT",
    "AI-Intelligence-Bot/1.0 (+https://ai-intelligence-platform.io/bot; research bot)"
)

# Freshness window
FRESHNESS_WINDOW_HOURS = int(os.getenv("FRESHNESS_WINDOW_HOURS", "24"))

# Seed Canonical Companies for Entity Resolution
SEED_CANONICAL_COMPANIES = {
    "openai": "OpenAI",
    "anthropic": "Anthropic",
    "google deepmind": "Google DeepMind",
    "deepmind": "Google DeepMind",
    "meta ai": "Meta AI",
    "mistral ai": "Mistral AI",
    "mistral": "Mistral AI",
    "cohere": "Cohere",
    "perplexity": "Perplexity AI",
    "perplexity ai": "Perplexity AI",
    "scale ai": "Scale AI",
    "cognition ai": "Cognition AI",
    "cognition labs": "Cognition AI",
    "cognition": "Cognition AI",
    "physical intelligence": "Physical Intelligence",
    "xai": "xAI",
    "x.ai": "xAI",
    "midjourney": "Midjourney",
    "elevenlabs": "ElevenLabs",
    "hugging face": "Hugging Face",
    "huggingface": "Hugging Face",
    "together ai": "Together AI",
    "groq": "Groq",
    "anyscale": "Anyscale",
    "modal labs": "Modal Labs",
    "modal compute": "Modal Labs",
    "fireworks ai": "Fireworks AI",
    "cursor": "Anysphere (Cursor)",
    "anysphere": "Anysphere (Cursor)",
    "adept ai": "Adept AI",
    "suno": "Suno",
    "runway": "Runway",
    "character ai": "Character.ai",
    "poolside": "Poolside AI"
}
