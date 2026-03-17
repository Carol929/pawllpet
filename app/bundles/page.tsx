import { ProductGrid } from '@/components/ProductGrid'; import { products } from '@/lib/catalog';
export default function Page(){return <main className='container page-stack'><h1>Bundles & gift sets</h1><ProductGrid items={products.filter(p=>p.isBundle)} /></main>}
