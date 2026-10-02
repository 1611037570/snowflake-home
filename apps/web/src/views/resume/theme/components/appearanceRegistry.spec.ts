import { describe, expect, it } from "vitest";
import { createAppearanceRegistry } from "./appearanceRegistry";

/** 测试用外观组件：注册表只关心组件标识，用普通对象代替 */
const DefaultAppearance = { name: "DefaultAppearance" };
const VividAppearance = { name: "VividAppearance" };

describe("外观注册表", () => {
  const registry = createAppearanceRegistry({
    default: DefaultAppearance,
    vivid: VividAppearance,
  });

  it("登记过的编号取自己的组件", () => {
    expect(registry.resolve("vivid")).toBe(VividAppearance);
    expect(registry.resolve("default")).toBe(DefaultAppearance);
  });

  it("未登记的编号、空值与非法类型一律回退 default", () => {
    expect(registry.resolve("notRegistered")).toBe(DefaultAppearance);
    expect(registry.resolve("")).toBe(DefaultAppearance);
    expect(registry.resolve(undefined)).toBe(DefaultAppearance);
    expect(registry.resolve(null)).toBe(DefaultAppearance);
    expect(registry.resolve(42)).toBe(DefaultAppearance);
    expect(registry.resolve({ id: "vivid" })).toBe(DefaultAppearance);
  });
});
