import { describe, expect, it } from "vitest";
import { isRegionSlotId, regionSlotRegistry, resolveRegionSlot } from "./regionSlots";

describe("区域槽位", () => {
  it("槽位编号固定为 slogan / user / main", () => {
    expect(regionSlotRegistry.map((slot) => slot.id)).toEqual(["slogan", "user", "main"]);
  });

  it("识别合法槽位编号", () => {
    expect(isRegionSlotId("slogan")).toBe(true);
    expect(isRegionSlotId("main")).toBe(true);
    expect(isRegionSlotId("header")).toBe(false);
    expect(isRegionSlotId(undefined)).toBe(false);
    expect(isRegionSlotId(1)).toBe(false);
  });

  it("未知编号解析为无槽位，由调用方按无外观区域处理", () => {
    expect(resolveRegionSlot("user")).toBe("user");
    expect(resolveRegionSlot("unknown")).toBeNull();
    expect(resolveRegionSlot(null)).toBeNull();
  });
});
