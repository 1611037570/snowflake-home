/// <reference types="vite/client" />
declare module '*.vue' {
  import { ComponentOptions } from 'vue'
  const componentOptions: ComponentOptions

  export default componentOptions
}

// 声明 awebp（动画 webp）图片模块类型
declare module '*.awebp' {
  const src: string
  export default src
}
