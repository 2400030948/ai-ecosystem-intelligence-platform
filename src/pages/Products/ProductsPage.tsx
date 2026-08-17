import React, { useState, useEffect } from 'react';
import {
  Package,
  ExternalLink,
  Filter,
  Layers,
  Building2,
  Tag,
  CheckCircle2,
  DollarSign,
  Boxes,
  Cpu
} from 'lucide-react';
import { DataTable, Column } from '../../components/ui/DataTable';
import { SearchInput } from '../../components/ui/SearchInput';
import { Badge, BadgeVariant } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import { Product, PricingModel } from '../../types';
import { apiService } from '../../services/api';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pricingFilter, setPricingFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiService.getProducts({
        query: searchQuery,
        pricingModel: pricingFilter,
        category: categoryFilter,
        page,
        pageSize
      });
      setProducts(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, pricingFilter, categoryFilter, page]);

  const getPricingBadgeVariant = (model: PricingModel): BadgeVariant => {
    switch (model) {
      case 'FREE':
        return 'success';
      case 'FREEMIUM':
        return 'info';
      case 'PAID':
        return 'purple';
      case 'ENTERPRISE':
        return 'cyan';
      default:
        return 'neutral';
    }
  };

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/50 border border-emerald-800/40 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0 font-mono">
            <Package className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-slate-100 text-xs hover:text-blue-400 transition-colors block truncate">
              {item.name}
            </span>
            <span className="text-[11px] text-slate-400 font-mono truncate block">{item.category}</span>
          </div>
        </div>
      )
    },
    {
      key: 'startupName',
      header: 'Startup / Maker',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-200">
          <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="font-medium">{item.startupName}</span>
        </div>
      )
    },
    {
      key: 'pricingModel',
      header: 'Pricing Model',
      render: (item) => (
        <Badge variant={getPricingBadgeVariant(item.pricingModel)} size="sm">
          {item.pricingModel}
        </Badge>
      )
    },
    {
      key: 'source',
      header: 'Source',
      render: (item) => (
        <span className="text-slate-300 text-xs truncate max-w-[160px] inline-block font-sans">
          {item.source}
        </span>
      )
    },
    {
      key: 'collectedAt',
      header: 'Collected',
      align: 'right',
      render: (item) => (
        <span className="text-slate-400 text-[11px] font-mono whitespace-nowrap">
          {new Date(item.collectedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">AI Products & Models</h1>
          <p className="text-xs text-slate-400 mt-1">
            Standardized catalog of frontier models, APIs, enterprise platforms, developer toolkits, and pricing structures.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" size="md">
            {total} Active Products
          </Badge>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={(q) => {
              setSearchQuery(q);
              setPage(1);
            }}
            placeholder="Search products, startups, or features..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Pricing:</span>
            <select
              value={pricingFilter}
              onChange={(e) => {
                setPricingFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Pricing Models</option>
              <option value="FREE">FREE</option>
              <option value="FREEMIUM">FREEMIUM</option>
              <option value="PAID">PAID</option>
              <option value="ENTERPRISE">ENTERPRISE</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Foundational LLM">Foundational LLM</option>
              <option value="Code Intelligence">Code Intelligence</option>
              <option value="Enterprise RAG & Agents">Enterprise RAG & Agents</option>
              <option value="Vector Embeddings">Vector Embeddings</option>
              <option value="Cloud Infrastructure">Cloud Infrastructure</option>
              <option value="AI Search & Synthesis">AI Search & Synthesis</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={products}
        keyExtractor={(item) => item.id}
        onRowClick={(item) => setActiveProduct(item)}
        loading={loading}
        pagination={{
          currentPage: page,
          pageSize,
          totalItems: total,
          onPageChange: (p) => setPage(p)
        }}
      />

      {/* Product Detail Drawer */}
      <Drawer
        isOpen={!!activeProduct}
        onClose={() => setActiveProduct(null)}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/70 border border-emerald-700/50 flex items-center justify-center text-emerald-400 font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-100 font-bold text-base">{activeProduct?.name}</span>
              <p className="text-xs text-slate-400 font-mono">
                by {activeProduct?.startupName}
              </p>
            </div>
          </div>
        }
        subtitle={
          activeProduct && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={getPricingBadgeVariant(activeProduct.pricingModel)} size="sm">
                {activeProduct.pricingModel}
              </Badge>
              <Badge variant="outline" size="sm">
                {activeProduct.deploymentType}
              </Badge>
            </div>
          )
        }
        footer={
          activeProduct && (
            <a
              href={activeProduct.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                iconRight={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Open Official Documentation
              </Button>
            </a>
          )
        }
      >
        {activeProduct && (
          <div className="space-y-5 text-xs text-slate-300">
            {/* Overview */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Product Specification
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">{activeProduct.description}</p>
            </div>

            {/* Target & Deploy */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-mono">Deployment Type</span>
                <p className="text-slate-200 font-medium mt-1">{activeProduct.deploymentType}</p>
              </div>
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase font-mono">Audience Profile</span>
                <p className="text-slate-200 font-medium mt-1 truncate">{activeProduct.targetAudience}</p>
              </div>
            </div>

            {/* Core Features */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Capabilities & Feature Invariants
              </span>
              <div className="space-y-1.5">
                {activeProduct.features.map((feat) => (
                  <div
                    key={feat}
                    className="p-2.5 bg-slate-950/50 rounded-lg border border-slate-800 flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-slate-200 text-xs">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Source & Provenance */}
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
              <div>Source Parser: {activeProduct.source}</div>
              <div>Collected: {new Date(activeProduct.collectedAt).toUTCString()}</div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
