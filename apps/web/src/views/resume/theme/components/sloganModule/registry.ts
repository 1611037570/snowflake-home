import DefaultSlogan from "./themes/default.vue";

// 用户标语始终渲染真实字段，主题装饰通过独立页面装饰入口处理。
export const resolveSloganComponent = () => DefaultSlogan;
