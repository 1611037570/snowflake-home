import DynamicForm from "./dynamicForm.vue";

// 组件出口：由 unplugin-vue-components 按 business/*/index.ts 解析 SfDynamicForm 使用
// 契约类型与公共能力统一放在 ./api，避免纯逻辑场景加载组件依赖
export default DynamicForm;
