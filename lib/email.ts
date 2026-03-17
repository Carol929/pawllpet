import { Resend } from 'resend'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

export async function sendVerificationEmail(email: string, name: string, code: string): Promise<void> {
  const client = getResend()
  if (!client) {
    console.warn('RESEND_API_KEY is missing; skipping verification email send.')
    return
  }

  await client.emails.send({
    from: `${process.env.EMAIL_FROM_NAME || 'PawLL'} <${process.env.EMAIL_FROM || 'noreply@pawllpet.com'}>`,
    to: email,
    subject: 'Your PawLL Pet verification code',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 12px;">
        <h2>Hi ${name}, verify your email</h2>
        <p>Use this 6-digit code to verify your PawLL Pet account:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 4px;">${code}</p>
        <p>This code expires in 15 minutes.</p>
      </div>
    `,
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
