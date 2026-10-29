import { isResumeMediaField } from "@snowflake/resume-core/schema/resumeMedia";
import type { ResumeFieldSchema } from "@snowflake/resume-core/schema/resumeSchema";
import { findResumeModuleSchema } from "@snowflake/resume-core/schema/resumeSchemaRegistry";
import type { ResumeWriteOp } from "./resumeOperations";
import { normalizeRichTextHtml } from "@snowflake/resume-core/format/normalizeRichText";

export type ResumeEditValidationIssue = {
  // 原始写操作下标，从零开始；无法定位时为空
  operationIndex: number | null;
  // 稳定错误类别，供模型决定修正方式
  code: "INVALID_OPERATION" | "INVALID_MODULE" | "INVALID_FIELD" | "INVALID_VALUE";
  // 面向模型的具体错误说明
  message: string;
};

// 校验单个字段值的时间、枚举与 HTML 格式
export const validateFieldValue = (
  module: string,
  field: string,
  value: unknown,
  rule: ResumeFieldSchema | undefined,
  errors: string[],
) => {
  if (!rule) return;
  // 未知日期或未填写的富文本允许留空，占位不得写入日期与枚举字段
  if (value === "" && (rule.format === "month" || rule.format === "html")) return;
  const monthRe = /^\d{4}\.(0[1-9]|1[0-2])$/;
  if (rule.format === "month") {
    // 结束时间允许使用"至今"表示持续中
    if (typeof value !== "string" || (!monthRe.test(value) && !(field === "endTime" && value === "至今"))) {
      errors.push(
        `模块 ${module} 字段 ${field} 应为 YYYY.MM 格式（如 2023.07）或 至今，实际值无效`,
      );
    }
    return;
  }
  if (rule.format === "html") {
    if (typeof value !== "string" || !/<(?:p|ul|ol)(?:\s[^>]*)?>[\s\S]*?<\/(?:p|ul|ol)>/i.test(value)) {
      errors.push(`模块 ${module} 字段 ${field} 必须是包含段落或列表的 HTML 字符串`);
      return;
    }
    // 专业技能正文必须保持逐条展示，禁止用单个段落掩盖模型遗漏的富文本列表结构。
    if (
      module === "skill" &&
      field === "content" &&
      !/<(?:ul|ol)(?:\s[^>]*)?>[\s\S]*?<li(?:\s[^>]*)?>[\s\S]*?<\/li>[\s\S]*?<\/(?:ul|ol)>/i.test(value)
    ) {
      errors.push(`模块 ${module} 字段 ${field} 必须使用 <ul>/<ol> 与 <li> 逐条列举，不能写成整段`);
    }
    return;
  }
  if (rule.format === "heightWeight") {
    const dimensions = value as Record<string, unknown>;
    if (
      !dimensions ||
      typeof dimensions !== "object" ||
      Array.isArray(dimensions) ||
      typeof dimensions.height !== "number" ||
      typeof dimensions.weight !== "number" ||
      !Number.isFinite(dimensions.height) ||
      !Number.isFinite(dimensions.weight)
    ) {
      errors.push(`模块 ${module} 字段 ${field} 应为包含数字 height 和 weight 的对象`);
    }
    return;
  }
  if (rule.pattern && value !== "") {
    const pattern = new RegExp(rule.pattern.source, rule.pattern.flags);
    pattern.lastIndex = 0;
    if ((typeof value !== "string" && typeof value !== "number") || !pattern.test(String(value))) {
      errors.push(`模块 ${module} 字段 ${field} ${rule.pattern.message || "格式无效"}`);
    }
    return;
  }
  if (Array.isArray(rule.options) && rule.options.length && value !== "") {
    if (!rule.options.includes(value)) {
      errors.push(`模块 ${module} 字段 ${field} 可选值应为：${rule.options.join(" / ")}`);
    }
    return;
  }
  const invalidType =
    (rule.valueType === "string" && typeof value !== "string") ||
    (rule.valueType === "number" && (typeof value !== "number" || !Number.isFinite(value))) ||
    (rule.valueType === "array" && !Array.isArray(value)) ||
    (rule.valueType === "object" && (!value || typeof value !== "object" || Array.isArray(value)));
  if (invalidType) {
    errors.push(`模块 ${module} 字段 ${field} 应为 ${rule.valueType} 类型`);
  }
};

