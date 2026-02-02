/**
 * 组件注册器
 * 其实一个动态注册就够用啦
 * 写全局和动态是为了学习记录使用的~
 */
import fs from 'fs'
import path from 'path'
import type { ComponentResolver } from 'unplugin-vue-components'
import { defineAsyncComponent, type App } from 'vue'

export function getAllBaseComponent() {
  const baseComponent: any = import.meta.glob('./base/*/index.ts', { eager: true })
  const list = Object.entries(baseComponent)
  const components: any = {}
  list.forEach(([path, fn]) => {
    const name: any = path.replace('./', '').split('/')[1]
    components[name] = {
      component: fn.default,
      name,
    }
  })
  return {
    length: list.length,
    components,
  }
}

// 所有业务组件
export const getAllBusinessComponent = () => {
  const businessComponent = import.meta.glob('./business/*/index.ts', { eager: false })
  const elComponent = import.meta.glob('./el/*/index.ts', { eager: false })
  const components: any = {}
  const list = Object.entries({ ...businessComponent, ...elComponent })
  list.forEach(([path, fn]) => {
    const name: any = path.replace('./', '').split('/')[1]
    components[name] = {
      component: defineAsyncComponent(fn),
      name,
    }
  })

  return {
    length: list.length,
    components,
  }
}
export const globalComponentInstaller = {
  install(app: App) {
    const { components }: any = getAllBaseComponent()
    for (const { name, component } of Object.values(components)) {
      const componentName = 'Sf' + name.charAt(0).toUpperCase() + name.slice(1)
      app.component(componentName, component)
    }
  },
}
// 通过fs获取基础组件
function getDynamicBaseComponent() {
  const baseDir = path.join(__dirname, 'base')
  const entries = fs.readdirSync(baseDir, { withFileTypes: true })
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
}
function getElComponent() {
  const baseDir = path.join(__dirname, 'el')
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
    if (!componentName.startsWith('Sf')) {
      return
    }
    const elMap = getElComponent()
    const fileName = elMap.includes(name) ? 'el' : 'business'
    const path = `@components/${fileName}/${name}/index.ts`
    return {
      // importName: name,
      path,
      name: componentName,
      from: path,
    }
  }
}
