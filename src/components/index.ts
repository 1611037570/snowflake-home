// 自定义组件解析器
import type { ComponentResolver } from 'unplugin-vue-components'
import { defineAsyncComponent, type App } from 'vue'

export const globalComponentInstaller = {
  install(app: App) {
    // 1、获取当前路径下所有文件中的index.vue
    const components = import.meta.glob('./base/*/index.vue')

    // 2、遍历组件模块
    for (const [path, fn] of Object.entries(components) as any) {
      const name = path.replace('./', '').split('/')[1]
      const componentName = 'Sf' + name.charAt(0).toUpperCase() + name.slice(1)
      // 3、进行注册
      app.component(componentName, defineAsyncComponent(fn))
    }
  },
}

const baseMap = ['icon', 'footer']
export const dynamicComponentResolver = (): ComponentResolver => {
  return (componentName: string) => {
    function isBaseComponent(name: string) {
      return baseMap.includes(name.slice(2).toLowerCase())
    }
    if (componentName.startsWith('Sf') && !isBaseComponent(componentName)) {
      const name = componentName.slice(2)
      const path = `@components/business/${name.charAt(0).toLowerCase() + name.slice(1)}/index.vue`
      return {
        // importName: name,
        path,
        name: componentName,
        from: path,
      }
    }
  }
}
