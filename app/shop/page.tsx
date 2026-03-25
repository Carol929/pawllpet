'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ProductGrid } from '@/components/ProductGrid'
import { ProductGridSkeleton } from '@/components/ProductGridSkeleton'
import { useProducts } from '@/lib/use-products'
import { useLocale } from '@/lib/i18n'
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Category { id: string; name: string; slug: string }

const petTypes = ['Dog', 'Cat', 'Both']
const sortOptions = [
  { value: 'newest', en: 'Newest', zh: '最新' },
  { value: 'price_asc', en: 'Price: Low to High', zh: '价格从低到高' },
  { value: 'price_desc', en: 'Price: High to Low', zh: '价格从高到低' },
  { value: 'name', en: 'Name A-Z', zh: '名称 A-Z' },
  { value: 'rating', en: 'Top Rated', zh: '最高评价' },
]

const PAGE_SIZE = 12

function ShopContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { locale } = useLocale()

  const [categories, setCategories] = useState<Category[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Read filters from URL
  const q = searchParams.get('q') || ''
  const pet = searchParams.get('pet') || ''
  const cat = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'
  const minP = searchParams.get('minPrice') || ''
  const maxP = searchParams.get('maxPrice') || ''
  const page = parseInt(searchParams.get('page') || '1')

  // Build API params
  const params: Record<string, string> = { pageSize: String(PAGE_SIZE), page: String(page) }
  if (q) params.search = q
  if (pet) params.petType = pet
  if (cat) params.category = cat
  if (sort) params.sort = sort
  if (minP) params.minPrice = minP
  if (maxP) params.maxPrice = maxP

  const { products, total, loading } = useProducts(params)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {})
  }, [])

  const updateUrl = useCallback((updates: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v) p.set(k, v); else p.delete(k)
    })
    if (updates.page === undefined && !('page' in updates)) p.set('page', '1')
    router.push(`/shop?${p.toString()}`, { scroll: false })
  }, [searchParams, router])

  const activeFilterCount = [pet, cat, minP, maxP].filter(Boolean).length

  return (
    <main className="container page-stack">
      <div className="shop-header">
        <h1>{q ? `${locale === 'zh' ? '搜索' : 'Search'}: "${q}"` : locale === 'zh' ? '全部商品' : 'Shop All'}</h1>
        <div className="shop-controls">
          <button className="shop-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal size={16} />
            {locale === 'zh' ? '筛选' : 'Filters'}
            {activeFilterCount > 0 && <span className="shop-filter-badge">{activeFilterCount}</span>}
          </button>
          <select className="shop-sort" value={sort} onChange={e => updateUrl({ sort: e.target.value, page: '1' })}>
            {sortOptions.map(o => <option key={o.value} value={o.value}>{locale === 'zh' ? o.zh : o.en}</option>)}
          </select>
        </div>
      </div>

      <div className={`shop-layout ${showFilters ? 'shop-layout--filters-open' : ''}`}>
        {/* Filter Sidebar */}
        <aside className={`shop-filters ${showFilters ? 'shop-filters--open' : ''}`}>
          <div className="shop-filters-header">
            <h3>{locale === 'zh' ? '筛选' : 'Filters'}</h3>
            <button className="shop-filters-close" onClick={() => setShowFilters(false)}><X size={18} /></button>
          </div>

          {/* Pet Type */}
          <div className="filter-group">
            <h4>{locale === 'zh' ? '宠物类型' : 'Pet Type'}</h4>
            {petTypes.map(p => (
              <label key={p} className="filter-checkbox">
                <input type="radio" name="pet" checked={pet === p} onChange={() => updateUrl({ pet: pet === p ? '' : p, page: '1' })} />
                <span>{p === 'Both' ? (locale === 'zh' ? '全部' : 'All Pets') : p === 'Dog' ? (locale === 'zh' ? '狗' : 'Dogs') : (locale === 'zh' ? '猫' : 'Cats')}</span>
              </label>
            ))}
            {pet && <button className="filter-clear" onClick={() => updateUrl({ pet: '', page: '1' })}>{locale === 'zh' ? '清除' : 'Clear'}</button>}
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div className="filter-group">
              <h4>{locale === 'zh' ? '分类' : 'Category'}</h4>
              {categories.map(c => (
                <label key={c.id} className="filter-checkbox">
                  <input type="radio" name="cat" checked={cat === c.slug} onChange={() => updateUrl({ category: cat === c.slug ? '' : c.slug, page: '1' })} />
                  <span>{c.name}</span>
                </label>
              ))}
              {cat && <button className="filter-clear" onClick={() => updateUrl({ category: '', page: '1' })}>{locale === 'zh' ? '清除' : 'Clear'}</button>}
            </div>
          )}

          {/* Price Range */}
          <div className="filter-group">
            <h4>{locale === 'zh' ? '价格范围' : 'Price Range'}</h4>
            <div className="filter-price-inputs">
              <input type="number" placeholder="Min" value={minP} onChange={e => updateUrl({ minPrice: e.target.value, page: '1' })} min="0" step="1" />
              <span>—</span>
              <input type="number" placeholder="Max" value={maxP} onChange={e => updateUrl({ maxPrice: e.target.value, page: '1' })} min="0" step="1" />
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button className="filter-clear-all" onClick={() => updateUrl({ pet: '', category: '', minPrice: '', maxPrice: '', page: '1' })}>
              {locale === 'zh' ? '清除所有筛选' : 'Clear All Filters'}
            </button>
          )}
        </aside>

        {/* Products */}
        <div className="shop-products">
          <div className="shop-results-count">
            {total} {locale === 'zh' ? '个商品' : total === 1 ? 'product' : 'products'}
          </div>

          {loading ? (
            <ProductGridSkeleton count={PAGE_SIZE} />
          ) : products.length > 0 ? (
            <ProductGrid items={products} />
          ) : (
            <div className="shop-empty">
              <p>{locale === 'zh' ? '没有找到匹配的商品' : 'No products found matching your filters.'}</p>
              <button className="btn-secondary" onClick={() => router.push('/shop')}>
                {locale === 'zh' ? '清除筛选' : 'Clear Filters'}
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="shop-pagination">
              <button disabled={page <= 1} onClick={() => updateUrl({ page: String(page - 1) })}>
                <ChevronLeft size={16} /> {locale === 'zh' ? '上一页' : 'Prev'}
              </button>
              <div className="shop-pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="shop-pagination-dots">...</span>}
                      <button className={`shop-page-btn ${p === page ? 'shop-page-btn--active' : ''}`} onClick={() => updateUrl({ page: String(p) })}>
                        {p}
                      </button>
                    </span>
                  ))}
              </div>
              <button disabled={page >= totalPages} onClick={() => updateUrl({ page: String(page + 1) })}>
                {locale === 'zh' ? '下一页' : 'Next'} <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<main className="container page-stack"><h1>Shop All</h1><ProductGridSkeleton count={PAGE_SIZE} /></main>}>
      <ShopContent />
    </Suspense>
  )
}
