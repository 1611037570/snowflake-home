import {
  getModelBindings,
  walkFormFields,
} from "@/components/business/dynamicForm/code/schemaAccess";
import { allConfig } from "@/stores/modules/resume/formConfig";

// 语义化写操作：明确到模块、记录与字段，避免让模型自行拼装整棵数据
export type ResumeWriteOp =
  | {
      op: "updateModule"; // 修改模块级 data 字段
      module: string;
      field: string;
      value: unknown; // 修改后的值
    }
  | {
      op: "updateModuleTitle"; // 修改模块 ui.title 展示标题
      module: string;
      title: string;
    }
  | {
      op: "updateRecord"; // 修改记录字段
      module: string;
      index: number; // 记录下标（从 0 开始）
      field: string;
      value: unknown;
    }
  | {
      op: "addRecord"; // 数组型模块新增记录
      module: string;
      record?: Record<string, unknown>; // 新记录内容，键为字段名，值直接写入
    }
  | {
      op: "deleteRecord"; // 删除记录
      module: string;
      index: number;
    }
  | {
      op: "moveRecord"; // 调整记录顺序
      module: string;
      from: number;
      to: number;
    };

// 字段格式规则：由 formConfig 的组件类型推导，作为 operations 校验依据
type FieldRule = {
  field: string;
  component?: string;
  options?: string[];
  addable?: boolean;
  month?: boolean;
  monthRange?: boolean;
  html?: boolean;
};

// 基于引擎遍历能力收集模块字段规则，避免 AI 层理解容器嵌套结构
const collectFieldRules = (source: any, rules: Map<string, FieldRule>) => {
  walkFormFields(source, (node) => {
    const props = node.props ?? {};
    const options = Array.isArray(props.list)
      ? props.list.map((item: any) => (item && typeof item === "object" ? item.value : item))
      : undefined;
    const component = node.component || props.component;
    getModelBindings(node).forEach((binding) => {
      const bindingSource = binding.source;
      if (!Array.isArray(bindingSource) || !bindingSource.length || binding.raw) return;
      const field = String(bindingSource[bindingSource.length - 1]);
      const prev = rules.get(field);
      rules.set(field, {
        field,
        component: component ?? prev?.component,
        options: options ?? prev?.options,
        addable: node.addable === true || prev?.addable,
        month: component === "datePicker" && props.type === "month",
        monthRange: component === "datePicker" && props.type === "monthrange",
        html: component === "wangEditor",
      });
    });
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
    collectFieldRules(template, rules);
  } else if (template) {
    collectFieldRules(template, rules);
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

// 取模块记录数组：自定义模块记录在 data.list，其余数组模块直接是 data
const getModuleRecords = (moduleView: { data: unknown }): any[] | null => {
  if (Array.isArray(moduleView?.data)) return moduleView.data;
  if (Array.isArray((moduleView?.data as any)?.list)) return (moduleView.data as any).list;
  return null;
};

/**
 * 校验语义化写操作：模块存在、数组下标合法、字段存在且值格式正确
 * @param operations 待校验的操作列表
 * @param dataView read_resume_data 返回的数据视图（顶层模块 key，模块内包含 title 与 data）
 * @returns 错误列表，为空表示校验通过
 */
export const validateResumeEdits = (
  operations: ResumeWriteOp[],
  dataView: Record<string, { title?: string; data: unknown }>,
): string[] => {
  const errors: string[] = [];
  operations.forEach((op, index) => {
    const order = `第 ${index + 1} 条操作`;
    if (!op || typeof op !== "object") {
      errors.push(`${order}格式无效`);
      return;
    }
    const rawOp = (op as { op?: string }).op;
    if (
      ![
        "updateModule",
        "updateModuleTitle",
        "updateRecord",
        "addRecord",
        "deleteRecord",
        "moveRecord",
      ].includes(rawOp ?? "")
    ) {
      errors.push(`${order}：不支持的操作类型 ${rawOp ?? "未知"}`);
      return;
    }
    const moduleView = dataView?.[op.module];
    if (!moduleView) {
      errors.push(`${order}：模块 ${op.module} 不存在于当前简历`);
      return;
    }
    if (op.op === "updateModuleTitle") {
      if (typeof op.title !== "string" || !op.title.trim()) {
        errors.push(`${order}：模块标题不能为空`);
      }
      return;
    }
    const moduleRules = getModuleRules(op.module);
    const records = getModuleRecords(moduleView);
    if (op.op === "addRecord") {
      if (!records) {
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
    if (op.op === "deleteRecord") {
      if (!records) {
        errors.push(`${order}：模块 ${op.module} 不是数组型模块，不能执行 delete`);
        return;
      }
      if (
        typeof op.index !== "number" ||
        !Number.isInteger(op.index) ||
        op.index < 0 ||
        op.index >= records.length
      ) {
        errors.push(
          `${order}：模块 ${op.module} 不存在下标 ${op.index} 的记录（当前共 ${records.length} 条）`,
        );
      }
      return;
    }
    if (op.op === "moveRecord") {
      if (!records) {
        errors.push(`${order}：模块 ${op.module} 不是数组型模块，不能执行 move`);
        return;
      }
      const count = records.length;
      const invalid = (value: unknown) =>
        typeof value !== "number" || !Number.isInteger(value) || value < 0 || value >= count;
      if (invalid(op.from) || invalid(op.to)) {
        errors.push(
          `${order}：模块 ${op.module} 的 move 下标无效（from/to 应在 0~${count - 1} 之间）`,
        );
      }
      return;
    }
    if (typeof op.field !== "string") {
      errors.push(`${order}：必须提供 field`);
      return;
    }
    if (!("value" in op)) {
      errors.push(`${order}：必须提供 value`);
      return;
    }
    if (op.op === "updateRecord") {
      if (typeof op.index !== "number" || !Number.isInteger(op.index)) {
        errors.push(`${order}：updateRecord 必须提供合法 index`);
        return;
      }
      if (!records) {
        errors.push(`${order}：模块 ${op.module} 不存在记录数组，不能执行 updateRecord`);
        return;
      }
      const record = records[op.index];
      if (!record || typeof record !== "object") {
        errors.push(
          `${order}：模块 ${op.module} 不存在下标 ${op.index} 的记录（当前共 ${records.length} 条）`,
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
    const isDataObject =
      moduleView.data && typeof moduleView.data === "object" && !Array.isArray(moduleView.data);
    const data = moduleView.data as Record<string, unknown>;
    const rule = moduleRules.get(op.field);
    // 模块级缺失字段仅允许由表单结构中声明的可添加字段补入
    if (
      !isDataObject ||
      (!Object.prototype.hasOwnProperty.call(data, op.field) && rule?.addable !== true)
    ) {
      errors.push(`${order}：模块 ${op.module} 不存在模块级字段 ${op.field}`);
      return;
    }
    validateFieldValue(op.module, op.field, op.value, rule, errors);
  });
  return errors;
};
