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
  private data: Record<string, T>
  private emit: (event: string, value: T, ...args: T[]) => void

  private getDataCallback: (item: DataProxyOption) => T
  private setDataCallback: (item: DataProxyOption) => (newValue: T) => void
  private setEventCallback: (item: DataProxyOption) => (newValue: T, ...args: T[]) => void

  private handleGetData(item: DataProxyOption) {
    return this.getData(item.key)
  }
  private handleSetData<T>(item: DataProxyOption) {
    return (newValue: T, index?: number) => this.setData(item.key, newValue, index)
  }
  private handleSetEvent(item: DataProxyOption) {
    return (newValue: T, ...args: T[]) => this.emit(item.name, newValue, ...args)
  }

  // 通用的数据代理辅助方法
  private createDataProxyHelper(
    options: DataProxyOption | DataProxyOption[],
    callback: any,
    name: string = '',
  ) {
    const result: any = Object.create(null)
    const optionsArray = Array.isArray(options) ? options : [options]
    for (const item of optionsArray) {
      result[name + item.name] = callback(item)
    }
    return result
  }
  private select(options: { keys: Keys; value?: any; index?: number }): any {
    const { keys, value = undefined, index = 0 } = options

    const keysLength = keys.length
    let current: any = this.data
    for (let i = 0; i < keysLength; i++) {
      const key: any = keys[i]

      // 最后一个键
      if (i === keysLength - 1) {
        // 设置值（如果有）
        if (value !== undefined) {
          current[key] = value
        } else if (!current.hasOwnProperty(key)) {
          current[key] = ''
        }
        return current[key]
      }
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
  }

  constructor(data: any, emit: any) {
    this.data = data
    this.emit = emit

    // 绑定this
    this.getDataCallback = this.handleGetData.bind(this)
    this.setDataCallback = this.handleSetData.bind(this)
    this.setEventCallback = this.handleSetEvent.bind(this)
  }
  // 获取数据
  getData(keys: Keys) {
    return this.select({ keys })
  }

  // 获取数据代理
  getDataProxy(options: DataProxyOption | DataProxyOption[]) {
    return this.createDataProxyHelper(options, this.getDataCallback)
  }

  // 设置数据
  setData(keys: Keys, value: any, index?: number) {
    this.select({ keys, value, index })
  }

  // 设置数据代理
  setDataProxy(options: DataProxyOption | DataProxyOption[]) {
    return this.createDataProxyHelper(options, this.setDataCallback, 'update:')
  }

  setEventProxy(options: DataProxyOption | DataProxyOption[]) {
    return this.createDataProxyHelper(options, this.setEventCallback)
  }
}
export default DataProxy
