import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";

// 简历数据上下文：统一提供工具读取与请求前的头像裁剪，避免逻辑散落各处
export const useResumeContext = () => {
  const resumeStore = useResumeStore();
  const { selectedModule, desensitizeMode } = storeToRefs(resumeStore);

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

  // 读取当前简历数据：跟随用户在 AI 助手里的模块选择；未选择任何模块时返回整份简历
  const getResumeData = () => {
    const data = resumeStore.currentData;
    if (!data) return {};
    const result: Record<string, any> = {};
    const selectedKeys = selectedModule.value.map((item) => item.key);
    const keys = selectedKeys.length ? selectedKeys : Object.keys(data);
    keys.forEach((key) => {
      const module = data[key];
      if (!module || typeof module !== "object" || !("data" in module)) return;
      const clone = JSON.parse(JSON.stringify(module.data));
      // 读取 user 模块时排除头像，避免请求体过大
      if (key === "user") delete clone.avatar;
      // 开启脱敏时不上传姓名、手机号和邮箱
      if (key === "user" && desensitizeMode.value) {
        delete clone.name;
        delete clone.phone;
        delete clone.email;
      }
      // 读取图片作品模块时排除作品图片，避免请求体过大
      if (key === "image" && Array.isArray(clone)) clone.forEach((item: any) => delete item?.img);
      // 排除记录 UI 状态，避免 AI 误读或写回折叠字段
      result[key] = { data: stripRecordUiState(clone) };
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
