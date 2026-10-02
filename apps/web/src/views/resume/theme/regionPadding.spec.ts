import { describe, expect, it } from "vitest";
import {
  defaultSloganPaddingBottom,
  defaultSloganPaddingTop,
} from "@/stores/modules/resume/config/uiConfig";
import { getDefaultRegionPadding, resolveRegionPadding } from "./regionPadding";

describe("区域留白解析", () => {
  it("槽位默认值：标语下留白有默认呼吸空间，个人信息与正文默认不内缩", () => {
    expect(getDefaultRegionPadding("slogan")).toEqual({
      top: defaultSloganPaddingTop,
      right: 0,
      bottom: defaultSloganPaddingBottom,
      left: 0,
    });
    expect(getDefaultRegionPadding("user")).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(getDefaultRegionPadding("main")).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it("未声明区域留白时取槽位默认值", () => {
    expect(resolveRegionPadding({}, "main")).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(resolveRegionPadding(undefined, "slogan")).toEqual({
      top: defaultSloganPaddingTop,
      right: 0,
      bottom: defaultSloganPaddingBottom,
      left: 0,
    });
  });

  it("逐向合并：只声明部分方向时其余方向仍取默认值", () => {
    const padding = resolveRegionPadding({ region: { main: { padding: { left: 8 } } } }, "main");
    expect(padding).toEqual({ top: 0, right: 0, bottom: 0, left: 8 });
  });

  it("声明值为负数或非数字时按默认值处理，不会出现负留白", () => {
    const padding = resolveRegionPadding(
      { region: { main: { padding: { top: -10, right: "abc", bottom: NaN, left: 6 } } } },
      "main",
    );
    expect(padding).toEqual({ top: 0, right: 0, bottom: 0, left: 6 });
  });

  it("区域之间互不影响：声明 user 的留白不会改变 main", () => {
    const ui = { region: { user: { padding: { bottom: 12 } } } };
    expect(resolveRegionPadding(ui, "user")).toEqual({ top: 0, right: 0, bottom: 12, left: 0 });
    expect(resolveRegionPadding(ui, "main")).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });
});
