import Link from 'next/link'; import { blogPosts } from '@/lib/products';
export default function Page(){return <main className='container page-stack'><h1>Journal</h1>{blogPosts.map(p=><article key={p.slug}><h3><Link href={`/blog/${p.slug}`}>{p.title}</Link></h3><p>{p.excerpt}</p></article>)}</main>}
