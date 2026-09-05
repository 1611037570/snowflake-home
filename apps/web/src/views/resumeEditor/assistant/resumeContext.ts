import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";

// 简历数据上下文：统一提供工具读取与请求前的头像裁剪，避免逻辑散落各处
export const useResumeContext = () => {
  const resumeStore = useResumeStore();
  const { selectedModule } = storeToRefs(resumeStore);

  // 读取当前简历数据，按需裁剪模块，并排除头像等大体积字段
  const getResumeData = (moduleKey?: string) => {
    const data = resumeStore.currentData;
    if (!data) return {};
    const source = moduleKey ? data[moduleKey] : data;
    if (source == null) return {};
    const clone = JSON.parse(JSON.stringify(source));
    if (moduleKey === "user") delete clone.data?.avatar;
    if (!moduleKey && clone.user?.data) delete clone.user.data.avatar;
    return clone;
  };

  // 整份或 user 模块请求时，临时清除头像避免请求体过大，请求结束后还原
  let trimState: { saved: string | undefined } | null = null;
  const beforeRequest = () => {
    const data = resumeStore.currentData;
    const need =
      !selectedModule.value.length ||
      selectedModule.value.some((item: any) => item.key === "user");
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
