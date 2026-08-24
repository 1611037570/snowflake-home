import { getComponentLoader } from "@/components";
import { defineAsyncComponent, type Component } from "vue";

type ComponentLoader = () => Promise<any>;

export class ComponentRegistry {
  private static instance: ComponentRegistry;
  private globalComponents: Map<string, Component> = new Map();
  private asyncComponents: Map<string, Component> = new Map();
  // 按需加载缓存：首次按名加载后复用，避免重复包装
  private lazyComponents: Map<string, Component> = new Map();

  private constructor() {}

  static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }

  /**
   * 注册全局组件
   * @param name 组件名称
   * @param component 组件实例
   */
  register(name: string, component: Component) {
    this.globalComponents.set(name, component);
  }

  /**
   * 注册异步组件
   * @param name 组件名称
   * @param loader 组件加载函数 () => import('...')
   */
  registerAsync(name: string, loader: ComponentLoader) {
    const asyncComp = defineAsyncComponent(loader);
    this.asyncComponents.set(name, asyncComp);
  }

  /**
   * 获取组件
   * 优先级: 局部注入 > 注册中心(同步) > 注册中心(异步) > 全局扫描(旧版)
   * @param name 组件名称
   * @param localComponents 局部注入的组件字典
   */
  get(name: string, localComponents?: Record<string, any>): Component | null {
    if (!name) return null;

    // 1. 局部注册 (Instance Level)
    if (localComponents && localComponents[name]) {
      return localComponents[name];
    }

    // 2. 注册中心 - 同步组件
    if (this.globalComponents.has(name)) {
      return this.globalComponents.get(name)!;
    }

    // 3. 注册中心 - 异步组件
    if (this.asyncComponents.has(name)) {
      return this.asyncComponents.get(name)!;
    }

    // 4. 按需加载：命中目录约定（base/business/el/<name>）才加载并缓存
    const cached = this.lazyComponents.get(name);
    if (cached) {
      return cached;
    }
    const loader = getComponentLoader(name);
    if (loader) {
      const asyncComp = defineAsyncComponent(loader);
      this.lazyComponents.set(name, asyncComp);
      return asyncComp;
    }

    console.warn(`[DynamicForm] Component "${name}" not found in registry or global scope.`);
    return null;
  }
}

export const componentRegistry = ComponentRegistry.getInstance();
