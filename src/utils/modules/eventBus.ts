import mitt from 'mitt'

/**
 * 全局事件总线实例
 * 用于在非父子组件间通信
 */
const eventBus = mitt()

export default eventBus
