// 导入 Pinia 状态管理
import { createPinia } from "pinia";
// 导入 Pinia 持久化插件
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

// 创建 Pinia 实例
const pinia = createPinia();
// 注册持久化插件
pinia.use(piniaPluginPersistedstate);

// 单独导出实例：应用入口只依赖实例本身，
// 避免注册应用时连带加载 stores/index.ts 中的全部业务 store
export default pinia;
