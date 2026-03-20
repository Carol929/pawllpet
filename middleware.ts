import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { auth } from '@/lib/auth'

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
)

// Check custom auth-token cookie (email/password login)
async function checkCustomToken(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.role as string || null
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  // Method 1: Check custom JWT token (email/password login)
  const customRole = await checkCustomToken(request)
  if (customRole === 'admin') {
    return NextResponse.next()
  }

  // Method 2: Check NextAuth session (Google login)
  try {
    const session = await auth()
    const role = (session?.user as Record<string, unknown>)?.role
    if (role === 'admin') {
      return NextResponse.next()
    }
  } catch {
    // Session check failed, continue to redirect
  }

  // Not admin — redirect
  return NextResponse.redirect(new URL('/auth?tab=login&redirect=/admin', request.url))
}

export const config = {
  matcher: ['/admin/:path*'],
}
