type Path = string | string[]
// 定义数据代理选项类型
interface DataProxyOption {
  source: Path
  prop: string
}

// 创建一个类
class DataProxy<T> {
  private modelValue: any
  private emit: (event: string, value: any, ...args: any[]) => void

  // 确保数据为数组格式
  private ensureArray<V>(val: V | V[]): V[] {
    return Array.isArray(val) ? val : [val]
  }

  // 通用的数据代理辅助方法
  private createDataProxyHelper(
    options: DataProxyOption | DataProxyOption[],
    callback: any,
    name: string = '',
  ) {
    const result: any = {}
    const optionsArray = this.ensureArray(options)
    for (const item of optionsArray) {
      result[name + item.prop] = callback(item)
    }
    return result
  }
  private select(options: { source: Path; value?: any; index?: number }): any {
    const { source, value, index = 0 } = options
    const keyPath = this.ensureArray(source)
    // 获取响应式数据的实际值
    const dataValue = this.modelValue.value || this.modelValue
    let current: any = dataValue

    const lastIndex = keyPath.length - 1
    for (let i = 0; i < lastIndex; i++) {
      const key: any = source[i]

      // 移动到下一级
      if (key == '?') {
        current = current[index] ?? (current[index] = {})
        continue
      }

      if (current[key] != undefined) {
        current = current[key]
        continue
      }
      const nextKey = source[i + 1]
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
    const optionsArray: any = this.ensureArray(options)
    const source = optionsArray[0].source
    const index = source.indexOf('?')
    return source.slice(0, index)
  }
  move(path: any, oldIndex: number, newIndex: number) {
    const currentPath = this.getPath(path[oldIndex].model)
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
  // 删除数组元素
  removeItem(payload: any, index: number) {
    const currentPath = this.getPath(payload[index].model)
    if (!currentPath) return

    let current = this.data
    for (const key of currentPath) {
      current = current[key]
    }

    current.splice(index, 1)
  }
  // 删除对象元素
  removeObject(payload: any) {
    // 标准化路径：统一转为 路径对象数组，精简冗余变量
    const pathItems = this.ensureArray(payload.model)
    // 提取所有待删除的路径数组（如 [['a','b'], ['c','d']]）
    const deletePaths = pathItems.map((item: any) => item.source)

    if (!deletePaths) return
    // 遍历所有待删除的路径数组
    for (const source of deletePaths) {
      let target = this.data
      for (let i = 0; i < source.length; i++) {
        if (source.length - 1 == i) {
          // 删除最后一级属性
          delete target[source[i]]
          break
        } else {
          target = target[source[i]]
        }
      }
    }
  }
  constructor(data: any, emit: any) {
    // 初始化数据为空对象
    if (!data || typeof data !== 'object') data = {}
    this.modelValue = data
    this.emit = emit
  }

  // 获取数据代理
  getDataProxy(options: DataProxyOption | DataProxyOption[], index: number = 0) {
    return this.createDataProxyHelper(options, (item: DataProxyOption) =>
      this.select({ source: item.source, index }),
    )
  }

  // 设置数据代理
  setDataProxy(options: DataProxyOption | DataProxyOption[], index: number) {
    const result: any = {}
    const optionsArray = this.ensureArray(options)
    for (const item of optionsArray) {
      result['update:' + item.prop] = (newValue: T) => {
        this.select({ source: item.source, value: newValue, index })
      }
    }
    return result
  }

  setEventProxy(options: DataProxyOption | DataProxyOption[]) {
    return this.createDataProxyHelper(options, (item: DataProxyOption) => {
      return (newValue: T, ...args: T[]) => this.emit(item.prop, newValue, ...args)
    })
  }

  // 获取当前数据
  get data() {
    return this.modelValue.value || this.modelValue
  }
}
export default DataProxy
