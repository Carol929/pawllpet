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
            role: 'user',
          },
        })
      } else if (!existing.emailVerified) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { emailVerified: true },
        })
      }

      return true
    },
  },
})
