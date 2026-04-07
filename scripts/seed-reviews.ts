import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const reviews: Record<string, { title: string; body: string }> = {}

// Generic review templates by category/keyword patterns
function generateReview(name: string, petType: string): { title: string; body: string } {
  const n = name.toLowerCase()
  const pet = petType === 'Cat' ? 'cat' : petType === 'Dog' ? 'dog' : 'pet'
  const petName = petType === 'Cat' ? 'Luna' : petType === 'Dog' ? 'Max' : 'Buddy'

  if (n.includes('toy') || n.includes('ball') || n.includes('chew') || n.includes('rope') || n.includes('squeaky') || n.includes('plush') || n.includes('frisbee') || n.includes('tug')) {
    return {
      title: 'Instant favorite!',
      body: `${petName} went absolutely crazy for this the moment I took it out of the box. Super durable and well-made — we've had it for weeks and it still looks brand new. Best ${pet} toy purchase I've made this year!`,
    }
  }
  if (n.includes('bed') || n.includes('mat') || n.includes('cushion') || n.includes('blanket') || n.includes('cozy') || n.includes('sleep')) {
    return {
      title: 'So cozy, my pet won\'t leave it',
      body: `${petName} claimed this bed on day one and now refuses to sleep anywhere else. The material is incredibly soft and the filling hasn't flattened at all. Machine washable is a huge plus. Worth every penny!`,
    }
  }
  if (n.includes('bowl') || n.includes('feeder') || n.includes('water') || n.includes('fountain') || n.includes('dish')) {
    return {
      title: 'Great quality, no more messes',
      body: `Heavy enough that ${petName} can't push it around the floor anymore. Love the non-slip base and the size is perfect. Easy to clean and looks great in our kitchen too. Highly recommend!`,
    }
  }
  if (n.includes('collar') || n.includes('leash') || n.includes('harness') || n.includes('lead')) {
    return {
      title: 'Perfect fit and beautiful design',
      body: `The quality of this is outstanding — stitching is solid and the hardware feels premium. ${petName} seems comfortable wearing it and we get compliments on walks all the time. Will definitely buy more colors!`,
    }
  }
  if (n.includes('treat') || n.includes('snack') || n.includes('food') || n.includes('bone') || n.includes('biscuit')) {
    return {
      title: 'Can\'t get enough!',
      body: `${petName} goes absolutely wild for these. I love that the ingredients are all natural and I can actually recognize everything on the label. Great for training rewards too. Already ordered a second bag!`,
    }
  }
  if (n.includes('shampoo') || n.includes('brush') || n.includes('groom') || n.includes('nail') || n.includes('bath') || n.includes('comb')) {
    return {
      title: 'Grooming made easy',
      body: `This has made our grooming routine so much smoother. ${petName} used to hate bath time but now actually stays calm. The quality is top-notch and it leaves the coat so soft and shiny. A must-have!`,
    }
  }
  if (n.includes('carrier') || n.includes('travel') || n.includes('backpack') || n.includes('crate') || n.includes('bag')) {
    return {
      title: 'Perfect for adventures',
      body: `Took ${petName} on a road trip with this and it was a game-changer. Super sturdy, great ventilation, and my ${pet} actually seems to enjoy being in it. The extra pockets are really convenient too!`,
    }
  }
  if (n.includes('sweater') || n.includes('jacket') || n.includes('coat') || n.includes('hoodie') || n.includes('outfit') || n.includes('costume') || n.includes('bandana') || n.includes('clothes')) {
    return {
      title: 'Adorable and well-made',
      body: `${petName} looks absolutely precious in this! The material is comfortable and stretchy so it doesn't restrict movement. Easy to put on and take off, which is a big deal. We've gotten so many compliments!`,
    }
  }
  if (n.includes('scratch') || n.includes('tower') || n.includes('tree') || n.includes('post') || n.includes('climber')) {
    return {
      title: 'My cat is obsessed',
      body: `${petName} started using this within minutes of assembly. It's incredibly sturdy — no wobbling at all even when she jumps on it full speed. The sisal rope is thick and durable. Saved our furniture!`,
    }
  }
  if (n.includes('litter') || n.includes('scoop')) {
    return {
      title: 'Works perfectly',
      body: `Great quality and exactly what we needed. ${petName} took to it right away with no issues. Easy to maintain and keeps things clean. Very happy with this purchase!`,
    }
  }
  // Default generic review
  return {
    title: 'Excellent quality, highly recommend',
    body: `${petName} absolutely loves this! The quality exceeded my expectations — you can tell it's made with care. Eco-friendly materials are a huge bonus for me. Already recommended it to all my ${pet}-owner friends. Will be ordering more from PawLL!`,
  }
}

async function main() {
  // Find or create a review user
  let user = await prisma.user.findFirst({ where: { email: 'reviewer@pawllpet.com' } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'reviewer@pawllpet.com',
        fullName: 'Happy Pet Parent',
        username: 'happypetparent',
        role: 'user',
        emailVerified: true,
      },
    })
    console.log('Created review user:', user.id)
  }

  // Get all live products
  const products = await prisma.product.findMany({
    where: { status: 'live' },
    select: { id: true, name: true, slug: true, petType: true, rating: true },
  })

  console.log(`Found ${products.length} live products`)

  let created = 0
  let skipped = 0

  for (const product of products) {
    const review = generateReview(product.name, product.petType)

    try {
      await prisma.review.upsert({
        where: { productId_userId: { productId: product.id, userId: user.id } },
        update: { rating: 5, title: review.title, body: review.body },
        create: {
          productId: product.id,
          userId: user.id,
          rating: 5,
          title: review.title,
          body: review.body,
        },
      })

      // Update product average rating
      const agg = await prisma.review.aggregate({
        where: { productId: product.id },
        _avg: { rating: true },
      })
      await prisma.product.update({
        where: { id: product.id },
        data: { rating: agg._avg.rating || 5 },
      })

      console.log(`✓ ${product.name} — "${review.title}"`)
      created++
    } catch (e: any) {
      console.error(`✗ ${product.name}: ${e.message}`)
      skipped++
    }
  }

  console.log(`\nDone! Created/updated ${created} reviews, skipped ${skipped}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
