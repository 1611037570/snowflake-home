/** 仅收集导出树实际使用的样式，网页导出和浏览器打印共用。 */
export const collectResumeStyles = (root: HTMLElement, source: HTMLElement): string => {
  const families = new Set<string>(); // 当前简历使用的字体族，不内嵌其他界面字体
  const animations = new Set<string>(); // 当前简历实际引用的动画名称
  for (const element of [source, ...source.querySelectorAll<HTMLElement>("*")]) {
    const style = getComputedStyle(element);
    style.fontFamily.split(",").forEach((family) => families.add(family.trim().replace(/['"]/g, "")));
    style.animationName.split(",").forEach((name) => animations.add(name.trim()));
  }
  const resolveUrls = (text: string, base: string) => text.replace(
    /url\(\s*(['"]?)([^'")]+)\1\s*\)/g,
    (match, _quote, url: string) => {
      if (url.startsWith("data:") || url.startsWith("#")) return match;
      return `url("${new URL(url, base).href}")`;
    },
  );
  const classes = new Set<string>(); // 导出树及全局根元素实际出现的类名
  for (const element of [root, ...root.querySelectorAll("*"), document.documentElement, document.body]) {
    element.classList.forEach((name) => classes.add(name));
  }
  const matches = (selector: string) => {
    // 单选择器以类名起始时，该类必需存在，先排除大量无关工具样式。
    if (!selector.includes(",")) {
      const initialClass = selector.match(/^\.((?:\\.|[\w-])+)/)?.[1];
      const className = initialClass?.replace(/\\([0-9a-f]{1,6}\s?|.)/gi, (_match, escape: string) =>
        /^[0-9a-f]{1,6}\s?$/i.test(escape) ? String.fromCodePoint(parseInt(escape.trim(), 16)) : escape,
      );
      if (className && !classes.has(className)) return false;
    }
    // 伪元素与交互状态附着于已有元素，按宿主选择器保留绘图规则。
    const host = selector.replace(/::[\w-]+(?:\([^)]*\))?/g, "").replace(/:(?:hover|focus-visible|focus-within|focus|active|visited)\b/g, "");
    try {
      return root.matches(host) || Boolean(root.querySelector(host)) ||
        [document.documentElement, document.body].some((element) => element.matches(host));
    } catch { return true; } // 无法判断的新选择器保留，避免误删主题外观
  };
  const collect = (rules: CSSRuleList, base: string): string[] => Array.from(rules).flatMap((rule) => {
    if (rule instanceof CSSStyleRule) {
      return matches(rule.selectorText) ? [resolveUrls(rule.cssText, base)] : [];
    }
    if (rule instanceof CSSFontFaceRule) {
      const family = rule.style.getPropertyValue("font-family").trim().replace(/['"]/g, "");
      return families.has(family) ? [resolveUrls(rule.cssText, base)] : [];
    }
    if (rule instanceof CSSKeyframesRule) return animations.has(rule.name) ? [resolveUrls(rule.cssText, base)] : [];
    if (rule instanceof CSSImportRule) {
      if (!rule.styleSheet) return [];
      let importedRules: CSSRuleList;
      try { importedRules = rule.styleSheet.cssRules; }
      // 跨域导入会被浏览器禁止读取，仅跳过该外部样式，不能中断整份简历导出。
      catch { return []; }
      return collect(importedRules, rule.href);
    }
    if ("cssRules" in rule) {
      const children = collect((rule as CSSGroupingRule).cssRules, base);
      if (!children.length) return [];
      return [`${rule.cssText.slice(0, rule.cssText.indexOf("{"))}{${children.join("\n")}}`];
    }
    // 保留层顺序和属性声明，它们决定主题变量与级联结果。
    return [resolveUrls(rule.cssText, base)];
  });
  return Array.from(document.styleSheets).flatMap((sheet) => {
    let rules: CSSRuleList;
    try { rules = sheet.cssRules; }
    // 页面可能包含跨域字体或第三方样式，浏览器不允许读取其规则时继续收集其余本地样式。
    catch { return []; }
    return collect(rules, sheet.href || document.baseURI);
  }).join("\n");
};
