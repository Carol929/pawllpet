// Static data that can be safely imported in client components
// (separated from lib/products.ts which imports Prisma)

export const collections = [
  { slug: 'spring-social-club', title: 'Spring Social Club', titleZh: '春日社交俱乐部', description: 'Fresh launch styles for walks and playdates.', descriptionZh: '散步和玩耍的新款时尚单品。' },
  { slug: 'cozy-evenings', title: 'Cozy Evenings', titleZh: '温馨夜晚', description: 'Soft textures and calming routines for nighttime.', descriptionZh: '柔软材质，打造宁静的夜间时光。' },
  { slug: 'weekend-travel-kit', title: 'Weekend Travel Kit', titleZh: '周末出行套装', description: 'Portable essentials for pets on the move.', descriptionZh: '为爱宠出行准备的便携必备品。' },
]

export const blogPosts = [
  { slug: 'building-a-pet-routine', title: 'Build a Better Pet Routine in 15 Minutes', excerpt: 'The 5-5-5 framework: three small daily rituals that lower stress, curb destructive habits, and fit inside a busy schedule.', date: '2026-08-12' },
  { slug: 'choosing-safe-materials', title: 'How We Vet Pet-Safe Materials', excerpt: 'Pet toys are less regulated than children’s toys. The exact sourcing checklist we run before a product earns a PawLL listing.', date: '2026-07-28' },
  { slug: 'cat-enrichment-playbook', title: 'Cat Enrichment Playbook', excerpt: 'Rebuild the hunt indoors in twenty minutes a day: scheduled play, puzzle feeding, vertical territory, and scent rotation.', date: '2026-08-20' },
]
