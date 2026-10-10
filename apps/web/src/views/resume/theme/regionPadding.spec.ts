import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveRegionPadding } from "./regionPadding";

// 解析规则使用固定外观能力，不把真实主题样式写成测试基线。
const fixture = vi.hoisted(() => ({
  slots: {} as Record<string, { regionPadding?: { top: number; right: number; bottom: number; left: number } }>, // 各槽位外观能力
}));
vi.mock("@/domain/resume/theme/themeDecisions", () => ({
  resolveThemeDecisions: (id: unknown) => ({ regions: id === "fixture" ? Object.fromEntries(Object.entries(fixture.slots).map(([slot, value]) => [slot, { inset: value.regionPadding }])) : {} }), // 固定声明与默认回退
}));
beforeEach(() => { fixture.slots = {}; });

// 区域外观只声明区域内部的装饰留白；模块间距与页面上边距统一由布局结算
const emptyPadding = {
  top: 0, // 无额外上留白
  right: 0, // 无额外右留白
  bottom: 0, // 无额外下留白
  left: 0, // 无额外左留白
};

describe("区域留白解析", () => {
  // 主题未声明装饰尺寸时，各槽位统一不额外内缩。
  it("槽位默认值：三个槽位默认都不内缩", () => {
    expect(resolveRegionPadding(undefined, "slogan")).toEqual(emptyPadding);
    expect(resolveRegionPadding(undefined, "user")).toEqual(emptyPadding);
    expect(resolveRegionPadding(undefined, "main")).toEqual(emptyPadding);
  });

  it("未选定专属外观时取槽位默认组件的留白", () => {
    expect(resolveRegionPadding({}, "main")).toEqual(emptyPadding);
    expect(resolveRegionPadding(undefined, "slogan")).toEqual(emptyPadding);
  });

  it("读取正文外观声明的四周装饰留白", () => {
    fixture.slots.main = { regionPadding: { top: 12, right: 12, bottom: 12, left: 12 } };
    const padding = resolveRegionPadding({ theme: { template: "fixture" } }, "main");
    expect(padding).toEqual({ top: 12, right: 12, bottom: 12, left: 12 });
  });

  it("未登记的主题回退默认组件留白", () => {
    // 模块间距不再由默认正文组件声明，回退时同样不产生顶部留白
    const ui = { theme: { template: "unknown" }, page: { spacing: { module: 20 } } };
    expect(resolveRegionPadding(ui, "main")).toEqual(emptyPadding);
  });

  it("个人信息组件留白不会改变正文区域", () => {
    fixture.slots.user = { regionPadding: { top: 0, right: 0, bottom: 12, left: 0 } };
    const ui = { theme: { template: "fixture" } };
    // 页面上边距由引擎注入，组件只声明底纹内部留白，这里锁定它不会外溢到正文区域
    expect(resolveRegionPadding(ui, "user")).toEqual({ top: 0, right: 0, bottom: 12, left: 0 });
    expect(resolveRegionPadding(ui, "main")).toEqual(emptyPadding);
  });

  it("公共模块间距不会变成区域装饰内边距", () => {
    const ui = { theme: { template: "fixture" }, page: { spacing: { module: 24 } } };

    // 与正文第一个模块之间的距离改由布局按模块间距统一施加
    expect(resolveRegionPadding(ui, "user")).toEqual(emptyPadding);
    expect(resolveRegionPadding(ui, "main")).toEqual(emptyPadding);
  });
});
