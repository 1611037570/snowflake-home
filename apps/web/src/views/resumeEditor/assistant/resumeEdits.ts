import { allConfig } from "@/stores/modules/resume/formConfig";

// 语义化写操作：明确到模块、记录与字段，避免让模型自行拼装整棵 diff
export type ResumeWriteOp =
  | {
      op: "update"; // 修改已有字段
      module: string; // 模块 key，如 user/work/project/education/skill/account
      index?: number; // 数组型模块的记录下标（从 0 开始），对象型模块不填
      field: string; // 要修改的字段名
      value: unknown; // 修改后的值
    }
  | {
      op: "add"; // 数组型模块新增记录
      module: string; // 模块 key，如 work/project/account/education
      record?: Record<string, unknown>; // 新记录内容，键为字段名，值作为草稿展示
    };

// 字段格式规则：由 formConfig 的组件类型推导，作为 operations 校验依据
type FieldRule = {
  field: string;
  component?: string;
  options?: string[];
  month?: boolean;
  monthRange?: boolean;
  html?: boolean;
};

// 递归收集模块表单里的叶子字段规则
const walkFieldNodes = (nodes: unknown, rules: Map<string, FieldRule>) => {
  if (!Array.isArray(nodes)) return;
  nodes.forEach((node: any) => {
    if (!node || typeof node !== "object") return;
    const source = Array.isArray(node.source)
      ? node.source
      : Array.isArray(node.model?.source)
        ? node.model.source
        : null;
    if (Array.isArray(source) && source.length) {
      const field = String(source[source.length - 1]);
      const props = node.props ?? {};
      const options = Array.isArray(props.list)
        ? props.list.map((item: any) => (item && typeof item === "object" ? item.value : item))
        : undefined;
      const component = node.component || props.component;
      const prev = rules.get(field);
      rules.set(field, {
        field,
        component: component ?? prev?.component,
        options: options ?? prev?.options,
        month: component === "datePicker" && props.type === "month",
        monthRange: component === "datePicker" && props.type === "monthrange",
        html: component === "wangEditor",
      });
    }
    if (Array.isArray(node.fields)) walkFieldNodes(node.fields, rules);
    if (node.addConfig && typeof node.addConfig === "object") {
      if (Array.isArray(node.addConfig.model)) walkFieldNodes(node.addConfig.model, rules);
      if (Array.isArray(node.addConfig.fields)) walkFieldNodes(node.addConfig.fields, rules);
    }
  });
};

// 按模块 key 取字段规则（自定义模块复用 custom 模板）
const getModuleRules = (moduleKey: string): Map<string, FieldRule> => {
  const isCustomModule = moduleKey.startsWith("custom");
  const template: any = isCustomModule
    ? allConfig.custom
    : (allConfig as Record<string, any>)[moduleKey];
  const rules = new Map<string, FieldRule>();
  if (Array.isArray(template)) {
    walkFieldNodes(template, rules);
  } else if (template) {
    walkFieldNodes([template], rules);
  }
  return rules;
};

// 校验单个字段值的时间、枚举与 HTML 格式
const validateFieldValue = (
  module: string,
  field: string,
  value: unknown,
  rule: FieldRule | undefined,
  errors: string[],
) => {
  if (!rule) return;
  const monthRe = /^\d{4}\.(0[1-9]|1[0-2])$/;
  if (rule.month) {
    if (typeof value !== "string" || !monthRe.test(value)) {
      errors.push(`模块 ${module} 字段 ${field} 应为 YYYY.MM 格式（如 2023.07），实际值无效`);
    }
    return;
  }
  if (rule.monthRange) {
    if (
      !Array.isArray(value) ||
      value.length !== 2 ||
      value.some((item) => typeof item !== "string" || !monthRe.test(item))
    ) {
      errors.push(`模块 ${module} 字段 ${field} 应为 ["开始.YYYY.MM", "结束.YYYY.MM"] 格式`);
    }
    return;
  }
  if (rule.html) {
    if (typeof value !== "string" || !value.includes("<p")) {
      errors.push(`模块 ${module} 字段 ${field} 必须是 <p> 包裹的 HTML 字符串`);
    }
    return;
  }
  if (Array.isArray(rule.options) && rule.options.length && value !== "") {
    if (typeof value !== "string" || !rule.options.includes(value)) {
      errors.push(`模块 ${module} 字段 ${field} 可选值应为：${rule.options.join(" / ")}`);
    }
  }
};

