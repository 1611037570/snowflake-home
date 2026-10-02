import { describe, expect, it } from "vitest";
import { getDefaultRegionPadding, resolveRegionPadding } from "./regionPadding";

describe("区域留白解析", () => {
  // 注意：标语槽位默认组件与个人信息、正文共用 PlainRegion，因此默认留白只能是 0。
  // 想要标语下方自带呼吸空间，必须为标语槽位提供专属默认组件（待补），不能改 PlainRegion。
  it("槽位默认值：三个槽位默认都不内缩", () => {
    expect(getDefaultRegionPadding("slogan")).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(getDefaultRegionPadding("user")).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(getDefaultRegionPadding("main")).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it("未选定专属外观时取槽位默认组件的留白", () => {
    expect(resolveRegionPadding({}, "main")).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
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
    const padding = resolveRegionPadding({ theme: { template: "unknown" } }, "main");
    expect(padding).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it("个人信息组件留白不会改变正文区域", () => {
    const ui = { theme: { template: "userBand" } };
    // userBand 的留白由组件按 ui 计算（顶部 24），这里锁定它不会外溢到正文区域
    expect(resolveRegionPadding(ui, "user")).toEqual({ top: 24, right: 0, bottom: 12, left: 0 });
    expect(resolveRegionPadding(ui, "main")).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });
});
