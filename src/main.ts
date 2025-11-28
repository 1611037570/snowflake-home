// 导入 Pinia 状态管理
import { createPinia } from 'pinia'
// 导入 Pinia 持久化插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
// 导入 Vue 应用创建函数
import { createApp } from 'vue'
// 导入 i18n 配置
import i18n from './locales'

// 导入根组件
import App from './App.vue'
// 导入路由配置
import router from './routers'
// 导入全局样式
import './styles/index.scss'
import './styles/tailwind.css'

// 导入全局组件安装器
import { globalComponentInstaller } from './components/index'

// 创建 Vue 应用实例
const app = createApp(App)
// 注册全局组件安装器
app.use(globalComponentInstaller)
// 注册 i18n 插件
app.use(i18n)
// 创建 Pinia 实例
const pinia = createPinia()

// 注册持久化插件
pinia.use(piniaPluginPersistedstate)

// 注册 Pinia 状态管理
app.use(pinia)
// 注册路由
app.use(router)

// 挂载应用到 DOM
app.mount('#app')
