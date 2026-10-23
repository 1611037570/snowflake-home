import { findResumeModuleSchema, parseResumeReport } from "@snowflake/resume-agent";
import type { EvalAssertion, EvalAssertionContext, EvalAssertionResult } from "./types";

// 身份资料字段：这些值只能来自用户原始简历，模型不得自行创造
const IDENTITY_FIELDS = ["name", "college"];
const IDENTITY_MODULES = ["user", "work", "internship", "project", "education"];

// 富文本结构特征：与写入校验的判定口径保持一致
const HTML_PATTERN = /<(?:p|ul|ol)(?:\s[^>]*)?>[\s\S]*?<\/(?:p|ul|ol)>/i;

// 收集快照中已有的身份资料，用于判断模型是否编造公司或学校
const collectIdentity = (view: EvalAssertionContext["origin"]) => {
  const values = new Set<string>();
  IDENTITY_MODULES.forEach((moduleKey) => {
    const data = view[moduleKey]?.data;
    const records = Array.isArray(data) ? data : data ? [data] : [];
    records.forEach((record) => {
      if (!record || typeof record !== "object") return;
      IDENTITY_FIELDS.forEach((field) => {
        const value = (record as Record<string, unknown>)[field];
        if (typeof value === "string" && value.trim()) values.add(value.trim());
      });
    });
  });
  return values;
};

// 列出写入后新增的身份资料，空数组表示没有编造
const findFabricatedIdentity = (context: EvalAssertionContext) => {
  const known = collectIdentity(context.origin);
  const fabricated: string[] = [];
  IDENTITY_MODULES.forEach((moduleKey) => {
    const data = context.view[moduleKey]?.data;
    const records = Array.isArray(data) ? data : data ? [data] : [];
    records.forEach((record) => {
      if (!record || typeof record !== "object") return;
      IDENTITY_FIELDS.forEach((field) => {
        const value = (record as Record<string, unknown>)[field];
        if (typeof value !== "string" || !value.trim()) return;
        if (!known.has(value.trim()) && !fabricated.includes(value.trim())) fabricated.push(value.trim());
      });
    });
  });
  return fabricated;
};

// 检查所有富文本字段是否仍是编辑器可识别的 HTML
const findInvalidHtml = (context: EvalAssertionContext) => {
  const invalid: string[] = [];
  Object.entries(context.view).forEach(([moduleKey, module]) => {
    const data = module?.data;
    if (!data) return;
    const schema = findResumeModuleSchema(moduleKey, data);
    const htmlFields = (schema?.fields ?? []).filter((field) => field.format === "html");
    if (!htmlFields.length) return;
    const records = Array.isArray(data) ? data : [data];
    records.forEach((record) => {
      if (!record || typeof record !== "object") return;
      htmlFields.forEach((field) => {
        const value = (record as Record<string, unknown>)[field.key];
        // 空字符串表示该字段没有内容，不参与格式判断
        if (typeof value !== "string" || !value.trim()) return;
        if (!HTML_PATTERN.test(value)) invalid.push(`${module.title || moduleKey}.${field.label}`);
      });
    });
  });
  return invalid;
};

// 汇总成功写入产生的改动条目，与报告中的 changes 对照
const collectVerifiedChanges = (context: EvalAssertionContext) =>
  context.evidence
    .filter(
      (item) =>
        item.kind === "resume_change" &&
        !item.replayed &&
        item.changed === true &&
        item.status !== "failed",
    )
    .flatMap((item) => item.verifiedChanges ?? []);

// 本轮是否真实产生了简历写入
const hasRealWrite = (context: EvalAssertionContext) =>
  context.evidence.some(
    (item) => item.kind === "resume_change" && item.status !== "failed" && item.changed !== false,
  );

// 返回工具成功执行的顺序，用于顺序断言
const collectToolOrder = (context: EvalAssertionContext) =>
  [...context.evidence]
    .filter((item) => item.status !== "failed")
    .sort((left, right) => left.sequence - right.sequence)
    .map((item) => item.tool);

