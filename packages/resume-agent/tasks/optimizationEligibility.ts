import { richTextToPlainText } from "@snowflake/resume-core";

// 身份信息、标语和界面状态不构成内容优化的输入，不能因此启动收费请求。
const EXCLUDED_MODULES = new Set(["user", "account", "slogan"]);
const EXCLUDED_FIELDS = new Set(["id", "ui", "hidden", "collapsed", "icon"]);
const hasContent = (value: unknown): boolean => {
  if (typeof value === "string") {
    const text = richTextToPlainText(value).replace(/\[数据已脱敏\]/g, "").replace(/[\s\u200b-\u200d\ufeff]/g, "");
    return !!text && !/^(?:x+|待填写|待补充|未填写|未提供|暂无|无|none|null|undefined|[-_—－]+)$/i.test(text) &&
      !/^[\d./~\-年月日至今]+$/.test(text);
  }
  if (Array.isArray(value)) return value.some(hasContent);
  if (value && typeof value === "object") {
    return Object.entries(value).some(([key, item]) => !EXCLUDED_FIELDS.has(key) && hasContent(item));
  }
  return false;
};

// 页面和执行入口使用同一底线：存在一项真实内容即可，不要求所有经历模块齐全。
export const getResumeOptimizationBlockReason = (view: unknown): string => {
  const available = view && typeof view === "object" && Object.entries(view).some(([key, module]) =>
    !EXCLUDED_MODULES.has(key) && hasContent(module?.data));
  return available ? "" : "这份简历还没有可优化的经历或技能内容。请先填写至少一项教育、工作、项目、技能或个人优势，也可以通过「AI 简历生成」创建草稿。";
};
