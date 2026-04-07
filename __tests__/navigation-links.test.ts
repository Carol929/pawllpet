import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

// ═══════════════════════════════════════════════════════════
// Verify all internal links have corresponding page files
// ═══════════════════════════════════════════════════════════

const appDir = path.resolve(__dirname, '../app')

function pageExists(route: string): boolean {
  // Normalize: /shop → app/shop/page.tsx
  const cleanRoute = route.split('?')[0].split('#')[0] // strip query & hash
  if (cleanRoute === '/') return fs.existsSync(path.join(appDir, 'page.tsx'))

  // Check both direct and (group) patterns
  const routePath = cleanRoute.startsWith('/') ? cleanRoute.slice(1) : cleanRoute
  const directPath = path.join(appDir, routePath, 'page.tsx')

  if (fs.existsSync(directPath)) return true

  // Check auth group: (auth)/auth/page.tsx
  const groupPath = path.join(appDir, `(auth)/${routePath}`, 'page.tsx')
  if (fs.existsSync(groupPath)) return true

  // Dynamic routes like /products/[slug]
  if (routePath.includes('/')) {
    const parts = routePath.split('/')
    const dynamicPath = path.join(appDir, parts[0], '[slug]', 'page.tsx')
    if (fs.existsSync(dynamicPath)) return true
  }

  return false
}

describe('Footer links all have pages', () => {
  const footerLinks = [
    '/faq',
    '/shipping-policy',
    '/privacy-policy',
    '/terms-conditions',
    '/returns-policy',
    '/exchange-policy',
    '/product-safety',
    '/cookie-policy',
    '/accessibility',
    '/contact',
    '/about',
    '/help-center',
    '/new-arrivals',
    '/shop-by-pet',
    '/shop-by-need',
    '/best-sellers',
    '/pet-quiz',
    '/track-order',
  ]

  footerLinks.forEach(link => {
    it(`page exists for ${link}`, () => {
      expect(pageExists(link)).toBe(true)
    })
  })
})

describe('Header nav links all have pages', () => {
  const headerLinks = [
    '/',
    '/shop',
    '/new-arrivals',
    '/about',
    '/cart',
    '/auth',
    '/account',
  ]

  headerLinks.forEach(link => {
    it(`page exists for ${link}`, () => {
      expect(pageExists(link)).toBe(true)
    })
  })
})

describe('Shop category links resolve', () => {
  const shopLinks = [
    '/shop?pet=cat#toys',
    '/shop?pet=cat#accessories',
    '/shop?pet=cat#beds',
    '/shop?pet=cat#bowls',
    '/shop?pet=dog#toys',
    '/shop?pet=dog#accessories',
    '/shop?pet=dog#beds',
    '/shop?pet=dog#bowls',
  ]

  shopLinks.forEach(link => {
    it(`shop page handles ${link}`, () => {
      // All shop links go to /shop which exists
      expect(pageExists(link)).toBe(true)
    })
  })
})

describe('Dynamic routes have page files', () => {
  it('product detail page exists', () => {
    expect(fs.existsSync(path.join(appDir, 'products/[slug]/page.tsx'))).toBe(true)
  })

  it('blog detail page exists', () => {
    expect(fs.existsSync(path.join(appDir, 'blog/[slug]/page.tsx'))).toBe(true)
  })

  it('collection detail page exists', () => {
    expect(fs.existsSync(path.join(appDir, 'collections/[slug]/page.tsx'))).toBe(true)
  })
})

describe('Admin routes have page files', () => {
  const adminRoutes = [
    'admin/page.tsx',
    'admin/products/page.tsx',
    'admin/products/new/page.tsx',
    'admin/orders/page.tsx',
    'admin/content/page.tsx',
  ]

  adminRoutes.forEach(route => {
    it(`admin page exists: ${route}`, () => {
      expect(fs.existsSync(path.join(appDir, route))).toBe(true)
    })
  })
})

describe('Auth flow routes exist', () => {
  it('login/signup page exists', () => {
    expect(pageExists('/auth')).toBe(true)
  })

  it('verify-email page exists', () => {
    expect(pageExists('/verify-email')).toBe(true)
  })

  it('set-password page exists', () => {
    expect(pageExists('/set-password')).toBe(true)
  })
})
