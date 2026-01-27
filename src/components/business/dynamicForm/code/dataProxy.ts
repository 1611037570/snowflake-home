type Keys = string | string[]
// 定义数据代理选项类型
interface DataProxyOption {
  /**
   * 数据键路径
   */
  key: Keys

  /**
   * 属性名称
   */
  name: string
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
      result[name + item.name] = callback(item)
    }
    return result
  }
  private select(options: { keys: Keys; value?: any; index?: number }): any {
    const { keys, value, index = 0 } = options
    const keyPath = Array.isArray(keys) ? keys : [keys]
    // 获取响应式数据的实际值
    const dataValue = this.modelValue.value || this.modelValue
    let current: any = dataValue

    const lastIndex = keyPath.length - 1
    for (let i = 0; i < lastIndex; i++) {
      const key: any = keys[i]

      // 移动到下一级
      if (key == '?') {
        current = current[index] ?? (current[index] = {})
        continue
      }

      if (current[key] != undefined) {
        current = current[key]
        continue
      }
      const nextKey = keys[i + 1]
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
      // 如果是响应式数据，确保更新会触发响应
      if (this.modelValue.value !== undefined) {
        // 触发响应式更新
        this.modelValue.value = { ...dataValue }
      }
    }
    return current[lastKey]
  }

  constructor(data: any, emit: any) {
    this.modelValue = data
    this.emit = emit
  }

  // 获取数据代理
  getDataProxy(options: DataProxyOption | DataProxyOption[]) {
    return this.createDataProxyHelper(options, (item: DataProxyOption) =>
      this.select({ keys: item.key }),
    )
  }

  // 设置数据代理
  setDataProxy(options: DataProxyOption | DataProxyOption[]) {
    const result: any = {}
    const optionsArray = Array.isArray(options) ? options : [options]
    for (const item of optionsArray) {
      result['update:' + item.name] = (newValue: T, index?: number) => {
        this.select({ keys: item.key, value: newValue, index })
      }
    }
    return result
  }

  setEventProxy(options: DataProxyOption | DataProxyOption[]) {
    return this.createDataProxyHelper(options, (item: DataProxyOption) => {
      return (newValue: T, ...args: T[]) => this.emit(item.name, newValue, ...args)
    })
  }

  // 获取当前数据
  get data() {
    return this.modelValue.value || this.modelValue
  }
}
export default DataProxy
