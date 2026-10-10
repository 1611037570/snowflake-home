import type { Component } from "vue";
import type { ThemeContentContract } from "@/domain/resume/theme/themeContract";

// 内容组件按文件编号登记，复杂组件必须显式声明自己的分片能力。
const contentComponents = Object.fromEntries(Object.entries(import.meta.glob<Component>(
  ["./components/userHeading.vue", "./components/*User.vue"], { eager: true, import: "default" },
)).map(([file, component]) => [file.slice(file.lastIndexOf("/") + 1, -4), component]));

export const resolveUserContent = (contract: ThemeContentContract) => {
  const component = contentComponents[contract.renderer];
  if (!component) throw new Error(`未登记的个人信息组件：${contract.renderer}`);
  return component;
};
