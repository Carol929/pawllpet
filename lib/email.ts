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
    discountAmount?: number
    discountCode?: string | null
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
            Thanks for your order <strong>#${shortId}</strong>! We're preparing it now and will email you a tracking number within <strong>3 business days</strong>.
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
            ${order.discountAmount && order.discountAmount > 0 ? `
            <div style="display: flex; justify-content: space-between; font-size: 14px; color: #2e7d32; margin-bottom: 6px;">
              <span>Discount${order.discountCode ? ` (${order.discountCode})` : ''}</span><span>-$${order.discountAmount.toFixed(2)}</span>
            </div>
            ` : ''}
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
            📦 You'll receive a separate email with your tracking number within 3 business days.<br/>
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

export async function sendAdminOrderNotificationEmail(order: {
  orderId: string
  customerName: string
  customerEmail: string
  items: { name: string; quantity: number; price: number }[]
  subtotal: number
  shipping: number
  tax: number
  discountAmount?: number
  discountCode?: string | null
  total: number
  shippingAddress: Record<string, string>
}): Promise<void> {
  const client = getResend()
  if (!client) {
    console.warn('RESEND_API_KEY is missing; skipping admin order notification.')
    return
  }
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    console.warn('ADMIN_EMAIL is not set; skipping admin order notification.')
    return
  }

  const shopUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pawllpet.com'
  const shortId = order.orderId.slice(-8).toUpperCase()
  const addr = order.shippingAddress

  const itemRows = order.items.map(i =>
    `<tr>
      <td style="padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 14px;">${i.name}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 14px; text-align: center;">${i.quantity}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 14px; text-align: right;">$${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`
  ).join('')

  await client.emails.send({
    from: `${process.env.EMAIL_FROM_NAME || 'PawLL Pet'} <${process.env.EMAIL_FROM || 'noreply@pawllpet.com'}>`,
    to: adminEmail,
    subject: `🛒 New Order #${shortId} — $${order.total.toFixed(2)} from ${order.customerName}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #fff;">
        <div style="background: #1f2e44; padding: 16px 24px;">
          <h2 style="color: #fff; margin: 0; font-size: 18px;">🛒 New Order — Action Required</h2>
        </div>
        <div style="padding: 24px;">
          <p style="margin: 0 0 16px; font-size: 15px; color: #333;">
            A new order needs to be fulfilled within <strong>3 business days</strong>.
          </p>

          <div style="background: #f8f6f2; border-left: 4px solid #D4B28C; padding: 12px 16px; margin-bottom: 20px;">
            <div style="font-size: 13px; color: #666;">Order ID</div>
            <div style="font-size: 18px; font-weight: 700; color: #1f2e44; letter-spacing: 1px;">#${shortId}</div>
            <div style="font-size: 12px; color: #888; margin-top: 4px;">Full ID: ${order.orderId}</div>
          </div>

          <h3 style="color: #1f2e44; font-size: 14px; margin: 16px 0 6px;">Customer</h3>
          <p style="margin: 0; font-size: 14px; color: #333;">
            ${order.customerName}<br/>
            <a href="mailto:${order.customerEmail}" style="color: #D4B28C;">${order.customerEmail}</a>
          </p>

          <h3 style="color: #1f2e44; font-size: 14px; margin: 16px 0 6px;">Ship To</h3>
          <p style="margin: 0; font-size: 14px; color: #333;">
            ${addr.fullName || order.customerName}<br/>
            ${addr.street || ''}${addr.street2 ? ', ' + addr.street2 : ''}<br/>
            ${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}
          </p>

          <h3 style="color: #1f2e44; font-size: 14px; margin: 16px 0 6px;">Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8f6f2;">
                <th style="text-align: left; padding: 6px 8px; font-size: 12px; color: #666;">Item</th>
                <th style="text-align: center; padding: 6px 8px; font-size: 12px; color: #666;">Qty</th>
                <th style="text-align: right; padding: 6px 8px; font-size: 12px; color: #666;">Total</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <div style="margin-top: 16px; font-size: 14px; color: #333;">
            <div>Subtotal: $${order.subtotal.toFixed(2)}</div>
            <div>Shipping: ${order.shipping === 0 ? 'FREE' : '$' + order.shipping.toFixed(2)}</div>
            <div>Tax: $${order.tax.toFixed(2)}</div>
            ${order.discountAmount && order.discountAmount > 0 ? `<div style="color: #2e7d32;">Discount${order.discountCode ? ` (${order.discountCode})` : ''}: -$${order.discountAmount.toFixed(2)}</div>` : ''}
            <div style="font-size: 16px; font-weight: 700; color: #1f2e44; margin-top: 4px;">Total: $${order.total.toFixed(2)}</div>
          </div>

          <div style="margin-top: 24px; text-align: center;">
            <a href="${shopUrl}/admin/orders" style="display: inline-block; background: #1f2e44; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
              Open Admin → Orders
            </a>
          </div>
        </div>
      </div>
    `,
  })
}

