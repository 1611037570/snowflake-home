import type { Component } from "vue";

// 装饰组件按文件编号登记，既不生成业务节点，也不参与空简历判断。
const decorations = Object.fromEntries(Object.entries(import.meta.glob<Component>(
  "./themes/*.vue", { eager: true, import: "default" },
)).map(([file, component]) => [file.slice(file.lastIndexOf("/") + 1, -4), component]));

export const resolvePageDecoration = (id: string) => {
  const component = decorations[id];
  if (!component) throw new Error(`未登记的页面装饰：${id}`);
  return component;
};