// 隐私标记仅用于读取，不得进入真实简历或覆盖已经脱敏的原始字段
const containsPrivacyMarker = (value: unknown): boolean => {
  if (typeof value === "string") return value.includes("[数据已脱敏]");
  if (Array.isArray(value)) return value.some(containsPrivacyMarker);
  if (value && typeof value === "object") return Object.values(value).some(containsPrivacyMarker);
  return false;
};

// 取数组模块记录
const getModuleRecords = (moduleView: { data: unknown }): any[] | null => {
  if (Array.isArray(moduleView?.data)) return moduleView.data;
  return null;
};

// 按当前字段契约把模型返回的 Markdown 或纯文本正文转换为富文本 HTML
export const normalizeResumeEdits = (
  operations: ResumeWriteOp[],
  dataView: Record<string, { title?: string; data: unknown }>,
): ResumeWriteOp[] =>
  operations.map((operation) => {
    // 无效操作保留给后续结构校验处理，归一化阶段不提前抛错
    if (!operation || typeof operation !== "object" || typeof operation.module !== "string") {
      return operation;
    }
    const moduleView = dataView?.[operation.module];
    const moduleSchema = findResumeModuleSchema(operation.module, moduleView?.data);
    const formats = new Map(moduleSchema?.fields.map((field) => [field.key, field.format]) ?? []);
    if (
      (operation.op === "updateModule" || operation.op === "updateRecord") &&
      formats.get(operation.field) === "html" &&
      typeof operation.value === "string"
    ) {
      return { ...operation, value: normalizeRichTextHtml(operation.value) };
    }
    if (
      operation.op === "addRecord" &&
      operation.record &&
      typeof operation.record === "object" &&
      !Array.isArray(operation.record)
    ) {
      const record = Object.fromEntries(
        Object.entries(operation.record).map(([field, value]) => [
          field,
          formats.get(field) === "html" && typeof value === "string"
            ? normalizeRichTextHtml(value)
            : value,
        ]),
      );
      return { ...operation, record };
    }
    return operation;
  });

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
  // 按执行顺序模拟记录变化，整批校验完成前不修改真实数据
  const workingView = JSON.parse(JSON.stringify(dataView ?? {}));
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
    const moduleView = workingView?.[op.module];
    if (typeof op.module !== "string" || !Object.prototype.hasOwnProperty.call(workingView, op.module) || !moduleView) {
      errors.push(`${order}：模块 ${op.module} 不存在于当前简历`);
      return;
    }
    // 禁止写入隐私标记，也不允许通过猜测内容替换受保护的字段
    const submittedValue = op.op === "updateModuleTitle" ? op.title
      : op.op === "addRecord" ? op.record
      : "value" in op ? op.value : undefined;
    const previousValue = op.op === "updateModuleTitle" ? moduleView.title
      : op.op === "updateRecord" ? moduleView.data?.[op.index]?.[op.field]
      : op.op === "updateModule" ? moduleView.data?.[op.field] : undefined;
    if (containsPrivacyMarker(submittedValue) || containsPrivacyMarker(previousValue)) {
      errors.push(`${order}：含脱敏标记的字段不可写入，请跳过该字段或关闭脱敏后重试`);
      return;
    }
    if (op.op === "updateModuleTitle") {
      if (typeof op.title !== "string" || !op.title.trim()) {
        errors.push(`${order}：模块标题不能为空`);
      }
      return;
    }
    // 写入校验必须跟随 read_resume_data 当前返回的数据形态
    const moduleSchema = findResumeModuleSchema(op.module, moduleView.data);
    const moduleRules = new Map(moduleSchema?.fields.map((field) => [field.key, field]) ?? []);
    const records = getModuleRecords(moduleView);
    if (op.op === "addRecord") {
      if (!records) {
        errors.push(`${order}：模块 ${op.module} 不是数组型模块，不能执行 add`);
        return;
      }
      if (!op.record || typeof op.record !== "object" || Array.isArray(op.record) || !Object.keys(op.record).length) {
        errors.push(`${order}：模块 ${op.module} 的 record 应为对象`);
        return;
      }
      const errorCount = errors.length;
      Object.entries(op.record).forEach(([field, value]) => {
        // 媒体字段不属于 AI 文本写入范围
        if (isResumeMediaField(op.module, field)) {
          errors.push(`${order}：媒体字段 ${field} 不允许由 AI 写入`);
          return;
        }
        const rule = moduleRules.get(field);
        if (!rule) {
          errors.push(`${order}：模块 ${op.module} 不存在字段 ${field}`);
          return;
        }
        validateFieldValue(op.module, field, value, rule, errors);
      });
      // 新记录按字段默认形态补齐模拟视图，后续操作可引用新增记录
      if (errors.length === errorCount) {
        const record = Object.fromEntries(moduleSchema?.fields.map((field) => [field.key,
          field.valueType === "array" ? [] : field.valueType === "object" ? {} : field.valueType === "number" ? 0 : "",
        ]) ?? []);
        records.push({ ...record, ...op.record });
      }
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
      } else {
        records.splice(op.index, 1);
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
      } else {
        const [record] = records.splice(op.from, 1);
        records.splice(op.to, 0, record);
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
    // 媒体在读取副本中被排除，禁止通过字段契约补写伪图片
    if (op.op === "updateRecord" && isResumeMediaField(op.module, op.field)) {
      errors.push(`${order}：媒体字段 ${op.field} 不允许由 AI 写入`);
      return;
    }
    const rule = moduleRules.get(op.field);
    if (!rule) {
      errors.push(`${order}：模块 ${op.module} 不存在字段 ${op.field}`);
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
      // 读取副本会裁掉空的可选字段，字段契约声明可添加时允许在记录内补填
      if (!(op.field in record) && rule?.addable !== true) {
        errors.push(`${order}：模块 ${op.module} 下标 ${op.index} 的记录不存在字段 ${op.field}`);
        return;
      }
      const errorCount = errors.length;
      validateFieldValue(op.module, op.field, op.value, rule, errors);
      if (errors.length === errorCount) record[op.field] = op.value;
      return;
    }
    const isDataObject =
      moduleView.data && typeof moduleView.data === "object" && !Array.isArray(moduleView.data);
    const data = moduleView.data as Record<string, unknown>;
    // 模块级缺失字段仅允许由表单结构中声明的可添加字段补入
    if (
      !isDataObject ||
      (!Object.prototype.hasOwnProperty.call(data, op.field) && rule?.addable !== true)
    ) {
      errors.push(`${order}：模块 ${op.module} 不存在模块级字段 ${op.field}`);
      return;
    }
    // 已存在的对象媒体字段同样保持只读
    if (isResumeMediaField(op.module, op.field)) {
      errors.push(`${order}：媒体字段 ${op.field} 不允许由 AI 写入`);
      return;
    }
    validateFieldValue(op.module, op.field, op.value, rule, errors);
  });
  return errors;
};

// 将兼容的文本错误转换为可定位、可重试的结构化校验结果
export const getResumeEditValidationIssues = (
  operations: ResumeWriteOp[],
  dataView: Record<string, { title?: string; data: unknown }>,
): ResumeEditValidationIssue[] =>
  validateResumeEdits(operations, dataView).map((message) => {
    const order = message.match(/^第 (\d+) 条操作/);
    const code = /不支持的操作类型|格式无效|必须提供/.test(message)
      ? "INVALID_OPERATION"
      : /模块 .*不存在于当前简历|不是数组型模块/.test(message)
        ? "INVALID_MODULE"
        : /不存在字段|不存在模块级字段|媒体字段/.test(message)
          ? "INVALID_FIELD"
          : "INVALID_VALUE";
    return {
      operationIndex: order ? Number(order[1]) - 1 : null,
      code,
      message,
    };
  });