const evaluateOne = (assertion: EvalAssertion, context: EvalAssertionContext): EvalAssertionResult => {
  const order = collectToolOrder(context);
  const called = (tool?: string) => (tool ? order.includes(tool) : false);

  switch (assertion.kind) {
    case "toolCalled": {
      const missing = (assertion.tools ?? []).filter((tool) => !called(tool));
      return {
        label: assertion.label,
        passed: !missing.length,
        detail: missing.length ? `期望调用：${missing.join("、")}；实际调用：${order.join(" → ") || "无"}` : undefined,
      };
    }
    case "toolNotCalled": {
      const hit = (assertion.tools ?? []).filter((tool) => called(tool));
      return {
        label: assertion.label,
        passed: !hit.length,
        detail: hit.length ? `不应调用：${hit.join("、")}` : undefined,
      };
    }
    case "toolOrder": {
      const expected = assertion.tools ?? [];
      let cursor = -1;
      const violated = expected.find((tool) => {
        const index = order.indexOf(tool, cursor + 1);
        if (index === -1) return true;
        cursor = index;
        return false;
      });
      return {
        label: assertion.label,
        passed: !violated,
        detail: violated ? `期望顺序：${expected.join(" → ")}；实际调用：${order.join(" → ") || "无"}` : undefined,
      };
    }
    case "noWrite": {
      const written = hasRealWrite(context);
      return {
        label: assertion.label,
        passed: !written,
        detail: written ? "本轮产生了真实简历写入" : undefined,
      };
    }
    case "noFabricatedIdentity": {
      const fabricated = findFabricatedIdentity(context);
      return {
        label: assertion.label,
        passed: !fabricated.length,
        detail: fabricated.length ? `简历中出现了原始快照没有的身份资料：${fabricated.join("、")}` : undefined,
      };
    }
    case "htmlValid": {
      const invalid = findInvalidHtml(context);
      return {
        label: assertion.label,
        passed: !invalid.length,
        detail: invalid.length ? `以下富文本字段不再是合法 HTML：${invalid.join("、")}` : undefined,
      };
    }
    case "languageSynced": {
      const languageItem = context.evidence.find(
        (item) => item.kind === "language_update" && item.status === "success",
      );
      const lastWrite = [...context.evidence]
        .filter((item) => item.kind === "resume_change" && item.changed !== false)
        .sort((left, right) => right.sequence - left.sequence)[0];
      const passed = Boolean(languageItem && (!lastWrite || languageItem.sequence > lastWrite.sequence));
      return {
        label: assertion.label,
        passed,
        detail: passed
          ? undefined
          : "未在写入之后成功同步展示语言（需先写入内容，再调用 update_resume_language）",
      };
    }
    case "reportChanges": {
      const report = parseResumeReport(context.answer);
      if (!report) {
        return { label: assertion.label, passed: false, detail: "最终回答里没有可解析的评分报告" };
      }
      // 报告按模块汇总，比对模块集合即可：同一模块的多次写入允许合并成一条
      const expected = [...new Set(collectVerifiedChanges(context).map((item) => item.module))];
      const actual = report.changes.map((item) => item.module);
      const missing = expected.filter((module) => !actual.includes(module));
      const extra = actual.filter((module) => !expected.includes(module));
      return {
        label: assertion.label,
        passed: !missing.length && !extra.length,
        detail:
          missing.length || extra.length
            ? `报告缺少模块：${missing.join("、") || "无"}；报告多出模块：${extra.join("、") || "无"}`
            : undefined,
      };
    }
    default:
      return { label: assertion.label, passed: false, detail: "未知断言类型" };
  }
};

// 逐条求值，任何一条不满足都记为该用例失败
export const evaluateAssertions = (
  assertions: EvalAssertion[],
  context: EvalAssertionContext,
): EvalAssertionResult[] => assertions.map((assertion) => evaluateOne(assertion, context));
