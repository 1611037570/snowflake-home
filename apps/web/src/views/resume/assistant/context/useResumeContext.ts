import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { omitMediaFromData } from "@/stores/modules/resume/config/mediaFields";
import {
  normalizeDesensitizeFields,
  type DesensitizeField,
} from "@/stores/modules/resume/config/desensitizeConfig";
import { findResumeModuleSchema, type ResumeDataContext } from "@snowflake/resume-agent";
import { isContentEmpty } from "@/views/resume/shared/validData";

// 按字段路径读取模块当前生效的数据形态
const getValueByPath = (source: any, path: string[]) =>
  path.reduce((value, key) => value?.[key], source);

// 简历数据上下文：统一提供读取范围、媒体裁剪与隐私脱敏
export const useResumeContext = (): ResumeDataContext => {
  const resumeStore = useResumeStore();
  const { selectedModule, desensitizeMode } = storeToRefs(resumeStore);
  const PHONE_PATTERN = /1[3-9]\d{9}/g;
  const EMAIL_PATTERN = /[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}/g;
  const DESENSITIZED_TEXT = "[数据已脱敏]";

  // 脱敏文本中用户已选敏感值，包含正文中的相同内容
  const sanitizeSensitiveText = (
    value: string,
    sensitiveValues: string[],
    selectedFields: Set<DesensitizeField>,
  ) => {
    let result = value;
    if (selectedFields.has("email")) result = result.replace(EMAIL_PATTERN, DESENSITIZED_TEXT);
    if (selectedFields.has("phone")) result = result.replace(PHONE_PATTERN, DESENSITIZED_TEXT);
    sensitiveValues.forEach((item) => {
      result = result.split(item).join(DESENSITIZED_TEXT);
    });
    return result;
  };

  // 用户选择单位名称时额外标记工作与教育记录中的名称字段
  const sanitizeNestedData = (
    value: any,
    sensitiveValues: string[],
    selectedFields: Set<DesensitizeField>,
    removeOrganizationName: boolean,
  ): any => {
    if (typeof value === "string") return sanitizeSensitiveText(value, sensitiveValues, selectedFields);
    if (Array.isArray(value)) {
      return value.map((item) => sanitizeNestedData(item, sensitiveValues, selectedFields, removeOrganizationName));
    }
    if (!value || typeof value !== "object") return value;
    const next: Record<string, any> = {};
    Object.entries(value).forEach(([key, item]) => {
      if (removeOrganizationName && key === "name" && item) {
        next[key] = DESENSITIZED_TEXT;
        return;
      }
      next[key] = sanitizeNestedData(item, sensitiveValues, selectedFields, removeOrganizationName);
    });
    return next;
  };

  // 读取副本的空白判断：富文本、普通字符串、数组与复合对象统一按无内容处理
  const isEmptyValue = (value: unknown): boolean =>
    value == null ||
    (typeof value === "string" && isContentEmpty(value)) ||
    (Array.isArray(value) && value.every(isEmptyValue)) ||
    (typeof value === "object" && Object.values(value).every(isEmptyValue));

  // 读取副本去掉空的可选字段，避免 AI 把用户没填的字段当成已填写
  const omitEmptyOptionalFields = (data: any, fields: any[] = []) => {
    const optionalPaths = fields
      .filter((field) => !field.required)
      .map((field) => (field.path?.[0] === "data" ? field.path.slice(1) : field.path || []))
      .filter((path) => path.length);
    const prune = (record: any) => {
      for (const path of optionalPaths) {
        let parent = record;
        for (let index = 0; index < path.length - 1; index += 1) {
          parent = parent?.[path[index]];
          if (parent == null) break;
        }
        if (parent == null) continue;
        const key = path[path.length - 1];
        if (Object.prototype.hasOwnProperty.call(parent, key) && isEmptyValue(parent[key])) {
          delete parent[key];
        }
      }
    };
    if (Array.isArray(data)) data.forEach(prune);
    else if (data && typeof data === "object") prune(data);
    return data;
  };

  // 读取当前简历数据：跟随用户在 AI 助手里的模块选择；未选择任何模块时返回整份简历
  let forceFullResume = false;
  // 请求开始后冻结模块与脱敏字段选择，工具重读不得扩大本轮授权范围
  let requestModuleKeys: string[] | null = null;
  let requestDesensitizeFields: DesensitizeField[] | null = null;
  const getResumeData = () => {
    const data = resumeStore.currentData;
    if (!data) return {};
    const result: Record<string, any> = {};
    const selectedFields = requestDesensitizeFields ?? normalizeDesensitizeFields(desensitizeMode.value);
    const selectedFieldSet = new Set<DesensitizeField>(selectedFields);
    const shouldDesensitize = selectedFields.length > 0;
    const personalFields = selectedFields.filter(
      (field) => field !== "workOrganization" && field !== "educationOrganization",
    );
    const sensitiveValues = personalFields
      .filter((field) => ["name", "phone", "email", "wechat"].includes(field))
      .map((field) => data.user?.data?.[field])
      .filter((value): value is string => typeof value === "string" && !!value.trim());
    [
      { key: "work", field: "workOrganization" },
      { key: "education", field: "educationOrganization" },
    ].forEach(({ key, field }) => {
      if (selectedFieldSet.has(field as DesensitizeField)) {
        data[key]?.list?.forEach((record: any) => {
          const name = record.data?.name;
          if (typeof name === "string" && name.trim()) sensitiveValues.push(name);
        });
      }
    });
    // 长值优先替换，避免短名称截断完整敏感值
    sensitiveValues.sort((a, b) => b.length - a.length);
    const selectedKeys = requestModuleKeys ?? selectedModule.value.map((item) => item.key);
    const keys = forceFullResume || !selectedKeys.length ? Object.keys(data) : selectedKeys;
    keys.forEach((key) => {
      const module = data[key];
      if (!module || typeof module !== "object" || !("data" in module || "list" in module)) return;
      // 媒体字段只从模块副本移除，保留原简历中的头像与作品图片
      const moduleClone = omitMediaFromData({ [key]: JSON.parse(JSON.stringify(module)) })[key];
      const layout = (resumeStore.currentUI as any)?.[key]?.layout;
      const moduleSchema = findResumeModuleSchema(key, undefined, layout);
      const activeData = moduleSchema
        ? getValueByPath(moduleClone, moduleSchema.dataPath)
        : moduleClone.data;
      // 当前形态为数组时只向 AI 暴露业务 data，不携带编辑器 ui 状态
      const clone = Array.isArray(activeData)
        ? activeData.map((record: any) => record.data)
        : activeData;
      // 按当前数据形态解析字段填写口径，供可选字段裁剪使用
      const activeSchema = findResumeModuleSchema(key, clone, layout);
      const title = module.ui?.title || resumeStore.getModel(key)?.name || key;
      const removeOrganizationName =
        (key === "work" && selectedFieldSet.has("workOrganization")) ||
        (key === "education" && selectedFieldSet.has("educationOrganization"));
      const sanitized = shouldDesensitize
        ? sanitizeNestedData(clone, sensitiveValues, selectedFieldSet, removeOrganizationName)
        : clone;
      // 敏感字段整体标记，兼容非字符串字段以及不符合正则的电话号码
      if (shouldDesensitize && key === "user" && sanitized) {
        personalFields.forEach((field) => {
          if (sanitized[field] != null && sanitized[field] !== "") sanitized[field] = DESENSITIZED_TEXT;
        });
      }
      result[key] = {
        // 模块标题也可能含有用户姓名或组织名称
        title: shouldDesensitize ? sanitizeSensitiveText(title, sensitiveValues, selectedFieldSet) : title,
        // 数组记录的字段集合即真实字段集合，保留空值以保证读取与补填口径一致；
        // 对象模块仍裁剪空的可选字段，避免 AI 把未填字段当成已填写。
        data: Array.isArray(sanitized)
          ? sanitized
          : omitEmptyOptionalFields(sanitized, activeSchema?.fields),
      };
    });
    return result;
  };

  // 请求生命周期只控制读取范围，不临时修改原简历数据
  let activeForceFullTask = "";
  const beforeRequest = (context?: Record<string, unknown>, taskId = "default") => {
    // 一键优化在用户授权后固定读取整份简历，避免生成期间受模块选择变化影响
    forceFullResume = context?.resumeScope === "all";
    // 字段快捷操作显式指定本轮模块，其余请求沿用用户选择
    requestModuleKeys = Array.isArray(context?.resumeModuleKeys)
      ? context.resumeModuleKeys.filter((key): key is string => typeof key === "string")
      : selectedModule.value.map((item) => item.key);
    requestDesensitizeFields = normalizeDesensitizeFields(desensitizeMode.value);
    activeForceFullTask = taskId;
  };
  const afterRequest = (taskId = "default") => {
    if (taskId === activeForceFullTask) {
      forceFullResume = false;
      requestModuleKeys = null;
      requestDesensitizeFields = null;
      activeForceFullTask = "";
    }
  };

  return { getResumeData, beforeRequest, afterRequest };
};
