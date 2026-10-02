import { describe, expect, it } from "vitest";
import { defaultPageRadius } from "@/stores/modules/resume/config/uiConfig";
import { resolveBandStyle } from "./bandStyle";

describe("通栏色带样式", () => {
  const ui = {
    page: {
      padding: { vertical: 24, horizontal: 24 }, // 页面四周留白
      radius: 24, // 纸张圆角
    },
    region: {
      slogan: { padding: { bottom: 24 } }, // 标语区域下留白
    },
  };

  it("用等量负外边距外扩到页面边缘，再用等量内边距把内容收回", () => {
    const style = resolveBandStyle(ui, "slogan");
    expect(style.marginLeft).toBe("-24px");
    expect(style.marginRight).toBe("-24px");
    expect(style.paddingLeft).toBe("24px");
    expect(style.paddingRight).toBe("24px");
  });

  it("区域留白只加在内边距上：下沿留白来自声明，上沿留白等于页面留白", () => {
    const style = resolveBandStyle(ui, "slogan");
    expect(style.marginTop).toBe("-24px");
    expect(style.paddingTop).toBe("24px");
    expect(style.paddingBottom).toBe("24px");
  });

  it("未声明区域留白时按槽位默认值，不出现负留白", () => {
    const style = resolveBandStyle(ui, "user");
    expect(style.paddingTop).toBe("24px");
    expect(style.paddingBottom).toBe("0px");
  });

  it("贴页面顶边时按纸张圆角给出顶部圆角", () => {
    const style = resolveBandStyle(ui, "user", { roundTop: true });
    expect(style.borderTopLeftRadius).toBe("24px");
    expect(style.borderTopRightRadius).toBe("24px");
    // 未开启时不输出圆角，保持直角
    expect(resolveBandStyle(ui, "user").borderTopLeftRadius).toBeUndefined();
  });

  it("页面未配置留白与圆角时取默认值，样式仍可用", () => {
    const style = resolveBandStyle({}, "slogan", { roundTop: true });
    expect(style.marginLeft).toMatch(/^-\d+px$/);
    expect(style.paddingLeft).toMatch(/^\d+px$/);
    expect(style.borderTopLeftRadius).toBe(`${defaultPageRadius}px`);
  });
});
