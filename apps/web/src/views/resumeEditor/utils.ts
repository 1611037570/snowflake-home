import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

const resumeStore = useResumeStore();
const { currentData } = storeToRefs(resumeStore);

/**
 * 格式化时间范围
 * @param time 时间数组 [开始时间, 结束时间] 或 [时间]
 * @returns 格式化后的时间字符串
 */
export const getTime = (time: any) => {
  if (!time || !Array.isArray(time) || time.length === 0) return "";
  if (time.length === 1) return time[0];
  return `${time[0]} - ${time[1]}`;
};

// 计算单个对象得分
export function calculateScore(obj: any) {
  if (!obj) return 0;
  const keys = Object.keys(obj);
  const totalFields = keys.length;
  if (totalFields === 0) return 0;
  const singleScore = 10 / totalFields;
  let totalScore = 0;

  for (const key of keys) {
    const value = obj[key];
    const hasContent = value != null && String(value).trim() !== "";
    if (hasContent) totalScore += singleScore;
  }
  return Math.round(totalScore);
}

// 数组评分函数（完美复用）
export function calculateListScore(list: any[]) {
  if (!Array.isArray(list) || list.length === 0) return 0;
  let totalScore = 0;
  for (const item of list) {
    totalScore += calculateScore(item);
  }
  const finalScore = totalScore / list.length;
  return Math.round(finalScore);
}

// 用户信息得分
const getUserScore = (data: any) => {
  const user = data?.user || {};
  return calculateScore(user);
};
export const userScore = computed(() => getUserScore(currentData.value));

// 教育经历得分
const getEducationScore = (data: any) => {
  const list = data?.education?.data || [];
  return calculateListScore(list);
};
export const educationScore = computed(() => getEducationScore(currentData.value));

// 技能得分
const getSkillScore = (data: any) => {
  const skill = data?.skill?.data?.trim() || "";
  return skill ? 10 : 0;
};
export const skillScore = computed(() => getSkillScore(currentData.value));

// 工作经历得分
const getWorkScore = (data: any) => {
  const list = data?.work?.data || [];
  return calculateListScore(list);
};
export const workScore = computed(() => getWorkScore(currentData.value));

// 项目经历得分
const getProjectScore = (data: any) => {
  const list = data?.project?.data || [];
  return calculateListScore(list);
};
export const projectScore = computed(() => getProjectScore(currentData.value));

// 全部成绩汇总：求和 + 总分进度（5项 每项满分10，总分满分50）
export const getAllScores = (data: any) => {
  const user = getUserScore(data);
  const education = getEducationScore(data);
  const skill = getSkillScore(data);
  const work = getWorkScore(data);
  const project = getProjectScore(data);

  // 5项，每项满分10
  const totalScore = user + education + skill + work + project;
  const totalFull = 50;
  // 进度百分比 保留2位小数
  const progress = Number(((totalScore / totalFull) * 100).toFixed(2));

  return {
    userScore: user,
    educationScore: education,
    skillScore: skill,
    workScore: work,
    projectScore: project,
    totalScore,
    totalFull,
    progress,
  };
};

// 列表模块字段 prop 对应的中文标签（addConfig.model 无 label 时兜底）
const FIELD_LABELS: Record<string, string> = {
  name: "名称",
  url: "链接",
  education: "学位",
  post: "专业",
  time: "时间",
  content: "经历",
  mode: "学制",
};

// 按路径读取数据值
const getValueByPath = (obj: any, path: any[]) => {
  let current = obj;
  for (const key of path) {
    if (current == null) return undefined;
    current = current[key];
  }
  return current;
};

// 判断字段值是否为空
const isEmptyVal = (value: any) => value == null || String(value).trim() === "";

// 收集模块缺失字段标签列表
const collectMissing = (source: any, moduleKey: string) => {
  const moduleForm = [
    ...(resumeStore.currentFixedConfig?.fields || []),
    ...(resumeStore.currentConfig?.fields || []),
  ].find((field) => field?.key === moduleKey);
  if (!moduleForm?.fields?.length) return [];
  const missing: string[] = [];

  const pushMissing = (label: string) => {
    if (label && !missing.includes(label)) missing.push(label);
  };
  // 字段中文名：优先配置 label，其次 prop 映射表，最后原样兜底
  const getLabel = (field: any, prop: string) =>
    field?.label || FIELD_LABELS[prop] || field?.name || prop || "字段";

  for (const field of moduleForm.fields) {
    // 列表型模块（教育/工作/项目/账号等）
    if (field.type === "array" && field.addConfig) {
      const itemDefs = field.addConfig.fields?.length
        ? field.addConfig.fields
        : field.addConfig.model;
      const firstSrc = itemDefs[0]?.model?.[0]?.source || itemDefs[0]?.source || [];
      // 由首字段 source 推导列表路径（'?' 前部分）
      const listPath = firstSrc.slice(0, firstSrc.indexOf("?"));
      const list = getValueByPath(source, listPath);
      if (!Array.isArray(list) || list.length === 0) {
        pushMissing(field.addConfig.name || "内容");
        continue;
      }
      list.forEach((item, index) => {
        for (const def of itemDefs) {
          const model = def?.model ? (Array.isArray(def.model) ? def.model[0] : def.model) : def;
          const src = Array.isArray(model?.source) ? model.source : [];
          if (!src.length) continue;
          const prop = model?.prop || src[src.length - 1];
          // 将 '?' 替换为数组下标后取值
          const path = src.map((k: any) => (k === "?" ? index : k));
          if (isEmptyVal(getValueByPath(source, path))) {
            pushMissing(getLabel(def, prop));
          }
        }
      });
      continue;
    }
    // 普通字段（含富文本等）
    const model = Array.isArray(field.model) ? field.model[0] : field.model;
    const src = Array.isArray(model?.source) ? model.source : [];
    if (!src.length) continue;
    const prop = model?.prop || src[src.length - 1];
    if (isEmptyVal(getValueByPath(source, src))) {
      pushMissing(field.component === "wangEditor" ? "内容" : getLabel(field, prop));
    }
  }
  return missing;
};

// 计算各简历模块进度及总进度
export const useProgress = (data: MaybeRefOrGetter<Record<string, any> | null | undefined>) => {
  return computed(() => {
    const source = toValue(data) || {};
    const list = Object.keys(source).map((key) => {
      // 用户信息直接使用根节点，其余模块取一次 data 字段
      const moduleData = key === "user" ? source[key] : source[key]?.data;
      // 模块得分（0-10）
      const score = Array.isArray(moduleData)
        ? calculateListScore(moduleData)
        : typeof moduleData === "string"
          ? moduleData.trim()
            ? 10
            : 0
          : calculateScore(moduleData);

      return {
        key,
        // 模块名称，复用 store 通用方法
        name: resumeStore.getModel(key)?.name || key,
        // 模块进度百分比（0-100），与总进度保持一致
        progress: score * 10,
        allProgress: 100,
        // 缺失字段标签列表
        missing: collectMissing(source, key),
      };
    });

    const totalScore = list.reduce((total, item) => total + item.progress, 0);
    const totalFull = list.reduce((total, item) => total + item.allProgress, 0);
    // 进度百分比 四舍五入取整
    const totalProgress = totalFull ? Math.round((totalScore / totalFull) * 100) : 0;

    return {
      list,
      totalScore,
      totalFull,
      progress: totalProgress,
    };
  });
};
