import { useResumeStore } from "@/stores";
const resumeStore = useResumeStore();
const { selectedModule, currentConfig, currentData } = storeToRefs(resumeStore);
const { getModel } = resumeStore;

// 字段解析
export const fieldAnalysis = computed(() => {
  let text = `data第一层字段解析: `;
  // 有选中的模块时，拼接模块解析
  if (selectedModule.value.length) {
    text += selectedModule.value.map((item) => `${item.key}:${item.name}`).join("、");
  } else {
    // 先获取所有字段的模型
    const models = currentConfig.value.fields.map((item: any) => getModel(item.key));
    // 拼接所有字段的解析
    text += models.map((item: any) => `${item.key}:${item.name}`).join("、");
  }
  return text;
});

// 用户内容
export const userData = computed(() => {
  let data: any = {};
  if (selectedModule.value.length) {
    // 有选中的模块时，取出选中模块的数据
    selectedModule.value.forEach((item) => {
      data[item.key] = currentData.value[item.key];
    });
  } else {
    data = currentData.value;
  }
  const prompt = `data: ${JSON.stringify(data)}
    `;
  return prompt;
});
