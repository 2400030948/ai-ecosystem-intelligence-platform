from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class BaseIntelligenceRecord(BaseModel):
    schemaVersion: str = "1.0.0"
    recordType: str
    source: str
    collectedAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")

class StartupExtraction(BaseIntelligenceRecord):
    recordType: str = "STARTUP"
    id: Optional[str] = None
    name: str
    legalName: Optional[str] = None
    stage: str = "Growth"
    totalFunding: Optional[str] = None
    valuation: Optional[str] = None
    leadInvestors: List[str] = Field(default_factory=list)
    domain: Optional[str] = None
    headquarters: Optional[str] = None
    employeeRange: Optional[str] = None
    flagshipProduct: Optional[str] = None
    techStack: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    summary: Optional[str] = None
    verified: bool = True
    discoveredAt: Optional[str] = None
    sourceUrl: Optional[str] = None

class ProductExtraction(BaseIntelligenceRecord):
    recordType: str = "PRODUCT"
    id: Optional[str] = None
    name: str
    maker: str
    category: str
    pricingModel: str = "PAID"
    deploymentType: Optional[str] = None
    benchmarkScore: Optional[str] = None
    contextWindow: Optional[str] = None
    license: Optional[str] = None
    capabilities: List[str] = Field(default_factory=list)
    releaseDate: Optional[str] = None
    productUrl: Optional[str] = None
    verified: bool = True
    discoveredAt: Optional[str] = None
    sourceUrl: Optional[str] = None

class BenchmarkMetric(BaseModel):
    name: str
    score: str
    metric: str

class ResearchPaperExtraction(BaseIntelligenceRecord):
    recordType: str = "RESEARCH_PAPER"
    id: Optional[str] = None
    title: str
    authors: List[str] = Field(default_factory=list)
    abstract: str = ""
    categories: List[str] = Field(default_factory=list)
    githubUrl: Optional[str] = None
    githubStars: Optional[int] = None
    paperUrl: str
    publishedDate: str
    benchmarks: List[BenchmarkMetric] = Field(default_factory=list)
    discoveredAt: Optional[str] = None
    sourceUrl: Optional[str] = None

class JobExtraction(BaseIntelligenceRecord):
    recordType: str = "JOB"
    id: Optional[str] = None
    title: str
    company: str
    canonicalCompany: Optional[str] = None
    roleFamily: str
    location: str
    remote: bool = False
    experienceLevel: str = "Mid-Senior"
    compensation: Optional[str] = None
    techStack: List[str] = Field(default_factory=list)
    jobUrl: str
    postedDate: str
    freshnessLabel: str = "Within 24 hours"
    isWithin24Hours: bool = True
    discoveredAt: Optional[str] = None
    sourceUrl: Optional[str] = None

class NewsExtraction(BaseIntelligenceRecord):
    recordType: str = "NEWS"
    id: Optional[str] = None
    headline: str
    summary: str
    sourceName: str
    url: str
    publishedAt: str
    freshnessLabel: str = "Recent"
    hoursAgo: int = 0
    isFresh: bool = True
    category: str = "Model Release"
    sentiment: str = "Neutral"
    referencedEntities: List[str] = Field(default_factory=list)
    discoveredAt: Optional[str] = None
    sourceUrl: Optional[str] = None

class EntityMappingSchema(BaseModel):
    id: Optional[str] = None
    rawName: str
    canonicalName: str
    entityType: str = "Startup"
    confidence: float = 1.0
    confidenceTier: str = "High"
    source: str
    sourceRecordId: Optional[str] = None
    discoveredAt: Optional[str] = None
    status: str = "Confirmed"
    matchCriteria: List[str] = Field(default_factory=list)

class SourceSchema(BaseModel):
    id: str
    name: str
    type: str
    url: str
    status: str = "Active"
    lastCrawl: str = "Never"
    crawlFrequency: str = "15m"
    recordsFound: int = 0
    totalRecordsIngested: int = 0
    errorRate: float = 0.0

class PipelineRunSchema(BaseModel):
    id: str
    runNumber: int
    source: str
    sourceId: str
    records: int
    validRecords: int
    rejectedRecords: int
    durationSeconds: float
    startedAt: str
    completedAt: Optional[str] = None
    status: str
    llmModelUsed: str
    errorDetails: Optional[str] = None

class PipelineRunRequest(BaseModel):
    sourceId: Optional[str] = None
    sourceUrl: Optional[str] = None
    schemaType: Optional[str] = None
    limit: Optional[int] = 10

class ExtractionTestRequest(BaseModel):
    rawText: str
    targetSchema: str
    modelName: Optional[str] = "gemini-2.5-flash"
