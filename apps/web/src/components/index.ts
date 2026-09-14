/**
 * 组件注册器
 * 其实一个动态注册就够用啦
 * 提供全局注册与动态加载能力~
 */
import { defineAsyncComponent, type App } from "vue";

export function getAllBaseComponent() {
  const baseComponent: any = import.meta.glob("./base/*/index.ts", { eager: true });
  const list = Object.entries(baseComponent);
  const components: any = {};
  list.forEach(([path, fn]: any) => {
    const name: any = path.replace("./", "").split("/")[1];
    components[name] = {
      component: fn.default,
      name,
    };
  });
  return {
    length: list.length,
    components,
  };
}

// 所有业务组件
export const getAllBusinessComponent = () => {
  const businessComponent = import.meta.glob("./business/*/index.ts", { eager: false });
  const components: any = {};
  const list = Object.entries(businessComponent);
  list.forEach(([path, fn]: any) => {
    const name: any = path.replace("./", "").split("/")[1];
    components[name] = {
      component: defineAsyncComponent(fn),
      name,
    };
  });

  return {
    length: list.length,
    components,
  };
};

export const getAllElComponent = () => {
  const elComponent = import.meta.glob("./el/*/index.ts", { eager: false });
  const components: any = {};
  const list = Object.entries(elComponent);
  list.forEach(([path, fn]: any) => {
    const name: any = path.replace("./", "").split("/")[1];
    components[name] = {
      component: defineAsyncComponent(fn),
      name,
    };
  });

  return {
    length: list.length,
    components,
  };
};

export const getAllComponent = () => {
  const { components: baseComponents, length: baseLength } = getAllBaseComponent();
  const { components: businessComponents, length: businessLength } = getAllBusinessComponent();
  const { components: elComponents, length: elLength } = getAllElComponent();
  const components = {
    ...baseComponents,
    ...businessComponents,
    ...elComponents,
  };
  const length = baseLength + businessLength + elLength;
  return {
    length,
    components,
  };
};

/**
 * 按组件名获取加载函数（找不到返回 undefined）
 * 目录命名约定：./business/<name>/index.ts、./el/<name>/index.ts
 * 按需组件加载器：glob 仅建立"组件名 → 加载函数"映射，不加载任何模块
 * 供动态表单 ComponentRegistry 按需兜底使用，替代全量预载
 * 注：glob 需在函数内调用，顶层执行 import.meta.glob 会导致 vite.config.ts 加载失败
 */
export const getComponentLoader = (name: string) => {
  const componentLoaders = {
    ...import.meta.glob("./business/*/index.ts"),
    ...import.meta.glob("./el/*/index.ts"),
  };
  const path = Object.keys(componentLoaders).find(
    (p) => p.replace("./", "").split("/")[1] === name,
  );
  return path ? componentLoaders[path] : undefined;
};
export const globalComponentInstaller = {
  install(app: App) {
    const { components }: any = getAllBaseComponent();
    const componentList: any = Object.values(components);
    for (const { name, component } of componentList) {
      const componentName = "Sf" + name.charAt(0).toUpperCase() + name.slice(1);
      app.component(componentName, component);
    }
  },
};
