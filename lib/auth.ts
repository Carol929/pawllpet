import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import { generateUniqueUsername } from '@/lib/utils'

export const { handlers, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
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
      // Allow relative URLs and same-origin URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (url.startsWith(baseUrl)) return url
      return baseUrl
    },
  },
})
