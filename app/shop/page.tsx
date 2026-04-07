'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ProductGrid } from '@/components/ProductGrid'
import { ProductGridSkeleton } from '@/components/ProductGridSkeleton'
import { useProducts } from '@/lib/use-products'
import { useLocale } from '@/lib/i18n'
import { Product } from '@/lib/product-types'
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Category { id: string; name: string; slug: string }

const sortOptions = [
  { value: 'newest', en: 'Newest', zh: '最新' },
  { value: 'price_asc', en: 'Price: Low to High', zh: '价格从低到高' },
  { value: 'price_desc', en: 'Price: High to Low', zh: '价格从高到低' },
  { value: 'name', en: 'Name A-Z', zh: '名称 A-Z' },
  { value: 'rating', en: 'Top Rated', zh: '最高评价' },
]

const CATEGORY_SECTIONS = [
  { slug: 'toys', en: 'Toys', zh: '玩具' },
  { slug: 'accessories', en: 'Accessories', zh: '配饰' },
  { slug: 'beds', en: 'Beds', zh: '宠物床' },
  { slug: 'bowls', en: 'Bowls', zh: '食盆' },
]

const PAGE_SIZE = 12

function ShopContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { locale } = useLocale()
  const en = locale !== 'zh'

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

  // Sectioned mode: pet is set but no specific category
  const sectionedMode = !!pet && !cat && !q

  // For sectioned mode, fetch all products for this pet type
  const [sectionData, setSectionData] = useState<Record<string, Product[]>>({})
  const [sectionLoading, setSectionLoading] = useState(false)

  // Build API params for normal (non-sectioned) mode
  const params: Record<string, string> = { pageSize: String(PAGE_SIZE), page: String(page) }
  if (q) params.search = q
  if (pet) params.petType = pet
  if (cat) params.category = cat
  if (sort) params.sort = sort
  if (minP) params.minPrice = minP
  if (maxP) params.maxPrice = maxP

  const { products, total, loading } = useProducts(sectionedMode ? {} : params)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {})
  }, [])

  // Fetch sectioned data + all products for this pet type
  const [allPetProducts, setAllPetProducts] = useState<Product[]>([])

  useEffect(() => {
    if (!sectionedMode) return
    setSectionLoading(true)
    const catFetches = CATEGORY_SECTIONS.map(sec =>
      fetch(`/api/products?petType=${pet}&category=${sec.slug}&pageSize=50&sort=${sort}`)
        .then(r => r.json())
        .then(data => ({ slug: sec.slug, products: data.products || [] }))
        .catch(() => ({ slug: sec.slug, products: [] }))
    )
    const allFetch = fetch(`/api/products?petType=${pet}&pageSize=200&sort=${sort}`)
      .then(r => r.json())
      .then(data => data.products || [])
      .catch(() => [])

    Promise.all([Promise.all(catFetches), allFetch]).then(([results, allProducts]) => {
      const map: Record<string, Product[]> = {}
      results.forEach(r => { map[r.slug] = r.products })
      setSectionData(map)
      setAllPetProducts(allProducts)
      setSectionLoading(false)
    })
  }, [pet, sort, sectionedMode])

  // Handle anchor scroll after section data loads
  useEffect(() => {
    if (!sectionedMode || sectionLoading) return
    const hash = window.location.hash.slice(1)
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash)
        if (!el) return
        const header = document.querySelector('.site-header') as HTMLElement
        const headerH = header ? header.offsetHeight : 0
        const sectionNav = document.querySelector('.shop-section-nav') as HTMLElement
        const navH = sectionNav ? sectionNav.offsetHeight : 0
        const y = el.getBoundingClientRect().top + window.scrollY - headerH - navH - 16
        window.scrollTo({ top: y, behavior: 'smooth' })
      }, 200)
    }
  }, [sectionedMode, sectionLoading])

  const updateUrl = useCallback((updates: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v) p.set(k, v); else p.delete(k)
    })
    if (updates.page === undefined && !('page' in updates)) p.set('page', '1')
    router.push(`/shop?${p.toString()}`, { scroll: false })
  }, [searchParams, router])

  const activeFilterCount = [cat, minP, maxP].filter(Boolean).length

  const petLabel = pet === 'dog' || pet === 'Dog' ? (en ? 'Dogs' : '狗狗') : pet === 'cat' || pet === 'Cat' ? (en ? 'Cats' : '猫猫') : ''

  return (
    <main className="container page-stack">
      <div className="shop-header">
        <h1>
          {q ? `${en ? 'Search' : '搜索'}: "${q}"`
            : sectionedMode ? `${en ? 'Shop for' : '购物'} ${petLabel}`
            : en ? 'Shop All' : '全部商品'}
        </h1>
        <div className="shop-controls">
          {!sectionedMode && (
            <button className="shop-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={16} />
              {en ? 'Filters' : '筛选'}
              {activeFilterCount > 0 && <span className="shop-filter-badge">{activeFilterCount}</span>}
            </button>
          )}
          <select className="shop-sort" value={sort} onChange={e => updateUrl({ sort: e.target.value, page: '1' })}>
            {sortOptions.map(o => <option key={o.value} value={o.value}>{en ? o.en : o.zh}</option>)}
          </select>
        </div>
      </div>

      {/* Sectioned mode: categories as sections */}
      {sectionedMode ? (
        <div className="shop-sections">
          {/* Quick nav */}
          <nav className="shop-section-nav">
            {CATEGORY_SECTIONS.map(sec => (
              <a key={sec.slug} href={`#${sec.slug}`} className="shop-section-nav-link"
                onClick={e => {
                  e.preventDefault()
                  const el = document.getElementById(sec.slug)
                  if (!el) return
                  const header = document.querySelector('.site-header') as HTMLElement
                  const headerH = header ? header.offsetHeight : 0
                  const sectionNav = document.querySelector('.shop-section-nav') as HTMLElement
                  const navH = sectionNav ? sectionNav.offsetHeight : 0
                  const y = el.getBoundingClientRect().top + window.scrollY - headerH - navH - 16
                  window.scrollTo({ top: y, behavior: 'smooth' })
                }}>
                {en ? sec.en : sec.zh}
              </a>
            ))}
          </nav>

          {sectionLoading ? (
            <ProductGridSkeleton count={8} />
          ) : (
            <>
              {CATEGORY_SECTIONS.map(sec => {
                const items = sectionData[sec.slug] || []
                if (items.length === 0) return null
                return (
                  <section key={sec.slug} id={sec.slug} className="shop-category-section">
                    <h2 className="shop-section-title">{en ? sec.en : sec.zh}</h2>
                    <ProductGrid items={items} />
                  </section>
                )
              })}
              {(() => {
                const shownIds = new Set(
                  CATEGORY_SECTIONS.flatMap(sec => (sectionData[sec.slug] || []).map(p => p.id))
                )
                const remaining = allPetProducts.filter(p => !shownIds.has(p.id))
                if (remaining.length === 0) return null
                return (
                  <section id="all-products" className="shop-category-section">
                    <h2 className="shop-section-title">{en ? 'All Products' : '全部商品'}</h2>
                    <ProductGrid items={remaining} />
                  </section>
                )
              })()}
            </>
          )}
        </div>
      ) : (
        /* Normal mode: single list with filters */
        <div className={`shop-layout ${showFilters ? 'shop-layout--filters-open' : ''}`}>
          <aside className={`shop-filters ${showFilters ? 'shop-filters--open' : ''}`}>
            <div className="shop-filters-header">
              <h3>{en ? 'Filters' : '筛选'}</h3>
              <button className="shop-filters-close" onClick={() => setShowFilters(false)}><X size={18} /></button>
            </div>

            {categories.length > 0 && (
              <div className="filter-group">
                <h4>{en ? 'Category' : '分类'}</h4>
                {categories.map(c => (
                  <label key={c.id} className="filter-checkbox">
                    <input type="radio" name="cat" checked={cat === c.slug} onChange={() => updateUrl({ category: cat === c.slug ? '' : c.slug, page: '1' })} />
                    <span>{c.name}</span>
                  </label>
                ))}
                {cat && <button className="filter-clear" onClick={() => updateUrl({ category: '', page: '1' })}>{en ? 'Clear' : '清除'}</button>}
              </div>
            )}

            <div className="filter-group">
              <h4>{en ? 'Price Range' : '价格范围'}</h4>
              <div className="filter-price-inputs">
                <input type="number" placeholder="Min" value={minP} onChange={e => updateUrl({ minPrice: e.target.value, page: '1' })} min="0" step="1" />
                <span>—</span>
                <input type="number" placeholder="Max" value={maxP} onChange={e => updateUrl({ maxPrice: e.target.value, page: '1' })} min="0" step="1" />
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button className="filter-clear-all" onClick={() => updateUrl({ category: '', minPrice: '', maxPrice: '', page: '1' })}>
                {en ? 'Clear All Filters' : '清除所有筛选'}
              </button>
            )}
          </aside>

          <div className="shop-products">
            <div className="shop-results-count">
              {total} {en ? (total === 1 ? 'product' : 'products') : '个商品'}
            </div>

            {loading ? (
              <ProductGridSkeleton count={PAGE_SIZE} />
            ) : products.length > 0 ? (
              <ProductGrid items={products} />
            ) : (
              <div className="shop-empty">
                <p>{en ? 'No products found matching your filters.' : '没有找到匹配的商品'}</p>
                <button className="btn-secondary" onClick={() => router.push('/shop')}>
                  {en ? 'Clear Filters' : '清除筛选'}
                </button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="shop-pagination">
                <button disabled={page <= 1} onClick={() => updateUrl({ page: String(page - 1) })}>
                  <ChevronLeft size={16} /> {en ? 'Prev' : '上一页'}
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
                  {en ? 'Next' : '下一页'} <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
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
