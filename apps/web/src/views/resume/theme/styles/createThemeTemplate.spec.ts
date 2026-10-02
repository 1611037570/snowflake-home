import { describe, expect, it } from "vitest";
import {
  regionAppearanceRegistry,
  resolveRegionAppearanceId,
} from "../components/regionContainer/registry";
import { resolveRegionPadding } from "../regionPadding";
import { getResumeThemeTemplate, themeTemplateList } from "./index";

describe("主题模板与区域外观的约定", () => {
  it("每个主题编号解析出的区域外观都能在注册表里找到", () => {
    themeTemplateList.forEach((theme) => {
      (["slogan", "user", "main"] as const).forEach((slot) => {
        const appearanceId = resolveRegionAppearanceId(theme.id, slot);
        expect(
          regionAppearanceRegistry[appearanceId],
          `主题 ${theme.id} 的 ${slot} 区域解析出未登记的外观 ${appearanceId}`,
        ).toBeTruthy();
      });
    });
  });

  it("frame 主题按编号选中正文白色底板并读取组件留白", () => {
    const ui = getResumeThemeTemplate("frame").item.ui;
    expect(resolveRegionAppearanceId(ui.theme.template, "main")).toBe("frame");
    expect(resolveRegionPadding(ui, "main")).toEqual({ top: 12, right: 12, bottom: 12, left: 12 });
  });

  it("同一主题编号不会串到别的槽位", () => {
    // userBand 同时是主题编号与个人信息区域外观编号
    const ui = getResumeThemeTemplate("userBand").item.ui;
    expect(resolveRegionAppearanceId(ui.theme.template, "user")).toBe("userBand");
    expect(resolveRegionAppearanceId(ui.theme.template, "main")).toBe("mainDefault");
  });

  it("未登记专属区域外观的主题走槽位缺省外观", () => {
    expect(resolveRegionAppearanceId("modern", "slogan")).toBe("sloganBand");
    expect(resolveRegionAppearanceId("modern", "main")).toBe("mainDefault");
  });
});
