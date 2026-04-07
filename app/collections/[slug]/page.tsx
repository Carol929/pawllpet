'use client'

import { collections } from '@/lib/static-data'
import { ProductGrid } from '@/components/ProductGrid'
import { useProducts } from '@/lib/use-products'
import { useLocale } from '@/lib/i18n'

export default function CollectionDetail({ params }: { params: { slug: string } }) {
  const { slug } = params
  const { products, loading } = useProducts({ limit: '8' })
  const { locale } = useLocale()
  const en = locale === 'en'

  const c = collections.find((c) => c.slug === slug)

  if (!c) {
    return <main className="container page-stack"><h1>{en ? 'Collection not found' : '未找到该系列'}</h1></main>
  }

  return (
    <main className="container page-stack">
      <h1>{en ? c.title : c.titleZh}</h1>
      <p>{en ? c.description : c.descriptionZh}</p>
      {loading ? <p>{en ? 'Loading...' : '加载中...'}</p> : <ProductGrid items={products} />}
    </main>
  )
}
