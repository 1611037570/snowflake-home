import { registerSW } from 'virtual:pwa-register'

export const registerPWA = () => {
  registerSW({ immediate: true })
}
