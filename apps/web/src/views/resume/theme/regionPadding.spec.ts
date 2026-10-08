import { describe, expect, it } from "vitest";
import { getDefaultRegionPadding, resolveRegionPadding } from "./regionPadding";
import { resolveRegionGapBefore } from "./components/regionContainer/registry";
import { defaultModuleSpacing } from "@/stores/modules/resume/config/uiConfig";

// 默认正文外观把首个模块前的留白声明为模块间距，因此正文槽位默认上留白不是零
const defaultMainPadding = {
  top: defaultModuleSpacing, // 首个模块前的顶部留白取模块间距默认值
  right: 0, // 默认正文无额外右留白
  bottom: 0, // 默认正文无额外下留白
  left: 0, // 默认正文无额外左留白
};

describe("区域留白解析", () => {
  // 注意：标语槽位默认组件与个人信息共用 PlainRegion，因此这两个槽位默认留白只能是 0。
  // 想要标语下方自带呼吸空间，必须为标语槽位提供专属默认组件（待补），不能改 PlainRegion。
  it("槽位默认值：标语与个人信息不内缩，正文取模块间距", () => {
    expect(getDefaultRegionPadding("slogan")).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(getDefaultRegionPadding("user")).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(getDefaultRegionPadding("main")).toEqual(defaultMainPadding);
  });

  it("未选定专属外观时取槽位默认组件的留白", () => {
    expect(resolveRegionPadding({}, "main")).toEqual(defaultMainPadding);
    expect(resolveRegionPadding(undefined, "slogan")).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });

  it("红框主题读取正文组件自身的四周留白", () => {
    const padding = resolveRegionPadding({ theme: { template: "frame" } }, "main");
    expect(padding).toEqual({ top: 12, right: 12, bottom: 12, left: 12 });
  });

  it("未登记的主题回退默认组件留白", () => {
    // 默认正文把首个模块前的留白声明为模块间距，回退到它时同样跟随模块间距
    const ui = { theme: { template: "unknown" }, page: { spacing: { module: 20 } } };
    expect(resolveRegionPadding(ui, "main")).toEqual({ top: 20, right: 0, bottom: 0, left: 0 });
  });

  it("个人信息组件留白不会改变正文区域", () => {
    const ui = { theme: { template: "userBand" } };
    // userBand 的留白由组件按 ui 计算（顶部 24），这里锁定它不会外溢到正文区域
    expect(resolveRegionPadding(ui, "user")).toEqual({ top: 24, right: 0, bottom: 12, left: 0 });
    expect(resolveRegionPadding(ui, "main")).toEqual(defaultMainPadding);
  });

  it("顶部个人信息主题把与正文之间的距离交给正文区域声明", () => {
    const ui = { theme: { template: "squareTimeline" } };

    expect(resolveRegionPadding(ui, "user")).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    // 距离改由正文区域的 gapBefore 声明，只作用于首页
    expect(resolveRegionGapBefore(ui.theme.template, "main")).toBe(24);
  });
});
