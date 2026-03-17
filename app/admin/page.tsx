import Link from 'next/link';
export default function Page(){return <main className='container page-stack'><h1>Admin dashboard</h1><p>RBAC-protected architecture for catalog, order, and CMS workflows.</p><ul><li><Link href='/admin/products'>Product management</Link></li><li><Link href='/admin/orders'>Order operations</Link></li><li><Link href='/admin/content'>CMS content</Link></li></ul></main>}
