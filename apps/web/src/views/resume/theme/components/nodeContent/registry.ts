import type { Component } from "vue";
import { resumeThemeRegistry } from "../../styles";

// 默认语义组件按文件登记，主题覆盖同名槽位，不在公共渲染器追加主题分支。
export const nodeContentComponents = Object.fromEntries(Object.entries(import.meta.glob<Component>(
  "./contents/*.vue", { eager: true, import: "default" },
)).map(([file, component]) => [file.slice(file.lastIndexOf("/") + 1, -4), component]));

const managedKinds = new Set(["user", "title", "slogan", "spacer"]); // 已有专用主题入口或公共几何职责的槽位

export const themeNodeContentComponents: Record<string, Record<string, Component>> = {}; // 主题编号到语义内容槽位
for (const [file, component] of Object.entries(import.meta.glob<Component>(
  "./themes/*/*.vue", { eager: true, import: "default" },
))) {
  const parts = file.split("/");
  const kind = parts[parts.length - 1]!.slice(0, -4);
  const themeId = parts[parts.length - 2]!;
  // 不开放第二个个人信息、标题或间距入口，避免同一职责出现两套配置。
  if (!resumeThemeRegistry[themeId] || !nodeContentComponents[kind] || managedKinds.has(kind)) throw new Error(`主题正文槽位无效：${themeId}/${kind}`);
  (themeNodeContentComponents[themeId] ??= {})[kind] = component;
}

/** 主题覆盖与默认语义组件使用同一协议，未知内容语义立即报告错误。 */
export const resolveNodeContent = (themeId: string, kind: string): Component => {
  const component = themeNodeContentComponents[themeId]?.[kind] ?? nodeContentComponents[kind];
  if (!component) throw new Error(`未登记的正文语义组件：${kind}`);
  return component;
};
