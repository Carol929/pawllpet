export type Product = {
  id: string
  slug: string
  name: string
  category: string
  petType: 'Dog' | 'Cat' | 'Both'
  price: number
  rating: number
  isNew: boolean
  isBestSeller: boolean
  isDrop: boolean
  isBundle: boolean
  image: string
  description: string
}

export const categories = [
  'toys', 'accessories', 'beds', 'bowls',
]

const adjectives = ['Cloud', 'Luna', 'Pebble', 'Sunny', 'Maple', 'Cozy']
const nouns = ['Chew Ring', 'Snuffle Mat', 'Travel Bowl', 'Rain Cape', 'Calming Bed', 'Adventure Harness']

export const products: Product[] = Array.from({ length: 36 }, (_, i) => {
  const adjective = adjectives[i % adjectives.length]
  const noun = nouns[i % nouns.length]
  const category = categories[i % categories.length]
  return {
    id: `prod_${i + 1}`,
    slug: `pawll-${category}-${i + 1}`,
    name: `${adjective} ${noun}`,
    category,
    petType: i % 3 === 0 ? 'Dog' : i % 3 === 1 ? 'Cat' : 'Both',
    price: 14 + (i % 8) * 6,
    rating: Number((4 + (i % 10) * 0.09).toFixed(1)),
    isNew: i < 12,
    isBestSeller: i % 4 === 0,
    isDrop: i % 7 === 0,
    isBundle: i % 6 === 0,
    image: '/product-placeholder.svg',
    description: `Premium ${category.replace('-', ' ')} pick engineered for comfort, durability, and pet-safe use.`,
  }
})

export const collections = [
  { slug: 'spring-social-club', title: 'Spring Social Club', description: 'Fresh launch styles for walks and playdates.' },
  { slug: 'cozy-evenings', title: 'Cozy Evenings', description: 'Soft textures and calming routines for nighttime.' },
  { slug: 'weekend-travel-kit', title: 'Weekend Travel Kit', description: 'Portable essentials for pets on the move.' },
]

export const blogPosts = [
  { slug: 'building-a-pet-routine', title: 'Build a Better Pet Routine in 15 Minutes', excerpt: 'Simple rituals to improve calm, health, and joy.' },
  { slug: 'choosing-safe-materials', title: 'How We Vet Pet-Safe Materials', excerpt: 'Our sourcing checklist for modern pet homes.' },
  { slug: 'cat-enrichment-playbook', title: 'Cat Enrichment Playbook', excerpt: 'A practical guide to daily feline stimulation.' },
]
