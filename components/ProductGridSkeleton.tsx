'use client'

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="products-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-image" />
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line skeleton-line--subtitle" />
          <div className="skeleton-line skeleton-line--price" />
        </div>
      ))}
    </div>
  )
}
