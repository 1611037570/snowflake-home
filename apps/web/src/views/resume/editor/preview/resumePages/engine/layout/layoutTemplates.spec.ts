import { describe, expect, it } from "vitest";
import { validateLayoutConfig } from "./validateLayoutConfig";
import { createDefaultPageLayoutTemplate } from "./layoutTemplates";

const moduleKeys = ["user", "account", "education", "skill", "work", "project", "custom_research"];

describe("layoutTemplates", () => {
  it("单栏模板把所有模块放进同一栏", () => {
    const layout = createDefaultPageLayoutTemplate({
      templateId: "singleColumn",
      moduleKeys,
      paddingVertical: 24,
      paddingHorizontal: 24,
      gap: 12,
    });

    expect(layout.regions).toHaveLength(1);
    expect(layout.regions[0]?.columns).toHaveLength(1);
    expect(layout.regions[0]?.columns[0]?.moduleKeys).toEqual(moduleKeys);
    expect(validateLayoutConfig(layout, moduleKeys).missingModuleKeys).toEqual([]);
  });

  it("将 user 单独放在顶部通栏，其余模块分到两栏", () => {
    const layout = createDefaultPageLayoutTemplate({
      templateId: "topUserTwoColumn",
      moduleKeys,
      paddingVertical: 24,
      paddingHorizontal: 24,
      gap: 12,
    });

    expect(layout.regions.map((region) => region.id)).toEqual(["user", "main"]);
    expect(layout.regions[0]?.columns[0]?.moduleKeys).toEqual(["user"]);
    expect(layout.regions[1]?.columns.map((column) => column.moduleKeys)).toEqual([
      ["account", "skill"],
      ["education", "work", "project", "custom_research"],
    ]);
    expect(validateLayoutConfig(layout, moduleKeys).missingModuleKeys).toEqual([]);
  });

  it("将 user 明确放入只有两栏的左栏", () => {
    const layout = createDefaultPageLayoutTemplate({
      templateId: "twoColumn",
      moduleKeys,
      paddingVertical: 24,
      paddingHorizontal: 24,
      gap: 12,
    });

    expect(layout.regions).toHaveLength(1);
    expect(layout.regions[0]?.columns.map((column) => column.moduleKeys)).toEqual([
      ["user", "account", "skill"],
      ["education", "work", "project", "custom_research"],
    ]);
    expect(validateLayoutConfig(layout, moduleKeys).missingModuleKeys).toEqual([]);
  });

  it("没有标语模块时不创建顶部标语区域", () => {
    const layout = createDefaultPageLayoutTemplate({
      templateId: "topUserSingleColumn",
      moduleKeys,
      paddingVertical: 24,
      paddingHorizontal: 24,
      gap: 12,
    });

    expect(layout.regions.map((region) => region.id)).toEqual(["user", "main"]);
  });

  it("存在标语模块时把标语区域插到最前并重新编号区域顺序", () => {
    const layoutWithSlogan = [...moduleKeys, "slogan"];
    const layout = createDefaultPageLayoutTemplate({
      templateId: "topUserSingleColumn",
      moduleKeys: layoutWithSlogan,
      paddingVertical: 24,
      paddingHorizontal: 24,
      gap: 12,
    });

    expect(layout.regions.map((region) => [region.id, region.order])).toEqual([
      ["slogan", 0],
      ["user", 1],
      ["main", 2],
    ]);
    expect(layout.regions[0]?.columns[0]?.moduleKeys).toEqual(["slogan"]);
    // 标语不能再出现在正文栏位里，否则同一模块会被分配两次
    expect(layout.regions[2]?.columns[0]?.moduleKeys).toEqual([
      "account",
      "education",
      "skill",
      "work",
      "project",
      "custom_research",
    ]);
    expect(validateLayoutConfig(layout, layoutWithSlogan).missingModuleKeys).toEqual([]);
  });
});
