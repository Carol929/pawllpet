import { notFound } from 'next/navigation'; import { blogPosts } from '@/lib/static-data';
export default async function Page(props:{params: Promise<{slug:string}>}) {
  const params = await props.params
  const post=blogPosts.find(p=>p.slug===params.slug);if(!post) return notFound();return <main className='container page-stack'><h1>{post.title}</h1><p>{post.excerpt}</p><p>PawLL editorial content module is CMS-ready via BlogPost data model.</p></main>
}
