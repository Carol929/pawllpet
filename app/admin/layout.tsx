'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Users, FileText, ArrowLeft, Store } from 'lucide-react'
import './admin.css'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/content', label: 'Content', icon: FileText },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <h2><Store size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />PawLL Admin</h2>
          <p>Seller Center</p>
        </div>
        <ul className="admin-nav">
          <li className="admin-nav-section">Management</li>
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link href={item.href} className={isActive ? 'active' : ''}>
                  <Icon size={18} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
        <a href="/" target="_blank" rel="noopener noreferrer" className="admin-preview-link">
          <Store size={16} />
          Preview Store
        </a>
        <Link href="/" className="admin-back-link">
          <ArrowLeft size={16} />
          Back to Store
        </Link>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  )
}
