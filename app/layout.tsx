import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Providers } from '@/components/Providers'
import { AdminRouteGuard } from '@/components/AdminRouteGuard'

export const metadata = {
  title: 'PawLL Pet | Premium Pet Commerce',
  description: 'PawLL Pet offers premium pet essentials, curated bundles, and limited drops.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <body>
        <Providers>
          <AdminRouteGuard
            header={<Header />}
            footer={<Footer />}
          >
            {children}
          </AdminRouteGuard>
        </Providers>
      </body>
    </html>
  )
}
