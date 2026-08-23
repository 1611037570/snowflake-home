import { inject } from "vue";
import { INSTANCE_COMPONENTS } from "./injectionKeys";
import { componentRegistry } from "./componentRegistry";

export { componentRegistry };

/**
 * 获取组件定义 (支持实例级别注入)
 * 统一通过 ComponentRegistry 进行查找
 */
export const getComponent = (name: string) => {
  if (!name) return;

  // 1. 优先从实例注入的组件库中查找 (SfDynamicForm 传入的 components prop)
  const instanceComponents = inject<Record<string, any>>(INSTANCE_COMPONENTS, {});

  // 2. 委托给注册中心统一查找
  return componentRegistry.get(name, instanceComponents);
};
