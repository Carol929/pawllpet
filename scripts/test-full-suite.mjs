// Comprehensive end-to-end test suite covering ALL major user-facing features.
// Designed to be run repeatedly in a loop to catch flakiness, race conditions, etc.

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:3000'
const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)

let stats = { pass: 0, fail: 0, failures: [] }

function pass(msg) { stats.pass++; if (process.env.VERBOSE) console.log('  ✓ ' + msg) }
function fail(msg) {
  stats.fail++
  stats.failures.push(msg)
  console.log('  ✗ ' + msg)
}
function assert(cond, msg) {
  if (cond) pass(msg)
  else fail(msg)
}
async function token(userId, role = 'user') {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(JWT_SECRET)
}
async function api(path, opts = {}, tk) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  if (tk) headers.cookie = `auth-token=${tk}`
  // Retry transient fetch failures up to 3 times
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers })
      let data = null
      try { data = await res.json() } catch {}
      return { status: res.status, data }
    } catch (err) {
      if (attempt === 3) throw err
      await new Promise(r => setTimeout(r, 500 * attempt))
    }
  }
}

async function run() {
  const runId = Date.now() + '-' + Math.random().toString(36).slice(2, 8)
  let testUser, testProduct, variantProduct, admin, secondUser

  try {
    // ============ SETUP ============
    const email = `suite-${runId}@example.com`
    testUser = await prisma.user.create({
      data: {
        email,
        username: `suite${runId}`.slice(0, 30),
        fullName: 'Suite Test',
        emailVerified: true,
        password: await bcrypt.hash('Password1!', 10),
        role: 'user',
      },
    })

    const email2 = `suite2-${runId}@example.com`
    secondUser = await prisma.user.create({
      data: {
        email: email2,
        username: `suite2${runId}`.slice(0, 30),
        fullName: 'Second User',
        emailVerified: true,
        password: await bcrypt.hash('Password1!', 10),
        role: 'user',
      },
    })

    admin = await prisma.user.findFirst({ where: { role: 'admin' } })
    assert(admin, 'admin exists')

    testProduct = await prisma.product.findFirst({
      where: { status: 'live', stock: { gt: 5 }, variants: { none: {} } },
      include: { images: { take: 1 } },
    })
    assert(testProduct, 'no-variant product exists')

    variantProduct = await prisma.product.findFirst({
      where: { status: 'live', variants: { some: { stock: { gt: 1 } } } },
      include: { variants: { where: { stock: { gt: 1 } } }, images: { take: 1 } },
    })
    assert(variantProduct, 'variant product exists')

    const userTok = await token(testUser.id)
    const secondTok = await token(secondUser.id)
    const adminTok = await token(admin.id, 'admin')

    // ============ AUTH ============
    // /api/auth/me — response shape is the user object directly (not wrapped)
    const me = await api('/api/auth/me', {}, userTok)
    assert(me.status === 200, 'GET /api/auth/me works')
    const meEmail = me.data?.email || me.data?.user?.email
    assert(meEmail === email, `/api/auth/me returns correct user (got ${meEmail})`)

    // Bad token
    const badMe = await api('/api/auth/me', {}, 'invalid.token.here')
    assert(badMe.status === 401, '/api/auth/me rejects invalid token')

    // No token
    const noMe = await api('/api/auth/me')
    assert(noMe.status === 401, '/api/auth/me rejects missing token')

    // Login (correct password)
    const login = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail: email, password: 'Password1!' }),
    })
    assert(login.status === 200, 'login with correct credentials works')

    // Login (wrong password)
    const badLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail: email, password: 'WrongPass!' }),
    })
    assert(badLogin.status === 401, 'login with wrong password fails (401)')

    // ============ PROFILE ============
    const profileUpdate = await api('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ phone: '703-555-0199', petType: 'Cat' }),
    }, userTok)
    assert(profileUpdate.status === 200, 'PATCH profile works')

    // ============ ADDRESSES ============
    const addr1 = await api('/api/addresses', {
      method: 'POST',
      body: JSON.stringify({
        label: 'Home', fullName: 'Test', street: '1 Main St',
        city: 'Arlington', state: 'VA', zip: '22202', isDefault: true,
      }),
    }, userTok)
    assert(addr1.status === 201, 'POST address works')

    const addrList = await api('/api/addresses', {}, userTok)
    assert(addrList.status === 200 && Array.isArray(addrList.data), 'GET addresses returns array')
    assert(addrList.data.length >= 1, 'address list has the new address')
    const addrId = addr1.data?.id

    // Address validation
    const badAddr = await api('/api/addresses', {
      method: 'POST',
      body: JSON.stringify({ fullName: '', street: '', city: '', state: '', zip: '' }),
    }, userTok)
    assert(badAddr.status === 400, 'POST address rejects missing fields')

    // Cleanup address
    if (addrId) {
      const delAddr = await api(`/api/addresses/${addrId}`, { method: 'DELETE' }, userTok)
      assert(delAddr.status === 200 || delAddr.status === 204, 'DELETE address works')
    }

    // ============ PETS ============
    const pet = await api('/api/pets', {
      method: 'POST',
      body: JSON.stringify({ name: 'Whiskers', type: 'Cat', breed: 'Tabby' }),
    }, userTok)
    assert(pet.status === 200, 'POST pet works')

    const petList = await api('/api/pets', {}, userTok)
    assert(petList.status === 200 && Array.isArray(petList.data), 'GET pets returns array')
    assert(petList.data.length >= 1, 'pet list contains created pet')

    const badPet = await api('/api/pets', {
      method: 'POST',
      body: JSON.stringify({ name: '', type: '' }),
    }, userTok)
    assert(badPet.status === 400, 'POST pet rejects missing fields')

    // ============ PRODUCTS ============
    const products = await api('/api/products?limit=5')
    assert(products.status === 200, 'GET products works')
    assert(Array.isArray(products.data?.products) && products.data.products.length > 0, 'products list is non-empty')

    const search = await api('/api/products?search=dog&limit=3')
    assert(search.status === 200, 'product search works')

    const filtered = await api('/api/products?petType=cat&limit=3')
    assert(filtered.status === 200, 'product petType filter works')

    const sortedDesc = await api('/api/products?sort=price_desc&limit=3')
    assert(sortedDesc.status === 200, 'product sort works')

    const sliced = await api(`/api/products/${testProduct.slug}`)
    assert(sliced.status === 200, 'GET product by slug works')
    assert(sliced.data?.id === testProduct.id, 'PDP returns correct product')

    const notFound = await api('/api/products/this-slug-definitely-does-not-exist')
    assert(notFound.status === 404, 'PDP returns 404 for unknown slug')

    // Reviews
    const reviews = await api(`/api/products/${testProduct.slug}/reviews`)
    assert(reviews.status === 200, 'GET reviews works')

    // ============ CATEGORIES ============
    const cats = await api('/api/categories')
    assert(cats.status === 200, 'GET categories works')

    // ============ HOMEPAGE ============
    const home = await api('/api/homepage')
    assert(home.status === 200, 'GET homepage works')
    assert(Array.isArray(home.data?.allProducts), 'homepage has allProducts')
    assert(Array.isArray(home.data?.newArrivals), 'homepage has newArrivals')
    assert(Array.isArray(home.data?.bestSellers), 'homepage has bestSellers')

    // Verify our stock fix: variant products show real stock totals, not 0
    const variantInBest = home.data.bestSellers.find(p => Array.isArray(p.variants) && p.variants.length > 0)
    if (variantInBest) {
      assert(typeof variantInBest.stock === 'number' && variantInBest.stock >= 0, 'bestseller variant product has numeric stock')
      // For products with variants, stock should be sum of variant stocks (could be > 0 if any variant has stock)
      const variantStockSum = variantInBest.variants.reduce((s, v) => s + (v.stock || 0), 0)
      assert(variantInBest.stock === variantStockSum, `bestseller variant product stock matches sum of variant stocks (${variantInBest.stock} === ${variantStockSum})`)
    }

    // ============ WISHLIST ============
    const addWish = await api('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId: testProduct.id }),
    }, userTok)
    assert(addWish.status === 200, 'POST wishlist works')

    const wishList = await api('/api/wishlist', {}, userTok)
    assert(wishList.status === 200 && Array.isArray(wishList.data), 'GET wishlist returns array')
    assert(wishList.data.some(w => w.id === testProduct.id), 'wishlist contains added product')

    // Duplicate add should be idempotent
    const dupWish = await api('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId: testProduct.id }),
    }, userTok)
    assert(dupWish.status === 200, 'duplicate wishlist add is idempotent')

    // Bad: no productId
    const badWish = await api('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({}),
    }, userTok)
    assert(badWish.status === 400, 'wishlist POST rejects missing productId')

    // No auth
    const unauthedWish = await api('/api/wishlist')
    assert(unauthedWish.status === 401, 'wishlist requires auth')

    const remWish = await api('/api/wishlist', {
      method: 'DELETE',
      body: JSON.stringify({ productId: testProduct.id }),
    }, userTok)
    assert(remWish.status === 200, 'DELETE wishlist works')

    // ============ NEWSLETTER ============
    // Bad email
    const badNl = await api('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'not-an-email' }),
    })
    assert(badNl.status === 400, 'newsletter rejects bad email')

    // Skip valid newsletter (would attempt send)

    // ============ CHECKOUT VALIDATION ============
    // PO Box
    const poBox = await api('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ productId: testProduct.id, quantity: 1 }],
        shippingAddress: { fullName: 'X', phone: '', street: 'PO Box 99', street2: '', city: 'A', state: 'CA', zip: '90001', country: 'US' },
        shippingMethod: 'standard',
      }),
    }, userTok)
    assert(poBox.status === 400, 'checkout rejects PO Box (street)')

    // Street2 PO Box
    const poBox2 = await api('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ productId: testProduct.id, quantity: 1 }],
        shippingAddress: { fullName: 'X', phone: '', street: '1 Main', street2: 'P.O. Box 50', city: 'A', state: 'CA', zip: '90001', country: 'US' },
        shippingMethod: 'standard',
      }),
    }, userTok)
    assert(poBox2.status === 400, 'checkout rejects PO Box (street2)')

    // Alaska
    const ak = await api('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ productId: testProduct.id, quantity: 1 }],
        shippingAddress: { fullName: 'X', phone: '', street: '1 Main', street2: '', city: 'Anchorage', state: 'AK', zip: '99501', country: 'US' },
        shippingMethod: 'standard',
      }),
    }, userTok)
    assert(ak.status === 400, 'checkout rejects Alaska')

    // Hawaii
    const hi = await api('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ productId: testProduct.id, quantity: 1 }],
        shippingAddress: { fullName: 'X', phone: '', street: '1 Main', street2: '', city: 'Honolulu', state: 'HI', zip: '96813', country: 'US' },
        shippingMethod: 'standard',
      }),
    }, userTok)
    assert(hi.status === 400, 'checkout rejects Hawaii')

    // Empty cart
    const emptyCart = await api('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: [],
        shippingAddress: { fullName: 'X', phone: '', street: '1 Main', street2: '', city: 'Arlington', state: 'VA', zip: '22202', country: 'US' },
        shippingMethod: 'standard',
      }),
    }, userTok)
    assert(emptyCart.status === 400, 'checkout rejects empty cart')

    // No auth
    const noAuthCheckout = await api('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ productId: testProduct.id, quantity: 1 }],
        shippingAddress: { fullName: 'X', phone: '', street: '1 Main', street2: '', city: 'Arlington', state: 'VA', zip: '22202', country: 'US' },
        shippingMethod: 'standard',
      }),
    })
    assert(noAuthCheckout.status === 401, 'checkout requires auth')

    // Invalid product ID
    const badProduct = await api('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ productId: 'fake-product-id-xxx', quantity: 1 }],
        shippingAddress: { fullName: 'X', phone: '', street: '1 Main', street2: '', city: 'Arlington', state: 'VA', zip: '22202', country: 'US' },
        shippingMethod: 'standard',
      }),
    }, userTok)
    assert(badProduct.status === 400 || badProduct.status === 404, 'checkout rejects invalid product id')

    // Successful checkout (will fail at Stripe but should auto-cancel)
    const goodCheckout = await api('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({
        items: [
          { productId: testProduct.id, quantity: 2 },
          { productId: variantProduct.id, quantity: 1, variantId: variantProduct.variants[0].id },
        ],
        shippingAddress: { fullName: 'Test', phone: '703-555-0100', street: '1 Main', street2: '', city: 'Arlington', state: 'VA', zip: '22202', country: 'US' },
        shippingMethod: 'standard',
      }),
    }, userTok)
    // Without Stripe key, expect 500 with auto-cancel
    if (goodCheckout.status === 500) {
      const cancelled = await prisma.order.findFirst({
        where: { userId: testUser.id, status: 'cancelled' },
        orderBy: { createdAt: 'desc' },
      })
      assert(cancelled !== null, 'checkout failure auto-cancels order')
    } else {
      assert(goodCheckout.status === 200, 'checkout succeeds when Stripe configured')
    }

    // ============ SHIPPING COST CALCULATION ============
    // Use weighted products to exercise different shipping tiers
    const lightProduct = await prisma.product.findFirst({
      where: { status: 'live', weight: { gt: 0, lt: 1 }, stock: { gt: 10 }, variants: { none: {} } },
      select: { id: true, name: true, weight: true, price: true, stock: true },
    })
    const mediumProduct = await prisma.product.findFirst({
      where: { status: 'live', weight: { gte: 1, lte: 5 }, stock: { gt: 5 }, variants: { none: {} } },
      select: { id: true, name: true, weight: true, price: true, stock: true },
    })

    if (lightProduct) {
      // Test: light product (< 1 lb) in VA — should get $7.99 standard
      const r = await api('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ productId: lightProduct.id, quantity: 1 }],
          shippingAddress: { fullName: 'Test', phone: '', street: '1 Main', street2: '', city: 'Arlington', state: 'VA', zip: '22202', country: 'US' },
          shippingMethod: 'standard',
        }),
      }, userTok)
      // Find the just-cancelled order
      const lightOrder = await prisma.order.findFirst({
        where: { userId: testUser.id },
        orderBy: { createdAt: 'desc' },
      })
      if (lightOrder && lightOrder.subtotal === lightProduct.price) {
        assert(lightOrder.shipping === 7.99, `light product (<1lb) standard shipping = $7.99 (got $${lightOrder.shipping})`)
      }
    }

    if (mediumProduct) {
      // Test: medium product (1-3 lb) — should get $9.99 standard (tier for weight <= 3)
      const r = await api('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ productId: mediumProduct.id, quantity: 1 }],
          shippingAddress: { fullName: 'Test', phone: '', street: '1 Main', street2: '', city: 'Arlington', state: 'VA', zip: '22202', country: 'US' },
          shippingMethod: 'standard',
        }),
      }, userTok)
      const medOrder = await prisma.order.findFirst({
        where: { userId: testUser.id },
        orderBy: { createdAt: 'desc' },
      })
      if (medOrder && medOrder.subtotal === mediumProduct.price) {
        const expected = mediumProduct.weight <= 1 ? 7.99 : mediumProduct.weight <= 3 ? 9.99 : 11.99
        assert(medOrder.shipping === expected, `medium product (${mediumProduct.weight}lb) standard = $${expected} (got $${medOrder.shipping})`)
      }

      // Test: express on same product costs more
      const r2 = await api('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ productId: mediumProduct.id, quantity: 1 }],
          shippingAddress: { fullName: 'Test', phone: '', street: '1 Main', street2: '', city: 'Arlington', state: 'VA', zip: '22202', country: 'US' },
          shippingMethod: 'express',
        }),
      }, userTok)
      const expOrder = await prisma.order.findFirst({
        where: { userId: testUser.id },
        orderBy: { createdAt: 'desc' },
      })
      if (expOrder && expOrder.subtotal === mediumProduct.price) {
        assert(expOrder.shipping > 0, `express shipping > 0 (got $${expOrder.shipping})`)
      }

      // Test: free shipping at >= $80 subtotal (standard only)
      const qty80 = Math.ceil(80 / mediumProduct.price)
      if (mediumProduct.stock >= qty80) {
        const r3 = await api('/api/checkout', {
          method: 'POST',
          body: JSON.stringify({
            items: [{ productId: mediumProduct.id, quantity: qty80 }],
            shippingAddress: { fullName: 'Test', phone: '', street: '1 Main', street2: '', city: 'Arlington', state: 'VA', zip: '22202', country: 'US' },
            shippingMethod: 'standard',
          }),
        }, userTok)
        const freeOrder = await prisma.order.findFirst({
          where: { userId: testUser.id },
          orderBy: { createdAt: 'desc' },
        })
        if (freeOrder && freeOrder.subtotal >= 80) {
          assert(freeOrder.shipping === 0, `free standard shipping at $${freeOrder.subtotal} (got $${freeOrder.shipping})`)
        }

        // Express at $80+ should still charge (free shipping is standard only)
        const r4 = await api('/api/checkout', {
          method: 'POST',
          body: JSON.stringify({
            items: [{ productId: mediumProduct.id, quantity: qty80 }],
            shippingAddress: { fullName: 'Test', phone: '', street: '1 Main', street2: '', city: 'Arlington', state: 'VA', zip: '22202', country: 'US' },
            shippingMethod: 'express',
          }),
        }, userTok)
        const paidExpress = await prisma.order.findFirst({
          where: { userId: testUser.id },
          orderBy: { createdAt: 'desc' },
        })
        if (paidExpress && paidExpress.subtotal >= 80) {
          assert(paidExpress.shipping > 0, `express still charged at $80+ subtotal (got $${paidExpress.shipping})`)
        }
      }
    }

    // ============ TAX CALCULATION ============
    if (lightProduct) {
      // VA — should have tax (nexus state)
      await api('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ productId: lightProduct.id, quantity: 1 }],
          shippingAddress: { fullName: 'Test', phone: '', street: '1 Main', street2: '', city: 'Arlington', state: 'VA', zip: '22202', country: 'US' },
          shippingMethod: 'standard',
        }),
      }, userTok)
      const vaOrder = await prisma.order.findFirst({
        where: { userId: testUser.id },
        orderBy: { createdAt: 'desc' },
      })
      if (vaOrder && vaOrder.subtotal === lightProduct.price) {
        assert(vaOrder.tax > 0, `VA (nexus) charges tax (got $${vaOrder.tax})`)
      }

      // Oregon — no sales tax
      await api('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ productId: lightProduct.id, quantity: 1 }],
          shippingAddress: { fullName: 'Test', phone: '', street: '1 Main', street2: '', city: 'Portland', state: 'OR', zip: '97201', country: 'US' },
          shippingMethod: 'standard',
        }),
      }, userTok)
      const orOrder = await prisma.order.findFirst({
        where: { userId: testUser.id },
        orderBy: { createdAt: 'desc' },
      })
      if (orOrder && orOrder.subtotal === lightProduct.price) {
        assert(orOrder.tax === 0, `Oregon (no sales tax) charges no tax (got $${orOrder.tax})`)
      }
    }

    // ============ DIRECT ORDER + WEBHOOK SIMULATION ============
    const productPriceCheckpoint = (await prisma.product.findUnique({ where: { id: testProduct.id }, select: { stock: true } })).stock
    const variantPriceCheckpoint = (await prisma.productVariant.findUnique({ where: { id: variantProduct.variants[0].id }, select: { stock: true } })).stock

    const order = await prisma.order.create({
      data: {
        userId: testUser.id,
        status: 'pending',
        subtotal: 50, shipping: 0, tax: 0, total: 50,
        shippingAddress: { fullName: 'Test', street: '1 Main', city: 'Arlington', state: 'VA', zip: '22202' },
        items: {
          create: [
            { productId: testProduct.id, name: testProduct.name, image: '/p.svg', price: testProduct.price, quantity: 2 },
            { productId: variantProduct.id, variantId: variantProduct.variants[0].id, name: variantProduct.name, image: '/p.svg', price: variantProduct.variants[0].price, quantity: 1 },
          ],
        },
      },
      include: { items: true },
    })
    assert(order.items.find(i => i.variantId === variantProduct.variants[0].id), 'OrderItem stores variantId')

    // Mimic webhook: mark paid + decrement stock
    await prisma.order.update({ where: { id: order.id }, data: { status: 'paid' } })
    for (const item of order.items) {
      if (item.variantId) {
        await prisma.productVariant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } })
      } else {
        await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } })
      }
    }
    const productAfter = await prisma.product.findUnique({ where: { id: testProduct.id }, select: { stock: true } })
    const variantAfter = await prisma.productVariant.findUnique({ where: { id: variantProduct.variants[0].id }, select: { stock: true } })
    assert(productAfter.stock === productPriceCheckpoint - 2, `base stock decremented (${productPriceCheckpoint} → ${productAfter.stock})`)
    assert(variantAfter.stock === variantPriceCheckpoint - 1, `variant stock decremented (${variantPriceCheckpoint} → ${variantAfter.stock})`)

    // ============ ORDER VISIBILITY + SECURITY ============
    const myOrders = await api('/api/orders', {}, userTok)
    assert(myOrders.status === 200, 'GET orders works')
    const orders = Array.isArray(myOrders.data) ? myOrders.data : (myOrders.data?.orders || [])
    assert(orders.some(o => o.id === order.id), 'orders list contains my order')

    const status1 = await api(`/api/orders/${order.id}/status`, {}, userTok)
    assert(status1.status === 200, 'GET order status works')
    assert(status1.data?.status === 'paid', 'order status returns paid')

    // Stranger blocked
    const stealAttempt = await api(`/api/orders/${order.id}/status`, {}, secondTok)
    assert(stealAttempt.status === 404 || stealAttempt.status === 403, `stranger blocked from order status (${stealAttempt.status})`)

    // No auth
    const noAuthStatus = await api(`/api/orders/${order.id}/status`)
    assert(noAuthStatus.status === 401, 'order status requires auth')

    // ============ ADMIN ORDERS ============
    const adminList = await api('/api/admin/orders?status=all&page=1', {}, adminTok)
    assert(adminList.status === 200, 'admin orders list works')

    // Non-admin user blocked
    const userOnAdmin = await api('/api/admin/orders', {}, userTok)
    assert(userOnAdmin.status === 401 || userOnAdmin.status === 403, `non-admin blocked from admin orders (${userOnAdmin.status})`)

    // PATCH tracking → triggers shipped email + auto status
    const trackNum = 'TRACK' + runId
    const patch = await api(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ trackingNumber: trackNum }),
    }, adminTok)
    assert(patch.status === 200, 'admin PATCH tracking works')

    const updated = await prisma.order.findUnique({ where: { id: order.id } })
    assert(updated.trackingNumber === trackNum, 'tracking number saved')
    assert(updated.status === 'shipped', `order auto-advanced to shipped (${updated.status})`)

    // Re-PATCH same tracking → should NOT trigger email (idempotency)
    const patchAgain = await api(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ trackingNumber: trackNum }),
    }, adminTok)
    assert(patchAgain.status === 200, 'duplicate tracking PATCH returns 200 (no-op)')

    // Change to a NEW tracking number → should send email again
    const trackNum2 = 'TRACK2-' + runId
    const patchNew = await api(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ trackingNumber: trackNum2 }),
    }, adminTok)
    assert(patchNew.status === 200, 'admin PATCH with new tracking works')
    const updated2 = await prisma.order.findUnique({ where: { id: order.id } })
    assert(updated2.trackingNumber === trackNum2, 'new tracking number saved')

    // Empty tracking string should NOT trigger email
    const patchEmpty = await api(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ trackingNumber: '' }),
    }, adminTok)
    assert(patchEmpty.status === 200, 'admin PATCH with empty tracking works (no email)')

    // PATCH status to delivered
    const deliver = await api(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'delivered' }),
    }, adminTok)
    assert(deliver.status === 200, 'admin can set status to delivered')

    // Invalid status
    const invalidStatus = await api(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'frobnicated' }),
    }, adminTok)
    assert(invalidStatus.status === 400, 'admin rejects invalid status value')

    // Cannot cancel delivered order
    const cancelDelivered = await api(`/api/orders/${order.id}/cancel`, { method: 'POST' }, userTok)
    assert(cancelDelivered.status === 400, 'cannot cancel delivered order')

    // Stranger cannot PATCH admin order
    const strangerPatch = await api(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ trackingNumber: 'HACK' }),
    }, secondTok)
    assert(strangerPatch.status === 401 || strangerPatch.status === 403, `non-admin cannot PATCH orders (${strangerPatch.status})`)

    // ============ ADMIN CUSTOMERS ============
    const customers = await api('/api/admin/customers?page=1', {}, adminTok)
    assert(customers.status === 200, 'admin customers list works')

    const userOnCustomers = await api('/api/admin/customers', {}, userTok)
    assert(userOnCustomers.status === 401 || userOnCustomers.status === 403, 'non-admin blocked from admin customers')

    // ============ ADMIN PRODUCTS ============
    const adminProducts = await api('/api/admin/products?page=1&limit=5', {}, adminTok)
    assert(adminProducts.status === 200, 'admin products list works')

    // ============ CANCEL FLOW ============
    const cancelOrder = await prisma.order.create({
      data: {
        userId: testUser.id,
        status: 'pending',
        subtotal: 10, shipping: 0, tax: 0, total: 10,
        shippingAddress: { fullName: 'Test', street: '1 Main', city: 'A', state: 'VA', zip: '22202' },
      },
    })
    const cancelRes = await api(`/api/orders/${cancelOrder.id}/cancel`, { method: 'POST' }, userTok)
    assert(cancelRes.status === 200, 'cancel pending order works')
    const refreshed = await prisma.order.findUnique({ where: { id: cancelOrder.id } })
    assert(refreshed.status === 'cancelled', 'order marked cancelled')

    // Cancel non-pending order should fail
    const cancelPaid = await api(`/api/orders/${order.id}/cancel`, { method: 'POST' }, userTok)
    assert(cancelPaid.status === 400, 'cannot cancel non-pending order')

    // Stranger cancel attempt
    const strangerCancelOrder = await prisma.order.create({
      data: {
        userId: testUser.id, status: 'pending',
        subtotal: 10, shipping: 0, tax: 0, total: 10,
        shippingAddress: { fullName: 'Test', street: '1 Main', city: 'A', state: 'VA', zip: '22202' },
      },
    })
    const strangerCancel = await api(`/api/orders/${strangerCancelOrder.id}/cancel`, { method: 'POST' }, secondTok)
    assert(strangerCancel.status === 404 || strangerCancel.status === 403, `stranger cannot cancel my order (${strangerCancel.status})`)

    // ============ AUTH EDGE CASES ============
    // Forgot password (just check API doesn't 500)
    const forgot = await api('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
    assert(forgot.status === 200 || forgot.status === 404, 'forgot-password endpoint responds')

    // Resend verification (skip — may send real email)

    // Logout
    const logout = await api('/api/auth/logout', { method: 'POST' }, userTok)
    assert(logout.status === 200, 'logout works')

    // ============ CLEANUP ============
    await prisma.product.update({ where: { id: testProduct.id }, data: { stock: productPriceCheckpoint } })
    await prisma.productVariant.update({ where: { id: variantProduct.variants[0].id }, data: { stock: variantPriceCheckpoint } })
  } catch (err) {
    fail(`UNEXPECTED EXCEPTION: ${err.message || err}`)
    if (err.stack) console.error(err.stack)
  } finally {
    // Cleanup test data
    try {
      if (testUser) {
        await prisma.wishlist.deleteMany({ where: { userId: testUser.id } })
        await prisma.address.deleteMany({ where: { userId: testUser.id } })
        await prisma.pet.deleteMany({ where: { userId: testUser.id } })
        await prisma.orderItem.deleteMany({ where: { order: { userId: testUser.id } } })
        await prisma.order.deleteMany({ where: { userId: testUser.id } })
        await prisma.emailVerificationToken.deleteMany({ where: { userId: testUser.id } })
        await prisma.user.delete({ where: { id: testUser.id } })
      }
      if (secondUser) {
        await prisma.orderItem.deleteMany({ where: { order: { userId: secondUser.id } } })
        await prisma.order.deleteMany({ where: { userId: secondUser.id } })
        await prisma.user.delete({ where: { id: secondUser.id } })
      }
    } catch (cleanErr) {
      console.error('  cleanup error:', cleanErr.message)
    }
  }
}

