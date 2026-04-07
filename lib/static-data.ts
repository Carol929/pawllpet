// Static data that can be safely imported in client components
// (separated from lib/products.ts which imports Prisma)

export const collections = [
  { slug: 'spring-social-club', title: 'Spring Social Club', titleZh: '春日社交俱乐部', description: 'Fresh launch styles for walks and playdates.', descriptionZh: '散步和玩耍的新款时尚单品。' },
  { slug: 'cozy-evenings', title: 'Cozy Evenings', titleZh: '温馨夜晚', description: 'Soft textures and calming routines for nighttime.', descriptionZh: '柔软材质，打造宁静的夜间时光。' },
  { slug: 'weekend-travel-kit', title: 'Weekend Travel Kit', titleZh: '周末出行套装', description: 'Portable essentials for pets on the move.', descriptionZh: '为爱宠出行准备的便携必备品。' },
]

export const blogPosts = [
  { slug: 'building-a-pet-routine', title: 'Build a Better Pet Routine in 15 Minutes', excerpt: 'Simple rituals to improve calm, health, and joy.' },
  { slug: 'choosing-safe-materials', title: 'How We Vet Pet-Safe Materials', excerpt: 'Our sourcing checklist for modern pet homes.' },
  { slug: 'cat-enrichment-playbook', title: 'Cat Enrichment Playbook', excerpt: 'A practical guide to daily feline stimulation.' },
]
