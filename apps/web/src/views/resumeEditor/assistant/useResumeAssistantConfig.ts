// 简历助手宿主配置：组装技能与工具后由调用方传给 chat，chat 不内置简历业务
import { useResumeStore } from "@/stores";
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { onDemandSkills } from "./skills/registry";
import { createSkillTools } from "./skills/skillTools";
import { createResumeTools } from "./tools";
import type { AssistantConfig } from "./types";

// 组装简历域配置，applyDiff 由上层预览草稿注入
export const useResumeAssistantConfig = (
  applyDiff?: (patch: Record<string, any>) => string[],
): AssistantConfig => {
  const resumeStore = useResumeStore();
  const { selectedModule, currentConfig, currentData, isGenerating } = storeToRefs(resumeStore);
  const { getModel } = resumeStore;
  // 停用开始
  // 字段解析：有选中模块时只解析选中模块，否则解析全部模块
  const fieldAnalysis = computed(() => {
    let text = `data第一层字段解析: `;
    if (selectedModule.value.length) {
      text += selectedModule.value.map((item) => `${item.key}:${item.name}`).join("、");
    } else {
      // 先获取所有字段的模型
      const models = currentConfig.value.fields.map((item: any) => getModel(item.key));
      // 拼接所有字段的解析
      text += models.map((item: any) => `${item.key}:${item.name}`).join("、");
    }
    const lastText =
      "，最后一层字段的content都是HTML 字符串，不要改为MD格式。我们支持标签：p, br, strong, b, em, i, u, ul, ol, li, a, span这些标签。";
    return text + lastText;
  });

  // 用户内容：选中模块时只携带对应模块数据，否则携带整份简历
  const userData = computed(() => {
    let data: any = {};
    if (selectedModule.value.length) {
      selectedModule.value.forEach((item) => {
        data[item.key] = currentData.value[item.key];
      });
    } else {
      data = currentData.value;
    }
    return `data: ${JSON.stringify(data)}\n    `;
  });
  // 停用结束
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

  // 选中整个模块或 user 模块时，临时清除头像避免请求体过大，请求结束还原
  let trimState: { need: boolean; saved: string | undefined } | null = null;
  const beforeRequest = () => {
    const data = resumeStore.currentData;
    const need =
      !selectedModule.value.length || selectedModule.value.some((item: any) => item.key === "user");
    if (!need || !data?.user?.data) return;
    trimState = { need, saved: data.user.data.avatar };
    delete data.user.data.avatar;
  };
  const afterRequest = () => {
    if (!trimState) return;
    const data = resumeStore.currentData;
    if (data?.user?.data) data.user.data.avatar = trimState.saved;
    trimState = null;
  };

  // 拼接简历数据与字段解析到最后一条用户消息
  const buildUserContent = (content: string) => `${content}`;

  return {
    generating: isGenerating,
    tools: [
      // 按需技能注册为只读工具，需要时由模型调用获取全文
      ...createSkillTools(onDemandSkills.map((createSkill) => createSkill())),
      ...createResumeTools({
        getResumeData,
        applyDiff: applyDiff ?? (() => []),
      }),
    ],
    applyResult: (data) => applyDiff?.(data),
    beforeRequest,
    afterRequest,
    buildUserContent,
  };
};
