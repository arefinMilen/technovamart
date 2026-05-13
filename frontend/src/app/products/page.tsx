'use client'
import { useQuery } from '@tanstack/react-query'
import { catalogApi } from '@/lib/api'
import ProductCard from '@/components/product/ProductCard'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)

  // ✅ Read params from URL (always)
  const urlFilters = useMemo(
    () => ({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      brand: searchParams.get('brand') || '',
      min_price: searchParams.get('min_price') || '',
      max_price: searchParams.get('max_price') || '',
      ordering: searchParams.get('ordering') || '-created_at',
    }),
    [searchParams]
  )

  // ✅ Local state (UI)
  const [filters, setFilters] = useState(urlFilters)

  // ✅ IMPORTANT: URL change হলে filters update হবে
  useEffect(() => {
    setFilters(urlFilters)
  }, [urlFilters])

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories().then((r) => r.data),
  })

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => catalogApi.getBrands().then((r) => r.data),
  })

  // ✅ Only send non-empty filters
  const apiParams = useMemo(() => {
    return Object.fromEntries(
      Object.entries(filters).filter(([, v]) => String(v).trim() !== '')
    )
  }, [filters])

  const { data, isLoading } = useQuery({
    queryKey: ['products', apiParams],
    queryFn: () => catalogApi.getProducts(apiParams).then((r) => r.data),
  })

  const products = data?.results || data || []
  const total = data?.count || products.length

  // ✅ Update filter + also update URL (so navbar/refresh works)
  const updateFilter = (key: string, value: string) => {
    const next = { ...filters, [key]: value }
    setFilters(next)

    const qs = new URLSearchParams()
    Object.entries(next).forEach(([k, v]) => {
      if (String(v).trim() !== '') qs.set(k, String(v))
    })

    router.push(`/products?${qs.toString()}`)
  }

  const clearFilters = () => {
    const next = {
      search: '',
      category: '',
      brand: '',
      min_price: '',
      max_price: '',
      ordering: '-created_at',
    }
    setFilters(next)
    router.push('/products')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[10px] sm:text-2xl  font-bold">
            {filters.search ? `Results for "${filters.search}"` : 'All Products'}
          </h1>
          <p className="text-[10px] sm:text-sm text-gray-500 mt-1">{total} products found</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filters.ordering}
            onChange={(e) => updateFilter('ordering', e.target.value)}
            className="input w-auto text-[10px] sm:text-sm"
          >
            <option value="-created_at">Latest</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center text-[10px] sm:text-sm gap-1 sm:gap-2 py-1 sm:py-2"
            type="button"
          >
            <SlidersHorizontal size={12} /> Filters
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {showFilters && (
          <aside className="w-64 shrink-0">
            <div className="card p-4 sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-600 flex items-center gap-1"
                  type="button"
                >
                  <X size={12} /> Clear
                </button>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Category</h4>
                <div className="space-y-1.5">
                  {(categories?.results || categories || []).map((cat: any) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 cursor-pointer text-sm"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.slug}
                        checked={filters.category === cat.slug}
                        onChange={(e) => updateFilter('category', e.target.value)}
                        className="text-red-600"
                      />
                      {cat.name} ({cat.product_count})
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Brand</h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {(brands?.results || brands || []).map((b: any) => (
                    <label
                      key={b.id}
                      className="flex items-center gap-2 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        value={b.slug}
                        checked={filters.brand === b.slug}
                        onChange={(e) =>
                          updateFilter('brand', e.target.checked ? e.target.value : '')
                        }
                      />
                      {b.name}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Price Range</h4>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.min_price}
                    onChange={(e) => updateFilter('min_price', e.target.value)}
                    className="input text-sm py-1.5"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.max_price}
                    onChange={(e) => updateFilter('max_price', e.target.value)}
                    className="input text-sm py-1.5"
                  />
                </div>
              </div>
            </div>
          </aside>
        )}

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array(12)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-xl aspect-square mb-2" />
                    <div className="bg-gray-200 h-4 rounded mb-1" />
                    <div className="bg-gray-200 h-4 w-2/3 rounded" />
                  </div>
                ))}
            </div>
          ) : products.length > 0 ? (
            <div
              className={`grid gap-4 ${
                showFilters
                  ? 'grid-cols-2 sm:grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              }`}
            >
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-sm">Try changing your search or filters</p>
              <button onClick={clearFilters} className="mt-4 btn-primary" type="button">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}