import { describe, expect, it } from "vitest";
import {
  defaultRegionAppearance,
  regionAppearanceRegistry,
  regionSurfaceAppearances,
  resolveRegionAppearance,
  resolveRegionAppearanceId,
  slotRegionAppearances,
} from "./registry";

describe("区域外观解析", () => {
  it("槽位缺省外观：标语绘制通栏色带、个人信息不绘制、正文用透明底板", () => {
    expect(defaultRegionAppearance).toEqual({
      slogan: "sloganBand",
      user: "default",
      main: "mainDefault",
    });
    expect(resolveRegionAppearanceId(undefined, "slogan")).toBe("sloganBand");
    expect(resolveRegionAppearanceId(undefined, "user")).toBe("default");
    expect(resolveRegionAppearanceId(undefined, "main")).toBe("mainDefault");
  });

  it("登记过的编号按声明取值", () => {
    expect(resolveRegionAppearanceId({ slogan: "sloganBandRibbon" }, "slogan")).toBe(
      "sloganBandRibbon",
    );
    expect(resolveRegionAppearanceId({ main: "frame" }, "main")).toBe("frame");
    expect(resolveRegionAppearanceId({ user: "userBand" }, "user")).toBe("userBand");
  });

  it("未登记的编号回退槽位缺省外观，不会渲染空白", () => {
    expect(resolveRegionAppearanceId({ main: "notRegistered" }, "main")).toBe("mainDefault");
    expect(resolveRegionAppearanceId({ user: 12 }, "user")).toBe("default");
  });

  it("没有槽位时用通用缺省外观", () => {
    expect(resolveRegionAppearanceId({ main: "frame" }, null)).toBe("default");
  });

  it("槽位之间互不串用：声明在 user 的编号不会落到 main 上", () => {
    // userBand 同时是主题编号与个人信息区域外观编号，正文区域必须仍用正文缺省外观
    const region = { user: "userBand", slogan: "sloganBandRibbon" };
    expect(resolveRegionAppearanceId(region, "main")).toBe("mainDefault");
  });

  it("把别的槽位的外观声明到本槽位时按缺省外观处理", () => {
    // 这正是曾经出现过的回退：个人信息底纹被声明到正文，底纹铺满整页
    expect(resolveRegionAppearanceId({ main: "userBand" }, "main")).toBe("mainDefault");
    expect(resolveRegionAppearanceId({ main: "sloganBand" }, "main")).toBe("mainDefault");
    expect(resolveRegionAppearanceId({ user: "frame" }, "user")).toBe("default");
    expect(resolveRegionAppearanceId({ slogan: "userBand" }, "slogan")).toBe("sloganBand");
  });

  it("槽位白名单里的编号都已登记，且缺省外观在白名单内", () => {
    Object.entries(slotRegionAppearances).forEach(([slot, ids]) => {
      ids.forEach((id) => {
        expect(regionAppearanceRegistry[id], `${slot} 白名单里的 ${id} 未登记`).toBeTruthy();
      });
      expect(ids).toContain(defaultRegionAppearance[slot as keyof typeof defaultRegionAppearance]);
    });
  });

  it("解析组件：同一编号稳定返回同一个组件，未知编号与缺省编号一致", () => {
    expect(resolveRegionAppearance(undefined, "main")).toBe(
      regionAppearanceRegistry[defaultRegionAppearance.main],
    );
    expect(resolveRegionAppearance({ main: "frame" }, "main")).toBe(regionAppearanceRegistry.frame);
    expect(resolveRegionAppearance({ main: "frame" }, "main")).not.toBe(
      regionAppearanceRegistry.mainDefault,
    );
  });

  it("绘制底板的正文外观单独登记，供「正文是否铺满整页」判断使用", () => {
    expect(regionSurfaceAppearances.has("frame")).toBe(true);
    expect(regionSurfaceAppearances.has("mainDefault")).toBe(false);
    regionSurfaceAppearances.forEach((id) => {
      expect(regionAppearanceRegistry[id]).toBeTruthy();
    });
  });
});
