import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { omitMediaFromData } from "@/stores/modules/resume/config/mediaFields";

// 简历数据上下文：统一提供读取范围、媒体裁剪与隐私脱敏
export const useResumeContext = () => {
  const resumeStore = useResumeStore();
  const { selectedModule, desensitizeMode } = storeToRefs(resumeStore);
  const PHONE_PATTERN = /1[3-9]\d{9}/g;
  const EMAIL_PATTERN = /[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}/g;
  const DESENSITIZED_TEXT = "[数据已脱敏]";

  // 脱敏文本中的敏感值，严格模式同时覆盖正文里的公司与学校名称
  const sanitizeSensitiveText = (value: string, sensitiveValues: string[]) => {
    let result = value
      .replace(EMAIL_PATTERN, DESENSITIZED_TEXT)
      .replace(PHONE_PATTERN, DESENSITIZED_TEXT);
    sensitiveValues.forEach((item) => {
      result = result.split(item).join(DESENSITIZED_TEXT);
    });
    return result;
  };

  // 严格脱敏时额外标记工作与教育名称
  const sanitizeNestedData = (value: any, sensitiveValues: string[], removeOrganizationName: boolean): any => {
    if (typeof value === "string") return sanitizeSensitiveText(value, sensitiveValues);
    if (Array.isArray(value)) {
      return value.map((item) => sanitizeNestedData(item, sensitiveValues, removeOrganizationName));
    }
    if (!value || typeof value !== "object") return value;
    const next: Record<string, any> = {};
    Object.entries(value).forEach(([key, item]) => {
      if (removeOrganizationName && key === "name" && item) {
        next[key] = DESENSITIZED_TEXT;
        return;
      }
      next[key] = sanitizeNestedData(item, sensitiveValues, removeOrganizationName);
    });
    return next;
  };

  // 读取当前简历数据：跟随用户在 AI 助手里的模块选择；未选择任何模块时返回整份简历
  let forceFullResume = false;
  // 请求开始后冻结选择与脱敏等级，工具重读不得扩大本轮授权范围
  let requestModuleKeys: string[] | null = null;
  let requestDesensitizeMode: typeof desensitizeMode.value | null = null;
  const getResumeData = () => {
    const data = resumeStore.currentData;
    if (!data) return {};
    const result: Record<string, any> = {};
    const mode = requestDesensitizeMode ?? desensitizeMode.value;
    const shouldDesensitize = !mode.disabled;
    const strict = shouldDesensitize && mode.level === "strict";
    // 普通脱敏覆盖个人信息中的敏感字段，保留职业判断所需的方向、学历与经历
    const sensitiveFields = [
      "name", // 姓名
      "phone", // 电话
      "email", // 邮箱
      "wechat", // 微信账号
      "birthday", // 出生日期
      "sex", // 性别
      "marital", // 婚姻状况
      "nation", // 民族
      "political", // 政治面貌
      "nativePlace", // 籍贯
      "sourcePlace", // 生源地
      "heightWeight", // 身高体重
      "measurements", // 身体围度
      "sizes", // 穿着尺码
    ];
    const sensitiveValues = sensitiveFields
      .filter((field) => ["name", "phone", "email", "wechat"].includes(field))
      .map((field) => data.user?.data?.[field])
      .filter((value): value is string => typeof value === "string" && !!value.trim());
    if (strict) {
      ["work", "education"].forEach((key) => {
        data[key]?.list?.forEach((record: any) => {
          const name = record.data?.name;
          if (typeof name === "string" && name.trim()) sensitiveValues.push(name);
        });
      });
    }
    // 长值优先替换，避免短名称截断完整敏感值
    sensitiveValues.sort((a, b) => b.length - a.length);
    const selectedKeys = requestModuleKeys ?? selectedModule.value.map((item) => item.key);
    const keys = forceFullResume || !selectedKeys.length ? Object.keys(data) : selectedKeys;
    keys.forEach((key) => {
      const module = data[key];
      if (!module || typeof module !== "object" || !("data" in module || "list" in module)) return;
      // 媒体字段只从模块副本移除，保留原简历中的头像与作品图片
      const moduleClone = omitMediaFromData({ [key]: JSON.parse(JSON.stringify(module)) })[key];
      // 数组记录只向 AI 暴露业务 data，不携带编辑器 ui 状态
      const clone = Array.isArray(moduleClone.list)
        ? moduleClone.list.map((record: any) => record.data)
        : moduleClone.data;
      const title = module.ui?.title || resumeStore.getModel(key)?.name || key;
      const removeOrganizationName = strict && ["work", "education"].includes(key);
      const sanitized = shouldDesensitize
        ? sanitizeNestedData(clone, sensitiveValues, removeOrganizationName)
        : clone;
      // 敏感字段整体标记，兼容非字符串字段以及不符合正则的电话号码
      if (shouldDesensitize && key === "user" && sanitized) {
        sensitiveFields.forEach((field) => {
          if (sanitized[field] != null && sanitized[field] !== "") sanitized[field] = DESENSITIZED_TEXT;
        });
      }
      result[key] = {
        // 模块标题也可能含有用户姓名或组织名称
        title: shouldDesensitize ? sanitizeSensitiveText(title, sensitiveValues) : title,
        // 已裁剪媒体并按本轮等级脱敏的业务数据
        data: sanitized,
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
    requestDesensitizeMode = { ...desensitizeMode.value };
    activeForceFullTask = taskId;
  };
  const afterRequest = (taskId = "default") => {
    if (taskId === activeForceFullTask) {
      forceFullResume = false;
      requestModuleKeys = null;
      requestDesensitizeMode = null;
      activeForceFullTask = "";
    }
  };

  return { getResumeData, beforeRequest, afterRequest };
};
