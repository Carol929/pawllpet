import { ProductGrid } from '@/components/ProductGrid'; import { products } from '@/lib/catalog';
export default function Page(){return <main className='container page-stack'><h1>Best sellers</h1><ProductGrid items={products.filter(p=>p.isBestSeller)} /></main>}
