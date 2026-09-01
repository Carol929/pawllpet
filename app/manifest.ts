import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PawLL Pet',
    short_name: 'PawLL',
    description: 'Premium pet supplies for dogs and cats',
    start_url: '/',
    display: 'standalone',
    background_color: '#fffdf8',
    theme_color: '#1f2e44',
    icons: [{ src: '/icon.png', sizes: '512x512', type: 'image/png' }],
  }
}
