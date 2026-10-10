// Pinia 实例已独立为 ./pinia：应用入口只引用实例本身，
// 避免启动阶段把下方所有业务 store 一起打进首屏包
export { default } from "./pinia";
// 业务 store 按需引入，页面请直接引用具体模块路径（如 @/stores/modules/system）

// 系统相关store
export * from "./modules/system";

// 主页相关store
export * from "./modules/home";

// 简历相关store
export * from "./modules/resume";

// 缓存相关store
export * from "./modules/cache";

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
