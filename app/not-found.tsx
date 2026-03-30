import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="container page-stack" style={{ textAlign: 'center', padding: '4rem 0' }}>
      <h1 style={{ fontSize: '4rem', margin: '0 0 .5rem', color: '#D4B28C' }}>404</h1>
      <h2 style={{ margin: '0 0 1rem' }}>Page Not Found</h2>
      <p style={{ color: '#888', marginBottom: '1.5rem' }}>The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <Link href="/" className="btn-primary">Back to Home</Link>
    </main>
  )
}
