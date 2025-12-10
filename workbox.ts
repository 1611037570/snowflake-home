// Workbox 配置
export const workboxConfig: any = {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'], // 打包后资源匹配
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i, // Google Fonts 样式
      handler: 'CacheFirst', // 缓存优先
      options: {
        cacheName: 'google-fonts-cache', // 缓存名
        expiration: {
          maxEntries: 10, // 最大条目
          maxAgeSeconds: 60 * 60 * 24 * 365, // 365天
        },
        cacheableResponse: {
          statuses: [0, 200], // 可缓存状态
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i, // Google Fonts 字体
      handler: 'CacheFirst', // 缓存优先
      options: {
        cacheName: 'gstatic-fonts-cache', // 缓存名
        expiration: {
          maxEntries: 10, // 最大条目
          maxAgeSeconds: 60 * 60 * 24 * 365, // 365天
        },
        cacheableResponse: {
          statuses: [0, 200], // 可缓存状态
        },
      },
    },
  ],
}
