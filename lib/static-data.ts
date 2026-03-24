// Static data that can be safely imported in client components
// (separated from lib/products.ts which imports Prisma)

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
