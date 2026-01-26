/**
 * 组件注册器
 * 其实一个动态注册就够用啦
 * 写全局和动态是为了学习记录使用的~
 */
import fs from 'fs'
import path from 'path'
import type { ComponentResolver } from 'unplugin-vue-components'
import { defineAsyncComponent, type App } from 'vue'
// 通过import.meta.glob获取基础组件
function getGlobalBaseComponent() {
  const Components = Object.entries(import.meta.glob('./base/*/index.vue'))
  const list = Components.map(([path, fn]) => {
    return {
      fn,
      name: path.replace('./', '').split('/')[1],
    }
  })
  return list
}
export const globalComponentInstaller = {
  install(app: App) {
    const baseList: any = getGlobalBaseComponent()
    for (const { name, fn } of baseList) {
      const componentName = 'Sf' + name.charAt(0).toUpperCase() + name.slice(1)
      app.component(componentName, defineAsyncComponent(fn))
    }
  },
}
// 通过fs获取基础组件
function getDynamicBaseComponent() {
  const baseDir = path.join(__dirname, 'base')
  const entries = fs.readdirSync(baseDir, { withFileTypes: true })
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
}

export const dynamicComponentResolver = (): ComponentResolver => {
  return (componentName: string) => {
    const baseMap = getDynamicBaseComponent()

    const name = componentName.slice(2).replace(/^./, (c) => c.toLowerCase())
    function isBaseComponent(name: string) {
      return baseMap.includes(name.toLowerCase())
    }
    if (isBaseComponent(name)) {
      return
    }
    if (componentName.startsWith('Sf')) {
      const path = `@components/business/${name}/index.vue`
      return {
        // importName: name,
        path,
        name: componentName,
        from: path,
      }
    }
  }
}
