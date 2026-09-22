import { describe, expect, it } from "vitest";
import { validateLayoutConfig } from "./validateLayoutConfig";
import { createDefaultPageLayoutTemplate } from "./layoutTemplates";

const moduleKeys = [
  "user",
  "account",
  "education",
  "skill",
  "work",
  "project",
  "custom_research",
];

describe("layoutTemplates", () => {
  it("将 user 单独放在顶部通栏，其余模块分到两栏", () => {
    const layout = createDefaultPageLayoutTemplate({
      templateId: "topUserTwoColumn",
      moduleKeys,
      paddingVertical: 24,
      paddingHorizontal: 24,
      gap: 12,
    });

    expect(layout.regions.map((region) => region.id)).toEqual(["header", "main"]);
    expect(layout.regions[0]?.columns[0]?.moduleKeys).toEqual(["user"]);
    expect(layout.regions[1]?.columns.map((column) => column.moduleKeys)).toEqual([
      ["account", "education", "skill"],
      ["work", "project", "custom_research"],
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
      ["user", "account", "education", "skill"],
      ["work", "project", "custom_research"],
    ]);
    expect(validateLayoutConfig(layout, moduleKeys).missingModuleKeys).toEqual([]);
  });
});