/**
 * 校验语义化写操作：模块存在、数组下标合法、字段存在且值格式正确
 * @param operations 待校验的操作列表
 * @param dataView read_resume_data 返回的数据视图（顶层模块 key，模块内仅 data）
 * @returns 错误列表，为空表示校验通过
 */
export const validateResumeEdits = (
  operations: ResumeWriteOp[],
  dataView: Record<string, { data: unknown }>,
): string[] => {
  const errors: string[] = [];
  operations.forEach((op, index) => {
    const order = `第 ${index + 1} 条操作`;
    if (!op || typeof op !== "object") {
      errors.push(`${order}格式无效`);
      return;
    }
    const moduleView = dataView?.[op.module];
    if (!moduleView) {
      errors.push(`${order}：模块 ${op.module} 不存在于当前简历`);
      return;
    }
    const moduleRules = getModuleRules(op.module);
    if (op.op === "add") {
      if (!Array.isArray(moduleView.data)) {
        errors.push(`${order}：模块 ${op.module} 不是数组型模块，不能执行 add`);
        return;
      }
      if (op.record == null) return;
      if (typeof op.record !== "object" || Array.isArray(op.record)) {
        errors.push(`${order}：模块 ${op.module} 的 record 应为对象`);
        return;
      }
      Object.entries(op.record).forEach(([field, value]) => {
        const rule = moduleRules.get(field);
        if (!rule) {
          errors.push(`${order}：模块 ${op.module} 不存在字段 ${field}`);
          return;
        }
        validateFieldValue(op.module, field, value, rule, errors);
      });
      return;
    }
    if (op.op !== "update") {
      errors.push(`${order}：不支持的操作类型 ${(op as any).op}`);
      return;
    }
    if (typeof op.field !== "string") {
      errors.push(`${order}：update 必须提供 field`);
      return;
    }
    if (!("value" in op)) {
      errors.push(`${order}：update 必须提供 value`);
      return;
    }
    if (Array.isArray(moduleView.data)) {
      if (typeof op.index !== "number" || !Number.isInteger(op.index)) {
        errors.push(`${order}：数组型模块 ${op.module} 的 update 必须提供 index`);
        return;
      }
      const record = moduleView.data[op.index];
      if (!record || typeof record !== "object") {
        errors.push(
          `${order}：模块 ${op.module} 不存在下标 ${op.index} 的记录（当前共 ${moduleView.data.length} 条）`,
        );
        return;
      }
      if (!(op.field in record)) {
        errors.push(`${order}：模块 ${op.module} 下标 ${op.index} 的记录不存在字段 ${op.field}`);
        return;
      }
      validateFieldValue(op.module, op.field, op.value, moduleRules.get(op.field), errors);
      return;
    }
    if (op.index != null) {
      errors.push(`${order}：对象型模块 ${op.module} 的 update 不需要 index`);
      return;
    }
    if (
      !moduleView.data ||
      typeof moduleView.data !== "object" ||
      !(op.field in (moduleView.data as Record<string, unknown>))
    ) {
      errors.push(`${order}：模块 ${op.module} 不存在字段 ${op.field}`);
      return;
    }
    validateFieldValue(op.module, op.field, op.value, moduleRules.get(op.field), errors);
  });
  return errors;
};

// 把语义化写操作合并为预览层 diff 所需的树形 patch
export const buildDiffPatch = (operations: ResumeWriteOp[]): Record<string, any> => {
  const patch: Record<string, any> = {};
  operations.forEach((op) => {
    if (!op || op.op !== "update") return;
    const modulePatch = patch[op.module] ?? { data: op.index == null ? {} : [] };
    patch[op.module] = modulePatch;
    if (op.index == null) {
      modulePatch.data[op.field] = op.value;
    } else {
      const record = (modulePatch.data[op.index] ??= {});
      record[op.field] = op.value;
    }
  });
  return patch;
};