// Main
const ITER = parseInt(process.env.ITERATIONS || '1', 10)
const allRunStats = []

for (let i = 1; i <= ITER; i++) {
  stats = { pass: 0, fail: 0, failures: [] }
  const t0 = Date.now()
  console.log(`\n━━━━━━ Iteration ${i}/${ITER} ━━━━━━`)
  await run()
  const elapsed = Date.now() - t0
  console.log(`  → ${stats.pass} passed, ${stats.fail} failed in ${elapsed}ms`)
  allRunStats.push({ ...stats, iter: i, elapsed })
}

await prisma.$disconnect()

console.log('\n' + '═'.repeat(60))
console.log(' SUMMARY')
console.log('═'.repeat(60))
let totalPass = 0, totalFail = 0
const failureCounts = {}
allRunStats.forEach(s => {
  totalPass += s.pass
  totalFail += s.fail
  s.failures.forEach(f => failureCounts[f] = (failureCounts[f] || 0) + 1)
})
console.log(`Total: ${totalPass} passed, ${totalFail} failed across ${ITER} iteration(s)`)
console.log(`Avg per iteration: ${(totalPass / ITER).toFixed(1)} passed, ${(totalFail / ITER).toFixed(1)} failed`)
const flaky = Object.entries(failureCounts).filter(([_, c]) => c < ITER && c > 0)
const consistent = Object.entries(failureCounts).filter(([_, c]) => c === ITER)
if (consistent.length) {
  console.log('\n❌ Always-failing assertions:')
  consistent.forEach(([f, c]) => console.log(`   (${c}x) ${f}`))
}
if (flaky.length) {
  console.log('\n⚠️  Flaky assertions (failed some but not all iterations):')
  flaky.forEach(([f, c]) => console.log(`   (${c}/${ITER}x) ${f}`))
}
if (totalFail === 0) {
  console.log('\n✅ ALL CHECKS PASSED ON ALL ITERATIONS')
}

process.exit(totalFail === 0 ? 0 : 1)
