/**
 * 组件注册器
 * 其实一个动态注册就够用啦
 * 写全局和动态是为了学习记录使用的~
 */
import fs from "fs";
import path from "path";
import type { ComponentResolver } from "unplugin-vue-components";
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

// 按需组件加载器：glob 仅建立"组件名 → 加载函数"映射，不加载任何模块
// 供动态表单 ComponentRegistry 按需兜底使用，替代全量预载
const componentLoaders = {
  ...import.meta.glob("./base/*/index.ts"),
  ...import.meta.glob("./business/*/index.ts"),
  ...import.meta.glob("./el/*/index.ts"),
};

/**
 * 按组件名获取加载函数（找不到返回 undefined）
 * 目录命名约定：./base/<name>/index.ts、./business/<name>/index.ts、./el/<name>/index.ts
 */
export const getComponentLoader = (name: string) => {
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
// 通过fs获取基础组件
function getDynamicComponent(str: string) {
  const baseDir = path.join(__dirname, str);
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

export const dynamicComponentResolver = (): ComponentResolver => {
  return (componentName: string) => {
    const baseMap = getDynamicComponent("base");

    const name = componentName.slice(2).replace(/^./, (c) => c.toLowerCase());
    function isBaseComponent(name: string) {
      return baseMap.includes(name);
    }

    if (isBaseComponent(name)) {
      return;
    }
    if (!componentName.startsWith("Sf")) {
      return;
    }
    const elMap = getDynamicComponent("el");
    const fileName = elMap.includes(name) ? "el" : "business";
    const path = `@components/${fileName}/${name}/index.ts`;
    return {
      // importName: name,
      path,
      name: componentName,
      from: path,
    };
  };
};
