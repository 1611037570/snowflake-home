// 自定义组件解析器
import type { ComponentResolver } from 'unplugin-vue-components'
function firstCharToLower(str: string): string {
  // 处理空字符串或长度为0的情况
  if (!str || str.length === 0) return str
  // 第一个字符转小写 + 剩余字符（从索引1开始截取）
  return str.charAt(0).toLowerCase() + str.slice(1)
}
export const SnowFlakeComponentResolver = (): ComponentResolver => {
  return (componentName: string) => {
    if (componentName.startsWith('Sf')) {
      const name = componentName
      const path = `@components/${firstCharToLower(name.slice(2))}/index.vue`
      return {
        // importName: name,
        path,
        name,
        from: path,
      }
    }
  }
}
