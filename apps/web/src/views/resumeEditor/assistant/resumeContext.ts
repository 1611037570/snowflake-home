import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";

// 简历数据上下文：统一提供工具读取与请求前的头像裁剪，避免逻辑散落各处
export const useResumeContext = () => {
  const resumeStore = useResumeStore();
  const { selectedModule, desensitizeMode } = storeToRefs(resumeStore);
  const NORMAL_USER_SENSITIVE_KEYS = ["name", "phone", "email"];
  const PHONE_PATTERN = /1[3-9]\d{9}/g;
  const EMAIL_PATTERN = /[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}/g;
  const DESENSITIZED_TEXT = "[数据已脱敏]";

  // 发送给 AI 的记录内 UI 状态字段：AI 不需要也不应修改
  // collapsed：记录在编辑区的折叠状态，不参与内容翻译与优化
  const RECORD_UI_KEYS = ["collapsed"];

  // 递归剔除记录内 UI 状态字段，保留简历内容结构
  const stripRecordUiState = (value: any): any => {
    if (Array.isArray(value)) return value.map(stripRecordUiState);
    if (value && typeof value === "object") {
      const next: Record<string, any> = {};
      Object.entries(value).forEach(([key, item]) => {
        if (RECORD_UI_KEYS.includes(key)) return;
        next[key] = stripRecordUiState(item);
      });
      return next;
    }
    return value;
  };

  // 脱敏文本中的姓名、手机号和邮箱，避免敏感信息藏在经历描述中
  const sanitizeSensitiveText = (value: string, name: string) => {
    let result = value.replace(EMAIL_PATTERN, DESENSITIZED_TEXT).replace(PHONE_PATTERN, DESENSITIZED_TEXT);
    if (name) result = result.split(name).join(DESENSITIZED_TEXT);
    return result;
  };

  // 严格脱敏时额外标记工作与教育名称
  const sanitizeNestedData = (
    value: any,
    name: string,
    removeOrganizationName: boolean,
  ): any => {
    if (typeof value === "string") return sanitizeSensitiveText(value, name);
    if (Array.isArray(value)) {
      return value.map((item) =>
        sanitizeNestedData(item, name, removeOrganizationName),
      );
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
  const getResumeData = () => {
    const data = resumeStore.currentData;
    if (!data) return {};
    const result: Record<string, any> = {};
    const userName = typeof data.user?.data?.name === "string" ? data.user.data.name : "";
    const selectedKeys = selectedModule.value.map((item) => item.key);
    const keys = selectedKeys.length ? selectedKeys : Object.keys(data);
    keys.forEach((key) => {
      const module = data[key];
      if (!module || typeof module !== "object" || !("data" in module)) return;
      const clone = JSON.parse(JSON.stringify(module.data));
      const title = module.ui?.title || resumeStore.getModel(key)?.name || key;
      const shouldDesensitize = !desensitizeMode.value.disabled;
      const strict = shouldDesensitize && desensitizeMode.value.level === "strict";
      // 读取 user 模块时排除头像，避免请求体过大
      if (key === "user") delete clone.avatar;
      // 普通脱敏标记直接身份字段，严格脱敏额外标记公司和学校名称
      if (key === "user" && shouldDesensitize) {
        NORMAL_USER_SENSITIVE_KEYS.forEach((field) => {
          if (field in clone) clone[field] = DESENSITIZED_TEXT;
        });
      }
      // 读取图片作品模块时排除作品图片，避免请求体过大
      if (key === "image" && Array.isArray(clone)) clone.forEach((item: any) => delete item?.img);
      const removeOrganizationName = strict && ["work", "education"].includes(key);
      const sanitized = shouldDesensitize
        ? sanitizeNestedData(clone, userName, removeOrganizationName)
        : clone;
      // 排除记录 UI 状态，避免 AI 误读或写回折叠字段
      result[key] = { title, data: stripRecordUiState(sanitized) };
    });
    return result;
  };

  // 整份或 user 模块请求时，临时清除头像避免请求体过大，请求结束后还原
  let trimState: { saved: string | undefined } | null = null;
  const beforeRequest = () => {
    const data = resumeStore.currentData;
    const need =
      !selectedModule.value.length || selectedModule.value.some((item: any) => item.key === "user");
    if (!need || !data?.user?.data) return;
    trimState = { saved: data.user.data.avatar };
    delete data.user.data.avatar;
  };
  const afterRequest = () => {
    if (!trimState) return;
    const data = resumeStore.currentData;
    if (data?.user?.data) data.user.data.avatar = trimState.saved;
    trimState = null;
  };

  return { getResumeData, beforeRequest, afterRequest };
};
