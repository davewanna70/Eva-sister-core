export default function manifest() {
  return {
    name: 'EVA',
    short_name: 'EVA',
    id: '/',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
