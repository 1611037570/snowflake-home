import { describe, expect, it } from "vitest";
import { validateThemeDecisions } from "@/domain/resume/theme/themeContract";
import type { ThemeDecisions } from "@/domain/resume/theme/themeDecisions";
import { resolveUserTemplate } from "@/domain/resume/theme/userTemplates";

describe("主题固定声明校验", () => {
  it("未声明使用默认值，显式错误定位字段", () => {
    expect(validateThemeDecisions({})).toEqual([]);
    expect(validateThemeDecisions({
      layoutType: "错误版式", // 非法版式编号
      pageBorder: { width: -1, color: "" }, // 非法边框宽度与空颜色
      usesDateRail: "true", // 错误的日期栏能力类型
      topDecoration: "", // 空装饰编号
    } as unknown as Partial<ThemeDecisions>)).toEqual(expect.arrayContaining([
      "layoutType", "pageBorder.width", "pageBorder.color", "usesDateRail", "topDecoration",
    ]));
  });
  it("个人信息模板按版式选择公共组件并保留自定义组件分页能力", () => {
    expect(resolveUserTemplate("auto", "singleColumn")).toEqual({ renderer: "userHeading", split: "whole" });
    expect(resolveUserTemplate(undefined, "twoColumn")).toEqual({ renderer: "twoColumnUser", split: "blocks" });
    expect(resolveUserTemplate("tealRailUser", "twoColumn")).toEqual({ renderer: "tealRailUser", split: "blocks" });
    expect(() => resolveUserTemplate("missingUser", "singleColumn")).toThrow("未登记的个人信息组件");
  });
  it("通用几何检查拒绝无穷值与错误设置限制", () => {
    expect(validateThemeDecisions({
      regions: { main: { inset: { top: Infinity, right: 0, bottom: 0, left: 0 } } }, // 正文四周留白，上侧值非法
      restrictions: { "page.background": "" }, // 缺少固定背景的限制原因
    })).toEqual(expect.arrayContaining(["regions.main.inset.top", "restrictions.page.background"]));
  });
});
