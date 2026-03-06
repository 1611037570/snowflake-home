type Path = string | string[]
// 定义数据代理选项类型
interface DataProxyOption {
  /**
   * 数据键路径
   */
  path: Path

  /**
   * 属性名称
   */
  key: string
}

// 创建一个类
class DataProxy<T> {
  private modelValue: any
  private emit: (event: string, value: any, ...args: any[]) => void

  // 通用的数据代理辅助方法
  private createDataProxyHelper(
    options: DataProxyOption | DataProxyOption[],
    callback: any,
    name: string = '',
  ) {
    const result: any = {}
    const optionsArray = Array.isArray(options) ? options : [options]
    for (const item of optionsArray) {
      result[name + item.key] = callback(item)
    }
    return result
  }
  private select(options: { path: Path; value?: any; index?: number }): any {
    const { path, value, index = 0 } = options
    const keyPath = Array.isArray(path) ? path : [path]
    // 获取响应式数据的实际值
    const dataValue = this.modelValue.value || this.modelValue
    let current: any = dataValue

    const lastIndex = keyPath.length - 1
    for (let i = 0; i < lastIndex; i++) {
      const key: any = path[i]

      // 移动到下一级
      if (key == '?') {
        current = current[index] ?? (current[index] = {})
        continue
      }

      if (current[key] != undefined) {
        current = current[key]
        continue
      }
      const nextKey = path[i + 1]
      current[key] = nextKey === '?' ? [] : {}
      current = current[key]
    }

    // 最后一个键
    const lastKey: any = keyPath[lastIndex]

    // 当前key不存在
    if (!current.hasOwnProperty(lastKey)) {
      current[lastKey] = ''
    }
    // 设置值（如果有）
    if (options.hasOwnProperty('value')) {
      current[lastKey] = value
    }
    return current[lastKey]
  }
  // 获取数组路径（截取 '?' 之前的部分）
  getPath(options: DataProxyOption | DataProxyOption[] /* 数据配置 */) {
    const optionsArray: any = Array.isArray(options) ? options : [options]
    const path = optionsArray[0].path
    const index = path.indexOf('?')
    return path.slice(0, index)
  }
  move(path: any, oldIndex: number, newIndex: number) {
    const currentPath = this.getPath(path[oldIndex].data)
    if (!currentPath) return

    let current = this.data
    for (const key of currentPath) {
      if (current && current[key] !== undefined) {
        current = current[key]
      } else {
        return
      }
    }

    if (Array.isArray(current)) {
      const [removed] = current.splice(oldIndex, 1)
      current.splice(newIndex, 0, removed)
    }
  }

  remove(path: any, index: number) {
    const currentPath = this.getPath(path[index].data)
    if (!currentPath) return

    let current = this.data
    for (const key of currentPath) {
      current = current[key]
    }

    current.splice(index, 1)
  }
  constructor(data: any, emit: any) {
    this.modelValue = data
    this.emit = emit
  }

  // 获取数据代理
  getDataProxy(options: DataProxyOption | DataProxyOption[], index: number = 0) {
    return this.createDataProxyHelper(options, (item: DataProxyOption) =>
      this.select({ path: item.path, index }),
    )
  }

  // 设置数据代理
  setDataProxy(options: DataProxyOption | DataProxyOption[], index: number) {
    const result: any = {}
    const optionsArray = Array.isArray(options) ? options : [options]
    for (const item of optionsArray) {
      result['update:' + item.key] = (newValue: T) => {
        this.select({ path: item.path, value: newValue, index })
      }
    }
    return result
  }

  setEventProxy(options: DataProxyOption | DataProxyOption[]) {
    return this.createDataProxyHelper(options, (item: DataProxyOption) => {
      return (newValue: T, ...args: T[]) => this.emit(item.key, newValue, ...args)
    })
  }

  // 获取当前数据
  get data() {
    return this.modelValue.value || this.modelValue
  }
}
export default DataProxy
