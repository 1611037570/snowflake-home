import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";

// 简历数据上下文：统一提供工具读取与请求前的头像裁剪，避免逻辑散落各处
export const useResumeContext = () => {
  const resumeStore = useResumeStore();
  const { selectedModule } = storeToRefs(resumeStore);

  // 读取当前简历数据，仅返回各模块 data，排除 UI 状态与头像、图片作品图片等大体积字段
  const getResumeData = (moduleKey?: string) => {
    const data = resumeStore.currentData;
    if (!data) return {};
    // 返回结构与 propose_resume_diff 的 patch 对齐：顶层为模块 key，模块内仅保留 data
    const result: Record<string, any> = {};
    const keys = moduleKey ? [moduleKey] : Object.keys(data);
    keys.forEach((key) => {
      const module = data[key];
      if (!module || typeof module !== "object" || !("data" in module)) return;
      const clone = JSON.parse(JSON.stringify(module.data));
      // 读取 user 模块时排除头像，避免请求体过大
      if (key === "user") delete clone.avatar;
      // 读取图片作品模块时排除作品图片，避免请求体过大
      if (key === "image" && Array.isArray(clone)) clone.forEach((item: any) => delete item?.img);
      result[key] = { data: clone };
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
