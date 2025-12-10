import type { GenerateSWOptions, RuntimeCaching } from 'workbox-build'

const runtimeCaching: RuntimeCaching[] = [
  {
    urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'google-fonts-cache',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
  {
    urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'gstatic-fonts-cache',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
]

export const workbox: Partial<GenerateSWOptions> = {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
  globIgnores: ['**/assets/view-lazy-*.js'],
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching,
}
