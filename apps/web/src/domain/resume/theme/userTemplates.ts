import type { PageLayoutTemplateId } from "@/domain/resume/theme/layouts";
import type { ThemeContentContract } from "@/domain/resume/theme/themeContract";

// 个人信息组件编号取自真实文件；分片能力仅在这里登记。
const userTemplateIds = new Set(Object.keys(import.meta.glob([
  "/src/views/resume/theme/components/userModule/components/userHeading.vue",
  "/src/views/resume/theme/components/userModule/components/*User.vue",
])).map((file) => file.slice(file.lastIndexOf("/") + 1, -4)));
const blockUserTemplates = new Set(["twoColumnUser", "tealRailUser"]);

/** 由个人信息模板编号统一解析渲染组件与分页能力。 */
export const resolveUserTemplate = (selected: string | undefined, layoutType: PageLayoutTemplateId): ThemeContentContract => {
  // 个人信息在窄栏内的两种双栏版式共用可分块组件，其余版式使用通栏标题组件
  const userInNarrowColumn = layoutType === "twoColumn" || layoutType === "twoColumnRightUser";
  const renderer = !selected || selected === "auto"
    ? userInNarrowColumn ? "twoColumnUser" : "userHeading"
    : selected;
  if (!userTemplateIds.has(renderer)) throw new Error(`未登记的个人信息组件：${renderer}`);
  return {
    renderer, // 个人信息内容组件编号
    split: blockUserTemplates.has(renderer) ? "blocks" : "whole", // 组件支持的分页方式
  };
};
