import { describe, expect, it } from "vitest";
import {
  defaultRegionAppearance,
  regionAppearanceRegistry,
  regionSurfaceAppearances,
  resolveRegionAppearance,
  resolveRegionAppearanceId,
  hasThemeSlogan,
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

  it("登记过的主题编号选中对应区域组件", () => {
    expect(resolveRegionAppearanceId("sloganBand", "slogan")).toBe(
      "sloganBandRibbon",
    );
    expect(resolveRegionAppearanceId("frame", "main")).toBe("frame");
    expect(resolveRegionAppearanceId("userBand", "user")).toBe("userBand");
  });

  it("未登记的主题编号回退槽位缺省外观，不会渲染空白", () => {
    expect(resolveRegionAppearanceId("notRegistered", "main")).toBe("mainDefault");
    expect(resolveRegionAppearanceId(12, "user")).toBe("default");
  });

  it("没有槽位时用通用缺省外观", () => {
    expect(resolveRegionAppearanceId("frame", null)).toBe("default");
  });

  it("槽位之间互不串用：个人信息主题不会落到正文上", () => {
    expect(resolveRegionAppearanceId("userBand", "main")).toBe("mainDefault");
  });

  it("主题只影响登记的槽位", () => {
    expect(resolveRegionAppearanceId("userBand", "main")).toBe("mainDefault");
    expect(resolveRegionAppearanceId("sloganBand", "main")).toBe("mainDefault");
    expect(resolveRegionAppearanceId("frame", "user")).toBe("default");
    expect(resolveRegionAppearanceId("userBand", "slogan")).toBe("sloganBand");
  });

  it("内置标语由主题编号识别", () => {
    expect(hasThemeSlogan("sloganBand")).toBe(true);
    expect(hasThemeSlogan("modern")).toBe(false);
  });

  it("解析组件：同一编号稳定返回同一个组件，未知编号与缺省编号一致", () => {
    expect(resolveRegionAppearance(undefined, "main")).toBe(
      regionAppearanceRegistry[defaultRegionAppearance.main],
    );
    expect(resolveRegionAppearance("frame", "main")).toBe(regionAppearanceRegistry.frame);
    expect(resolveRegionAppearance("frame", "main")).not.toBe(
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
