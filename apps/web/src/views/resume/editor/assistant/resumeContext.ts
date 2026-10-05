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

  // 脱敏文本中的姓名、手机号和邮箱，避免敏感信息藏在经历描述中
  const sanitizeSensitiveText = (value: string, name: string) => {
    let result = value
      .replace(EMAIL_PATTERN, DESENSITIZED_TEXT)
      .replace(PHONE_PATTERN, DESENSITIZED_TEXT);
    if (name) result = result.split(name).join(DESENSITIZED_TEXT);
    return result;
  };

  // 严格脱敏时额外标记工作与教育名称
  const sanitizeNestedData = (value: any, name: string, removeOrganizationName: boolean): any => {
    if (typeof value === "string") return sanitizeSensitiveText(value, name);
    if (Array.isArray(value)) {
      return value.map((item) => sanitizeNestedData(item, name, removeOrganizationName));
    }
    if (!value || typeof value !== "object") return value;
    const next: Record<string, any> = {};
    Object.entries(value).forEach(([key, item]) => {
      if (removeOrganizationName && key === "name") {
        next[key] = DESENSITIZED_TEXT;
        return;
      }
      next[key] = sanitizeNestedData(item, name, removeOrganizationName);
    });
    return next;
  };

  // 读取当前简历数据：跟随用户在 AI 助手里的模块选择；未选择任何模块时返回整份简历
  let forceFullResume = false;
  const getResumeData = () => {
    const data = resumeStore.currentData;
    if (!data) return {};
    const result: Record<string, any> = {};
    const userName = typeof data.user?.data?.name === "string" ? data.user.data.name : "";
    const selectedKeys = selectedModule.value.map((item) => item.key);
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
      const shouldDesensitize = !desensitizeMode.value.disabled;
      const strict = shouldDesensitize && desensitizeMode.value.level === "strict";
      const removeOrganizationName = strict && ["work", "education"].includes(key);
      const sanitized = shouldDesensitize
        ? sanitizeNestedData(clone, userName, removeOrganizationName)
        : clone;
      result[key] = { title, data: sanitized };
    });
    return result;
  };

  // 请求生命周期只控制读取范围，不临时修改原简历数据
  let activeForceFullTask = "";
  const beforeRequest = (context?: Record<string, unknown>, taskId = "default") => {
    // 一键优化在用户授权后固定读取整份简历，避免生成期间受模块选择变化影响
    forceFullResume = context?.resumeScope === "all";
    activeForceFullTask = taskId;
  };
  const afterRequest = (taskId = "default") => {
    if (taskId === activeForceFullTask) {
      forceFullResume = false;
      activeForceFullTask = "";
    }
  };

  return { getResumeData, beforeRequest, afterRequest };
};
