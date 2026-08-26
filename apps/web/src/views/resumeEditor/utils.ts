import { useResumeStore } from "@/stores";
import dayjs from "dayjs";
import { storeToRefs } from "pinia";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

const resumeStore = useResumeStore();
const { currentData } = storeToRefs(resumeStore);

const user = computed(() => currentData.value?.user || {});

// 计算工作年限（规则：满5个月按1年算，以此类推）
export const workYears = computed(() => {
  const workTime = user.value?.workTime;
  if (!workTime) return "";

  const startDate = dayjs(workTime);
  if (!startDate.isValid()) return "";

  const diffInMonths = dayjs().diff(startDate, "month");
  // 偏移7个月以实现：5-16个月=1年，17-28个月=2年...
  const years = Math.floor((diffInMonths + 7) / 12);

  return years > 0 ? `${years}年经验` : "";
});
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
export function getResumeTitle(data: any) {
  const defaultName = "未命名简历";
  if (!data) {
    console.log("22222222:>> ", 22222222);
    return defaultName;
  }
  const { user, education } = data;
  const name = user?.name || "";
  const edu = education?.data?.[0]?.education || "";
  const position = user?.position || "";
  return [name, edu, position, workYears.value].filter(Boolean).join("-") || defaultName;
}
/**
 * 生成简历标题
 * @returns 简历标题字符串
 */
export const resumeTitle = computed(() => {
  const data = currentData.value;
  return getResumeTitle(data);
});

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

// 计算各简历模块进度及总进度
export const useProgress = (
  data: MaybeRefOrGetter<Record<string, any> | null | undefined>,
) => {
  return computed(() => {
    const source = toValue(data) || {};
    const list = Object.keys(source).map((key) => {
      // 用户信息直接使用根节点，其余模块取一次 data 字段
      const moduleData = key === "user" ? source[key] : source[key]?.data;
      const progress = Array.isArray(moduleData)
        ? calculateListScore(moduleData)
        : typeof moduleData === "string"
          ? moduleData.trim()
            ? 10
            : 0
          : calculateScore(moduleData);

      return {
        key,
        progress,
        allProgress: 10,
      };
    });

    const totalScore = list.reduce((total, item) => total + item.progress, 0);
    const totalFull = list.reduce((total, item) => total + item.allProgress, 0);
    const totalProgress = totalFull
      ? Number(((totalScore / totalFull) * 100).toFixed(2))
      : 0;

    return {
      list,
      totalScore,
      totalFull,
      progress: totalProgress,
    };
  });
};
