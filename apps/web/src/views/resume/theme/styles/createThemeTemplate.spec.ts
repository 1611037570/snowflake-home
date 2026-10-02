import { describe, expect, it } from "vitest";
import {
  regionAppearanceRegistry,
  resolveRegionAppearanceId,
} from "../components/regionContainer/registry";
import { getResumeThemeTemplate, themeTemplateList } from "./index";

/** 读取主题模板里声明区域外观的那部分配置 */
const themeRegionConfig = (themeId: string) =>
  getResumeThemeTemplate(themeId).item.ui.theme?.region;

describe("主题模板与区域外观的约定", () => {
  it("每个主题声明的区域外观都能在注册表里找到", () => {
    themeTemplateList.forEach((theme) => {
      const declared = themeRegionConfig(theme.id) || {};
      Object.entries(declared).forEach(([slot, appearanceId]) => {
        expect(
          regionAppearanceRegistry[appearanceId as string],
          `主题 ${theme.id} 的 ${slot} 区域声明了未登记的外观 ${appearanceId}`,
        ).toBeTruthy();
      });
    });
  });

  it("frame 主题声明正文白色底板与四周留白", () => {
    const ui = getResumeThemeTemplate("frame").item.ui;
    expect(ui.theme.region.main).toBe("frame");
    expect(ui.region.main.padding).toEqual({ top: 12, right: 12, bottom: 12, left: 12 });
  });

  it("主题编号与区域外观编号同名时不会串到别的槽位", () => {
    // userBand 同时是主题编号与个人信息区域外观编号
    const ui = getResumeThemeTemplate("userBand").item.ui;
    expect(ui.theme.region.user).toBe("userBand");
    expect(resolveRegionAppearanceId(ui.theme.region, "user")).toBe("userBand");
    expect(resolveRegionAppearanceId(ui.theme.region, "main")).toBe("mainDefault");
  });

  it("未声明区域外观的主题走槽位缺省外观", () => {
    expect(themeRegionConfig("modern")).toBeUndefined();
    expect(resolveRegionAppearanceId(themeRegionConfig("modern"), "slogan")).toBe("sloganBand");
    expect(resolveRegionAppearanceId(themeRegionConfig("modern"), "main")).toBe("mainDefault");
  });
});
