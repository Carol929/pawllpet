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

export async function sendNewsletterWelcomeEmail(email: string, discountCode: string): Promise<void> {
  const client = getResend()
  if (!client) {
    console.warn('RESEND_API_KEY is missing; skipping newsletter welcome email.')
    return
  }

  const shopUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pawllpet.com'

  await client.emails.send({
    from: `${process.env.EMAIL_FROM_NAME || 'PawLL Pet'} <${process.env.EMAIL_FROM || 'noreply@pawllpet.com'}>`,
    to: email,
    subject: '🎉 Grand Opening! Here\'s Your 25% Off Code',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fffdf8;">
        <!-- Header -->
        <div style="background: #1f2e44; padding: 24px 32px; text-align: center;">
          <h1 style="color: #D4B28C; margin: 0; font-size: 24px; letter-spacing: 1px;">PawLL Pet</h1>
          <p style="color: #e5e7eb; margin: 6px 0 0; font-size: 13px;">Premium Pet Essentials</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">
          <h2 style="color: #1f2e44; margin: 0 0 8px; font-size: 22px;">🎉 Grand Opening Special!</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
            Thanks for joining our newsletter! To celebrate our grand opening, here's your exclusive 25% discount code:
          </p>

          <!-- Discount Code Card -->
          <div style="background: linear-gradient(135deg, #fef3e2, #fde8c8); border: 2px solid #D4B28C; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="color: #92600a; font-size: 14px; margin: 0 0 8px;">YOUR DISCOUNT CODE</p>
            <p style="font-size: 28px; font-weight: 700; color: #1f2e44; letter-spacing: 3px; margin: 0 0 8px;">${discountCode}</p>
            <p style="color: #92600a; font-size: 13px; margin: 0;">25% off your order &bull; Expires 5/31/2026</p>
          </div>

          <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            Simply enter this code at checkout to save 25% on your order. This grand opening offer expires on May 31, 2026 — don't miss out!
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${shopUrl}/shop" style="display: inline-block; background: #1f2e44; color: #fff; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px;">
              Shop Now & Save 25%
            </a>
          </div>

          <!-- What to Expect -->
          <div style="border-top: 1px solid #ececec; padding-top: 20px; margin-bottom: 20px;">
            <h3 style="color: #1f2e44; font-size: 16px; margin: 0 0 8px;">As a subscriber, you'll get:</h3>
            <ul style="color: #555; font-size: 14px; line-height: 2; padding-left: 20px; margin: 0;">
              <li>Early access to new product drops</li>
              <li>Exclusive deals and promotions</li>
              <li>Pet care tips and tricks</li>
              <li>First look at mystery boxes</li>
            </ul>
          </div>

          <!-- Social -->
          <div style="text-align: center; padding: 16px 0; border-top: 1px solid #ececec;">
            <p style="color: #888; font-size: 13px; margin: 0 0 8px;">Follow us for more pet content!</p>
            <a href="https://instagram.com/pawllpet" style="color: #D4B28C; text-decoration: none; margin: 0 8px; font-size: 14px;">Instagram</a>
            <a href="https://tiktok.com/@pawllpet" style="color: #D4B28C; text-decoration: none; margin: 0 8px; font-size: 14px;">TikTok</a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #1f2e44; padding: 16px 32px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            PawLL Pet | Premium pet essentials with collectible drop energy
          </p>
          <p style="color: #666; font-size: 11px; margin: 6px 0 0;">
            <a href="${shopUrl}/privacy-policy" style="color: #888; text-decoration: none;">Privacy</a> &nbsp;|&nbsp;
            <a href="${shopUrl}/terms-conditions" style="color: #888; text-decoration: none;">Terms</a> &nbsp;|&nbsp;
            <a href="${shopUrl}" style="color: #888; text-decoration: none;">pawllpet.com</a>
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  order: {
    orderId: string
    items: { name: string; quantity: number; price: number }[]
    subtotal: number
    shipping: number
    tax: number
    total: number
    shippingAddress: Record<string, string>
  }
): Promise<void> {
  const client = getResend()
  if (!client) {
    console.warn('RESEND_API_KEY is missing; skipping order confirmation email.')
    return
  }

  const shopUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pawllpet.com'
  const shortId = order.orderId.slice(-8).toUpperCase()
  const addr = order.shippingAddress

  const itemRows = order.items.map(i =>
    `<tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #333;">${i.name}</td>
      <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #555; text-align: center;">${i.quantity}</td>
      <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #333; text-align: right;">$${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`
  ).join('')

  await client.emails.send({
    from: `${process.env.EMAIL_FROM_NAME || 'PawLL Pet'} <${process.env.EMAIL_FROM || 'noreply@pawllpet.com'}>`,
    to: email,
    subject: `Order Confirmed #${shortId} 🎉`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fffdf8;">
        <!-- Header -->
        <div style="background: #1f2e44; padding: 24px 32px; text-align: center;">
          <h1 style="color: #D4B28C; margin: 0; font-size: 24px; letter-spacing: 1px;">PawLL Pet</h1>
          <p style="color: #e5e7eb; margin: 6px 0 0; font-size: 13px;">Premium Pet Essentials</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">
          <h2 style="color: #1f2e44; margin: 0 0 8px; font-size: 22px;">Thank you, ${name}!</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
            Your order <strong>#${shortId}</strong> has been confirmed and is being prepared for shipment.
          </p>

          <!-- Order Items -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #D4B28C;">
                <th style="text-align: left; padding: 8px 0; font-size: 13px; color: #888;">Item</th>
                <th style="text-align: center; padding: 8px 0; font-size: 13px; color: #888;">Qty</th>
                <th style="text-align: right; padding: 8px 0; font-size: 13px; color: #888;">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <!-- Totals -->
          <div style="background: #f8f6f2; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; font-size: 14px; color: #555; margin-bottom: 6px;">
              <span>Subtotal</span><span>$${order.subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px; color: #555; margin-bottom: 6px;">
              <span>Shipping</span><span>${order.shipping === 0 ? 'FREE' : '$' + order.shipping.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px; color: #555; margin-bottom: 6px;">
              <span>Tax</span><span>$${order.tax.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #1f2e44; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 6px;">
              <span>Total</span><span>$${order.total.toFixed(2)}</span>
            </div>
          </div>

          <!-- Shipping Address -->
          <div style="margin-bottom: 24px;">
            <h3 style="color: #1f2e44; font-size: 15px; margin: 0 0 8px;">Shipping To</h3>
            <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0;">
              ${addr.fullName || name}<br/>
              ${addr.street || ''}${addr.street2 ? ', ' + addr.street2 : ''}<br/>
              ${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}
            </p>
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${shopUrl}/account" style="display: inline-block; background: #1f2e44; color: #fff; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px;">
              View Order Status
            </a>
          </div>

          <p style="color: #888; font-size: 13px; text-align: center;">
            We'll send you a tracking number once your order ships.
            Questions? Email us at <a href="mailto:support@pawllpet.com" style="color: #D4B28C;">support@pawllpet.com</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #1f2e44; padding: 16px 32px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            PawLL Pet | Premium pet essentials with collectible drop energy
          </p>
          <p style="color: #666; font-size: 11px; margin: 6px 0 0;">
            <a href="${shopUrl}/privacy-policy" style="color: #888; text-decoration: none;">Privacy</a> &nbsp;|&nbsp;
            <a href="${shopUrl}/terms-conditions" style="color: #888; text-decoration: none;">Terms</a> &nbsp;|&nbsp;
            <a href="${shopUrl}" style="color: #888; text-decoration: none;">pawllpet.com</a>
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendQuizGiftEmail(email: string, name: string, giftName: string): Promise<void> {
  const client = getResend()
  if (!client) {
    console.warn('RESEND_API_KEY is missing; skipping quiz gift email.')
    return
  }

  const shopUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pawllpet.com'

  await client.emails.send({
    from: `${process.env.EMAIL_FROM_NAME || 'PawLL Pet'} <${process.env.EMAIL_FROM || 'noreply@pawllpet.com'}>`,
    to: email,
    subject: 'Your Free Gift is Waiting! 🎁',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fffdf8;">
        <!-- Header -->
        <div style="background: #1f2e44; padding: 24px 32px; text-align: center;">
          <h1 style="color: #D4B28C; margin: 0; font-size: 24px; letter-spacing: 1px;">PawLL Pet</h1>
          <p style="color: #e5e7eb; margin: 6px 0 0; font-size: 13px;">Premium Pet Essentials</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">
          <h2 style="color: #1f2e44; margin: 0 0 8px; font-size: 22px;">Hi ${name}! 🎉</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
            Thanks for completing our Pet Quiz! We've added a special free gift to your cart:
          </p>

          <!-- Gift Card -->
          <div style="background: linear-gradient(135deg, #fef3e2, #fde8c8); border: 2px solid #D4B28C; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <p style="font-size: 32px; margin: 0;">🎁</p>
            <h3 style="color: #1f2e44; margin: 8px 0 4px; font-size: 18px;">${giftName}</h3>
            <p style="color: #92600a; font-size: 14px; margin: 0;">FREE with any purchase of $10 or more</p>
          </div>

          <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            Your gift is already in your cart! Just add $10+ of products you love, and it's yours — completely free.
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${shopUrl}/shop" style="display: inline-block; background: #1f2e44; color: #fff; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px;">
              Shop Now & Claim Your Gift
            </a>
          </div>

          <!-- Recommendations -->
          <div style="border-top: 1px solid #ececec; padding-top: 20px; margin-bottom: 20px;">
            <h3 style="color: #1f2e44; font-size: 16px; margin: 0 0 8px;">Based on your quiz results, we recommend:</h3>
            <ul style="color: #555; font-size: 14px; line-height: 2; padding-left: 20px; margin: 0;">
              <li>Cozy beds & blankets for rest time</li>
              <li>Fun toys to keep your pet active</li>
              <li>Quality bowls & feeders for mealtime</li>
              <li>Stylish leashes & harnesses for walks</li>
            </ul>
          </div>

          <!-- Social -->
          <div style="text-align: center; padding: 16px 0; border-top: 1px solid #ececec;">
            <p style="color: #888; font-size: 13px; margin: 0 0 8px;">Follow us for more pet content!</p>
            <a href="https://instagram.com/pawllpet" style="color: #D4B28C; text-decoration: none; margin: 0 8px; font-size: 14px;">Instagram</a>
            <a href="https://tiktok.com/@pawllpet" style="color: #D4B28C; text-decoration: none; margin: 0 8px; font-size: 14px;">TikTok</a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #1f2e44; padding: 16px 32px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            PawLL Pet | Premium pet essentials with collectible drop energy
          </p>
          <p style="color: #666; font-size: 11px; margin: 6px 0 0;">
            <a href="${shopUrl}/privacy-policy" style="color: #888; text-decoration: none;">Privacy</a> &nbsp;|&nbsp;
            <a href="${shopUrl}/terms-conditions" style="color: #888; text-decoration: none;">Terms</a> &nbsp;|&nbsp;
            <a href="${shopUrl}" style="color: #888; text-decoration: none;">pawllpet.com</a>
          </p>
        </div>
      </div>
    `,
  })
}
