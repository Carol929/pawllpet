import { Resend } from 'resend'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

export async function sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
  const client = getResend()
  if (!client) {
    console.warn('RESEND_API_KEY is missing; skipping verification email send.')
    return
  }

  const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`
  await client.emails.send({
    from: `${process.env.EMAIL_FROM_NAME || 'PawLL'} <${process.env.EMAIL_FROM || 'noreply@pawllpet.com'}>`,
    to: email,
    subject: 'Verify your PawLL Pet account',
    html: `<p>Hi ${name}, confirm your email:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
  })
}

export async function sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
  const client = getResend()
  if (!client) {
    console.warn('RESEND_API_KEY is missing; skipping password reset email send.')
    return
  }

  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`
  await client.emails.send({
    from: `${process.env.EMAIL_FROM_NAME || 'PawLL'} <${process.env.EMAIL_FROM || 'noreply@pawllpet.com'}>`,
    to: email,
    subject: 'Reset your PawLL Pet password',
    html: `<p>Hi ${name}, reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  })
}
