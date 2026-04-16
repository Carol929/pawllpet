import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getJwtSecret } from '@/lib/jwt'

export async function requireAdmin(request: NextRequest): Promise<{ userId: string; role: string } | NextResponse> {
  // Method 1: Check custom JWT token (email/password login)
  const token = request.cookies.get('auth-token')?.value
  if (token) {
    try {
      const { payload } = await jwtVerify(token, getJwtSecret())
      if (payload.role === 'admin') {
        return { userId: payload.userId as string, role: 'admin' }
      }
    } catch {
      // Token invalid, try NextAuth
    }
  }

  // Method 2: Check NextAuth session (Google login)
  try {
    const session = await auth()
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } })
      if (user?.role === 'admin') {
        return { userId: user.id, role: 'admin' }
      }
    }
  } catch {
    // Session check failed
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