export async function sendOrderShippedEmail(
  email: string,
  name: string,
  order: {
    orderId: string
    trackingNumber: string
    items: { name: string; quantity: number }[]
  }
): Promise<void> {
  const client = getResend()
  if (!client) {
    console.warn('RESEND_API_KEY is missing; skipping order shipped email.')
    return
  }

  const shopUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pawllpet.com'
  const shortId = order.orderId.slice(-8).toUpperCase()

  const itemList = order.items.map(i =>
    `<li style="margin-bottom: 4px;">${i.name} <span style="color: #888;">× ${i.quantity}</span></li>`
  ).join('')

  await client.emails.send({
    from: `${process.env.EMAIL_FROM_NAME || 'PawLL Pet'} <${process.env.EMAIL_FROM || 'noreply@pawllpet.com'}>`,
    to: email,
    subject: `Your PawLL order #${shortId} is on the way! 📦`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fffdf8;">
        <!-- Header -->
        <div style="background: #1f2e44; padding: 24px 32px; text-align: center;">
          <h1 style="color: #D4B28C; margin: 0; font-size: 24px; letter-spacing: 1px;">PawLL Pet</h1>
          <p style="color: #e5e7eb; margin: 6px 0 0; font-size: 13px;">Premium Pet Essentials</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">
          <h2 style="color: #1f2e44; margin: 0 0 8px; font-size: 22px;">Your order is on the way! 📦</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
            Hi ${name}, great news — your order <strong>#${shortId}</strong> just shipped! Use the tracking number below to follow it to your door.
          </p>

          <!-- Tracking Card -->
          <div style="background: linear-gradient(135deg, #fef3e2, #fde8c8); border: 2px solid #D4B28C; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="color: #92600a; font-size: 13px; margin: 0 0 8px; letter-spacing: 1px;">YOUR TRACKING NUMBER</p>
            <p style="font-size: 22px; font-weight: 700; color: #1f2e44; letter-spacing: 2px; margin: 0; word-break: break-all;">${order.trackingNumber}</p>
          </div>

          <!-- Items shipped -->
          <h3 style="color: #1f2e44; font-size: 15px; margin: 16px 0 8px;">What's in this shipment</h3>
          <ul style="color: #555; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0 0 24px;">
            ${itemList}
          </ul>

          <!-- CTA -->
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${shopUrl}/account" style="display: inline-block; background: #1f2e44; color: #fff; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px;">
              View Order Details
            </a>
          </div>

          <p style="color: #888; font-size: 13px; text-align: center;">
            Questions about your delivery? Email us at <a href="mailto:support@pawllpet.com" style="color: #D4B28C;">support@pawllpet.com</a>
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

export async function sendAdminCancellationRequestEmail(payload: {
  orderId: string
  customerName: string
  customerEmail: string
  orderStatus: string
  orderTotal: number
  reason: string
}): Promise<void> {
  const client = getResend()
  if (!client) {
    console.warn('RESEND_API_KEY is missing; skipping admin cancellation request email.')
    return
  }
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    console.warn('ADMIN_EMAIL is not set; skipping admin cancellation request email.')
    return
  }

  const shopUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pawllpet.com'
  const shortId = payload.orderId.slice(-8).toUpperCase()

  await client.emails.send({
    from: `${process.env.EMAIL_FROM_NAME || 'PawLL Pet'} <${process.env.EMAIL_FROM || 'noreply@pawllpet.com'}>`,
    to: adminEmail,
    subject: `Cancellation Request - Order #${shortId} from ${payload.customerName}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #fff;">
        <div style="background: #b91c1c; padding: 16px 24px;">
          <h2 style="color: #fff; margin: 0; font-size: 18px;">Cancellation Request - Action Required</h2>
        </div>
        <div style="padding: 24px;">
          <p style="margin: 0 0 16px; font-size: 15px; color: #333;">
            A customer has requested to cancel their order. Please review and process below.
          </p>

          <div style="background: #fef2f2; border-left: 4px solid #b91c1c; padding: 12px 16px; margin-bottom: 20px;">
            <div style="font-size: 13px; color: #666;">Order ID</div>
            <div style="font-size: 18px; font-weight: 700; color: #1f2e44; letter-spacing: 1px;">#${shortId}</div>
            <div style="font-size: 12px; color: #888; margin-top: 4px;">Status when requested: <strong>${payload.orderStatus}</strong> &nbsp;|&nbsp; Total: $${payload.orderTotal.toFixed(2)}</div>
          </div>

          <h3 style="color: #1f2e44; font-size: 14px; margin: 16px 0 6px;">Customer</h3>
          <p style="margin: 0; font-size: 14px; color: #333;">
            ${payload.customerName}<br/>
            <a href="mailto:${payload.customerEmail}" style="color: #D4B28C;">${payload.customerEmail}</a>
          </p>

          <h3 style="color: #1f2e44; font-size: 14px; margin: 16px 0 6px;">Reason from customer</h3>
          <div style="background: #f8f6f2; border-radius: 8px; padding: 14px; font-size: 14px; color: #333; white-space: pre-wrap; line-height: 1.5;">${escapeHtml(payload.reason)}</div>

          <div style="margin-top: 24px; text-align: center;">
            <a href="${shopUrl}/admin/orders" style="display: inline-block; background: #1f2e44; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
              Review in Admin Dashboard
            </a>
          </div>

          <p style="margin: 20px 0 0; font-size: 12px; color: #888; text-align: center;">
            Refund (if any) must be issued manually in the Stripe Dashboard, then recorded in admin.
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendOrderCancellationResultEmail(
  email: string,
  name: string,
  payload: {
    orderId: string
    resolution: string
    refundAmount: number
    adminNote: string | null
    orderTotal: number
  }
): Promise<void> {
  const client = getResend()
  if (!client) {
    console.warn('RESEND_API_KEY is missing; skipping cancellation result email.')
    return
  }

  const shopUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pawllpet.com'
  const shortId = payload.orderId.slice(-8).toUpperCase()

  const resolutionMap: Record<string, { title: string; body: string }> = {
    full_refund: {
      title: 'Order Cancelled - Full Refund Issued',
      body: `We've issued a full refund of <strong>$${payload.refundAmount.toFixed(2)}</strong> to your original payment method. Please allow <strong>5-10 business days</strong> for the refund to appear on your card statement.`,
    },
    partial_50: {
      title: 'Order Cancelled - Partial Refund Issued',
      body: `We've issued a partial refund of <strong>$${payload.refundAmount.toFixed(2)}</strong> (50% of order total) to your original payment method. Please allow <strong>5-10 business days</strong> for the refund to appear on your card statement.`,
    },
    reship: {
      title: 'Replacement Order on the Way',
      body: `Instead of a refund, we'll be shipping you a replacement order. You'll receive a separate email with a new tracking number within <strong>3 business days</strong>.`,
    },
    no_action: {
      title: 'Cancellation Request Reviewed',
      body: `After review, we are unable to process a refund or replacement for this order. Please see the note from our team below for details.`,
    },
    other: {
      title: 'Cancellation Request Processed',
      body: `Your cancellation request has been reviewed. ${payload.refundAmount > 0 ? `A refund of <strong>$${payload.refundAmount.toFixed(2)}</strong> has been issued — please allow <strong>5-10 business days</strong> to appear on your card.` : 'Please see the note from our team below for details.'}`,
    },
  }

  const r = resolutionMap[payload.resolution] || resolutionMap.other

  await client.emails.send({
    from: `${process.env.EMAIL_FROM_NAME || 'PawLL Pet'} <${process.env.EMAIL_FROM || 'noreply@pawllpet.com'}>`,
    to: email,
    subject: `${r.title} - Order #${shortId}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fffdf8;">
        <div style="background: #1f2e44; padding: 24px 32px; text-align: center;">
          <h1 style="color: #D4B28C; margin: 0; font-size: 24px; letter-spacing: 1px;">PawLL Pet</h1>
          <p style="color: #e5e7eb; margin: 6px 0 0; font-size: 13px;">Premium Pet Essentials</p>
        </div>

        <div style="padding: 32px;">
          <h2 style="color: #1f2e44; margin: 0 0 8px; font-size: 22px;">${r.title}</h2>
          <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
            Hi ${name}, we've processed your cancellation request for order <strong>#${shortId}</strong>.
          </p>

          <div style="background: #f8f6f2; border-radius: 10px; padding: 16px; margin-bottom: 20px; font-size: 14px; color: #333; line-height: 1.6;">
            ${r.body}
          </div>

          ${payload.adminNote ? `
          <h3 style="color: #1f2e44; font-size: 14px; margin: 20px 0 6px;">Note from our team</h3>
          <div style="background: #fffaf0; border-left: 4px solid #D4B28C; padding: 12px 16px; font-size: 14px; color: #333; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(payload.adminNote)}</div>
          ` : ''}

          <div style="text-align: center; margin: 32px 0;">
            <a href="${shopUrl}/account#orders" style="display: inline-block; background: #1f2e44; color: #fff; padding: 14px 36px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px;">
              View My Orders
            </a>
          </div>

          <p style="color: #888; font-size: 13px; text-align: center; margin-top: 24px;">
            Questions? Email us at <a href="mailto:support@pawllpet.com" style="color: #D4B28C;">support@pawllpet.com</a>
          </p>
        </div>

        <div style="background: #1f2e44; padding: 16px 32px; text-align: center;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            PawLL Pet | Premium pet essentials with collectible drop energy
          </p>
        </div>
      </div>
    `,
  })
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
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
