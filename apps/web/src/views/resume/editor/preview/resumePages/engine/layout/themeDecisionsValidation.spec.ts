import { describe, expect, it } from "vitest";
import { validateThemeDecisions } from "@/domain/resume/theme/themeContract";
import type { ThemeDecisions } from "@/domain/resume/theme/themeDecisions";

describe("主题固定声明校验", () => {
  it("未声明使用默认值，显式错误定位字段", () => {
    expect(validateThemeDecisions({})).toEqual([]);
    expect(validateThemeDecisions({
      layoutType: "错误版式", // 非法版式编号
      pageBorder: { width: -1, color: "" }, // 非法边框宽度与空颜色
      usesDateRail: "true", // 错误的日期栏能力类型
      userContent: { renderer: "", split: "wrong" }, // 非法内容组件与分片方式
      topDecoration: "", // 空装饰编号
    } as unknown as Partial<ThemeDecisions>)).toEqual(expect.arrayContaining([
      "layoutType", "pageBorder.width", "pageBorder.color", "usesDateRail", "userContent.renderer", "userContent.split", "topDecoration",
    ]));
  });
  it("通用几何检查拒绝无穷值与错误设置限制", () => {
    expect(validateThemeDecisions({
      regions: { main: { inset: { top: Infinity, right: 0, bottom: 0, left: 0 } } }, // 正文四周留白，上侧值非法
      restrictions: { "page.background": "" }, // 缺少固定背景的限制原因
    })).toEqual(expect.arrayContaining(["regions.main.inset.top", "restrictions.page.background"]));
  });
});
