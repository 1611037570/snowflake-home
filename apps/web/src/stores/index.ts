// 导入 Pinia 状态管理
import { createPinia } from "pinia";
// 导入 Pinia 持久化插件
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

// 创建 Pinia 实例
const pinia = createPinia();
// 注册持久化插件
pinia.use(piniaPluginPersistedstate);
// 导出 Pinia 实例
export default pinia;

// 系统相关store
export * from "./modules/system";

// 游戏相关store
export * from "./modules/game";

// 主页相关store
export * from "./modules/home";

// 简历相关store
export * from "./modules/resume";

// 缓存相关store
export * from "./modules/cache";

// 弹窗相关store
export * from "./modules/modal";

// 主题相关store
export * from "./modules/theme";

// 便签相关store
export * from "./modules/note";

// 用户相关store
export * from "./modules/user";
// 密码相关store
export * from "./modules/password";

// 智能助手相关store
export * from "./modules/ai";

// 简历统计相关store
export * from "./modules/resumeStatistics";
