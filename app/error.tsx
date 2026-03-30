'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="container page-stack" style={{ textAlign: 'center', padding: '4rem 0' }}>
      <h1 style={{ fontSize: '2rem', margin: '0 0 .5rem' }}>Something went wrong</h1>
      <p style={{ color: '#888', marginBottom: '1.5rem' }}>We encountered an unexpected error. Please try again.</p>
      <button className="btn-primary" onClick={reset}>Try Again</button>
    </main>
  )
}
