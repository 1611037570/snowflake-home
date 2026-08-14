import { VitePWA } from 'vite-plugin-pwa'
import { manifestConfig } from './manifest'
import { workboxConfig } from './workbox'

export const pwaPlugin = () =>
  VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'logo.svg'],
    manifest: manifestConfig,
    // workbox: workboxConfig,
  })
