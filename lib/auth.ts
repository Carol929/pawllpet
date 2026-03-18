import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import { generateUniqueUsername } from '@/lib/utils'

const providers = []

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

export const { handlers, auth } = NextAuth({
  providers,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth?tab=login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google' || !user.email) return true

      const existing = await prisma.user.findUnique({ where: { email: user.email } })

      if (!existing) {
        const username = await generateUniqueUsername(user.email, async (candidate) => {
          const hit = await prisma.user.findUnique({ where: { username: candidate } })
          return Boolean(hit)
        })

        await prisma.user.create({
          data: {
            email: user.email,
            fullName: user.name || 'Google User',
            username,
            emailVerified: true,
            avatarUrl: user.image || undefined,
            role: 'user',
          },
        })
      } else {
        // Update existing user: verify email if needed, update avatar if missing
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            ...(!existing.emailVerified ? { emailVerified: true } : {}),
            ...(!existing.avatarUrl && user.image ? { avatarUrl: user.image } : {}),
            lastLoginAt: new Date(),
          },
        })
      }

      return true
    },
    async redirect({ url, baseUrl }) {
      // After Google sign-in, redirect to our bridge page
      if (url.includes('/api/auth/callback')) {
        return `${baseUrl}/auth/google-callback`
      }
      return url.startsWith(baseUrl) ? url : baseUrl
    },
  },
})
