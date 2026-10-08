import { describe, expect, it } from "vitest";
import { getDefaultRegionPadding, resolveRegionPadding } from "./regionPadding";

// 区域外观只声明区域内部的装饰留白；模块间距与页面上边距统一由布局结算
const emptyPadding = {
  top: 0, // 无额外上留白
  right: 0, // 无额外右留白
  bottom: 0, // 无额外下留白
  left: 0, // 无额外左留白
};

describe("区域留白解析", () => {
  // 注意：标语与个人信息槽位默认组件共用 PlainRegion，正文槽位默认组件也不内缩。
  // 想要某个槽位自带呼吸空间，必须为它提供专属默认组件，不能改 PlainRegion。
  it("槽位默认值：三个槽位默认都不内缩", () => {
    expect(getDefaultRegionPadding("slogan")).toEqual(emptyPadding);
    expect(getDefaultRegionPadding("user")).toEqual(emptyPadding);
    expect(getDefaultRegionPadding("main")).toEqual(emptyPadding);
  });

  it("未选定专属外观时取槽位默认组件的留白", () => {
    expect(resolveRegionPadding({}, "main")).toEqual(emptyPadding);
    expect(resolveRegionPadding(undefined, "slogan")).toEqual(emptyPadding);
  });

  it("红框主题读取正文组件自身的四周留白", () => {
    const padding = resolveRegionPadding({ theme: { template: "frame" } }, "main");
    expect(padding).toEqual({ top: 12, right: 12, bottom: 12, left: 12 });
  });

  it("未登记的主题回退默认组件留白", () => {
    // 模块间距不再由默认正文组件声明，回退时同样不产生顶部留白
    const ui = { theme: { template: "unknown" }, page: { spacing: { module: 20 } } };
    expect(resolveRegionPadding(ui, "main")).toEqual(emptyPadding);
  });

  it("个人信息组件留白不会改变正文区域", () => {
    const ui = { theme: { template: "userBand" } };
    // 页面上边距由引擎注入，组件只声明底纹内部留白，这里锁定它不会外溢到正文区域
    expect(resolveRegionPadding(ui, "user")).toEqual({ top: 0, right: 0, bottom: 12, left: 0 });
    expect(resolveRegionPadding(ui, "main")).toEqual(emptyPadding);
  });

  it("顶部个人信息主题不再声明与正文之间的距离", () => {
    const ui = { theme: { template: "squareTimeline" } };

    // 与正文第一个模块之间的距离改由布局按模块间距统一施加
    expect(resolveRegionPadding(ui, "user")).toEqual(emptyPadding);
    expect(resolveRegionPadding(ui, "main")).toEqual(emptyPadding);
  });
});
