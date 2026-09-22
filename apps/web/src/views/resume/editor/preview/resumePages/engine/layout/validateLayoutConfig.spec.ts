import { describe, expect, it } from "vitest";
import { validateLayoutConfig } from "./validateLayoutConfig";
import type { PageLayoutConfig } from "../pageLayoutTypes";

const createLayout = (): PageLayoutConfig => ({
  pageSize: { width: 794, height: 1123 },
  pagePadding: { top: 24, right: 24, bottom: 24, left: 24 },
  regionGap: 0,
  columnGap: 24,
  regions: [
    {
      id: "main",
      order: 0,
      height: { mode: "remaining" },
      columns: [
        {
          id: "left",
          width: { mode: "ratio", value: 1 },
          gap: 12,
          moduleKeys: ["user"],
        },
      ],
    },
  ],
});

describe("validateLayoutConfig", () => {
  it("报告未分配、重复和未知模块", () => {
    const layout = createLayout();
    layout.regions[0]!.columns[0]!.moduleKeys = ["user", "ghost", "user"];
    const result = validateLayoutConfig(layout, ["user", "work"]);

    expect(result.valid).toBe(false);
    expect(result.missingModuleKeys).toEqual(["work"]);
    expect(result.duplicateModuleKeys).toEqual(["user"]);
    expect(result.unknownModuleKeys).toEqual(["ghost"]);
  });

  it("拒绝非法尺寸和重复栏编号", () => {
    const layout = createLayout();
    layout.pageSize.width = 0;
    layout.regions.push({ ...layout.regions[0]!, id: "side" });
    layout.regions[1]!.columns[0]!.id = "left";
    const result = validateLayoutConfig(layout, ["user"]);

    expect(result.valid).toBe(false);
    expect(result.duplicateColumnIds).toEqual(["left"]);
    expect(result.invalidLayoutFields).toContain("pageSize.width");
  });
});
