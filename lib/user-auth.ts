import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
)

export async function requireUser(request: NextRequest): Promise<{ userId: string } | NextResponse> {
  // Method 1: Custom JWT token (email/password login)
  const token = request.cookies.get('auth-token')?.value
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      return { userId: payload.userId as string }
    } catch {
      // Token invalid, try NextAuth
    }
  }

  // Method 2: NextAuth session (Google login)
  try {
    const session = await auth()
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
      if (user) return { userId: user.id }
    }
  } catch {
    // Session check failed
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
