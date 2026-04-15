// 导入 Vue 应用创建函数
import { createApp } from 'vue'
// 导入 Pinia 状态管理
import pinia from './stores'
// 导入 i18n 配置
import i18n from './locales'
// 导入根组件
import App from './App.vue'
// 导入路由配置
import router from './routers'
// 导入全局样式
import './styles/index.scss'
// 导入 Tailwind CSS 样式
import './styles/tailwind.css'
// 导入全局组件安装器
import { globalComponentInstaller } from './components'
// 导入默认事件加载器
import { loadEvent, loadTheme } from './utils'
// 创建 Vue 应用实例
const app = createApp(App)

// 注册 i18n 插件
app.use(i18n)
// 注册 Pinia 状态管理
app.use(pinia)
// 注册路由
app.use(router)
// 加载主题
loadTheme()
// 加载默认事件
loadEvent()

// 注册全局函数 $s 和 $bus
import { $s, eventBus } from './utils'
app.config.globalProperties.$s = $s
app.config.globalProperties.$bus = eventBus

// 注册全局组件安装器
app.use(globalComponentInstaller)
// 挂载应用到 DOM
app.mount('#app')

// import { registerPWA } from './utils'
// // 注册 PWA
// registerPWA()
