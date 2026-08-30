import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

const resumeStore = useResumeStore();
const { currentData } = storeToRefs(resumeStore);

/**
 * 设置模块隐藏状态：按字段显隐路径将对应数据置值（true 隐藏 / false 恢复）
 * @param data 简历数据
 * @param field 字段配置（含 checks.hidden.path）
 * @param value 目标隐藏状态
 */
export const setFieldHidden = (data: any, field: any, value: boolean) => {
  const path = field.checks?.hidden?.path;
  if (!path?.length) return;
  let cur = data;
  for (let i = 0; i < path.length - 1; i++) {
    cur = cur?.[path[i]];
  }
  if (cur) cur[path[path.length - 1]] = value;
};

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

// 判断字段值是否为空（富文本为空时会序列化为 <p><br></p> 等空 HTML，同样视为空）
const isEmptyVal = (value: any) => {
  const str = String(value ?? "").trim();
  return str === "" || str === "<p><br></p>" || str === "<p><br/></p>";
};

// 分析模块必填字段：收集缺失标签并计算必填完成度得分（0-10）
const analyzeModule = (source: any, moduleKey: string) => {
  const moduleForm = [
    ...(resumeStore.currentFixedConfig?.fields || []),
    ...(resumeStore.currentConfig?.fields || []),
  ].find((field) => field?.key === moduleKey);
  // 无对应配置的模块（如数据残留）：无必填统计依据，按未完成计分
  if (!moduleForm?.fields?.length) {
    return { missing: [], score: 0 };
  }
  const missing: string[] = [];
  // 必填字段完成统计（完成数 / 必填总数）
  const stat = { done: 0, total: 0 };

  const pushMissing = (label: string) => {
    if (label && !missing.includes(label)) missing.push(label);
  };
  // 字段中文名：优先配置 label，其次 prop 映射表，最后原样兜底
  const getLabel = (field: any, prop: string) =>
    field?.label || FIELD_LABELS[prop] || field?.name || prop || "字段";
  // 计入必填字段完成度
  const statField = (isFilled: boolean) => {
    stat.total += 1;
    if (isFilled) stat.done += 1;
  };

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
        // 列表为空：必填子项均未填写
        itemDefs.forEach((def: any) => {
          if (def.required !== true) return;
          statField(false);
        });
        pushMissing(field.addConfig.name || "内容");
        continue;
      }
      list.forEach((item, index) => {
        for (const def of itemDefs) {
          // 只统计必填子项字段
          if (def.required !== true) continue;
          const model = def?.model ? (Array.isArray(def.model) ? def.model[0] : def.model) : def;
          const src = Array.isArray(model?.source) ? model.source : [];
          if (!src.length) continue;
          const prop = model?.prop || src[src.length - 1];
          // 将 '?' 替换为数组下标后取值
          const path = src.map((k: any) => (k === "?" ? index : k));
          const isFilled = !isEmptyVal(getValueByPath(source, path));
          statField(isFilled);
          if (!isFilled) pushMissing(getLabel(def, prop));
        }
      });
      continue;
    }
    // 普通字段（含富文本等）：只统计必填字段
    if (field.required !== true) continue;
    const model = Array.isArray(field.model) ? field.model[0] : field.model;
    const src = Array.isArray(model?.source) ? model.source : [];
    if (!src.length) continue;
    const prop = model?.prop || src[src.length - 1];
    const isFilled = !isEmptyVal(getValueByPath(source, src));
    statField(isFilled);
    if (!isFilled) {
      pushMissing(field.component === "wangEditor" ? "内容" : getLabel(field, prop));
    }
  }
  // 得分：必填字段完成度 × 10；无必填字段的模块不视为已完成
  const score = stat.total ? Math.round((stat.done / stat.total) * 10) : 0;
  return { missing, score };
};

// 各模块必填完成度得分（0-10）：统一基于必填字段统计
export const userScore = computed(() => analyzeModule(currentData.value, "user").score);
export const educationScore = computed(() => analyzeModule(currentData.value, "education").score);
export const skillScore = computed(() => analyzeModule(currentData.value, "skill").score);
export const workScore = computed(() => analyzeModule(currentData.value, "work").score);
export const projectScore = computed(() => analyzeModule(currentData.value, "project").score);

// 全部成绩汇总：必填完成度得分求和 + 总分进度（5项 每项满分10，总分满分50）
export const getAllScores = (data: any) => {
  const user = analyzeModule(data, "user").score;
  const education = analyzeModule(data, "education").score;
  const skill = analyzeModule(data, "skill").score;
  const work = analyzeModule(data, "work").score;
  const project = analyzeModule(data, "project").score;

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
export const useProgress = (data: MaybeRefOrGetter<Record<string, any> | null | undefined>) => {
  return computed(() => {
    const source = toValue(data) || {};
    const list = Object.keys(source).map((key) => {
      // 必填字段分析：缺失标签 + 必填完成度得分
      const { missing, score } = analyzeModule(source, key);
      return {
        key,
        // 模块名称，复用 store 通用方法
        name: resumeStore.getModel(key)?.name || key,
        // 模块进度百分比（0-100），与总进度保持一致
        progress: score * 10,
        allProgress: 100,
        // 缺失字段标签列表
        missing,
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

// 时间线一致性检查：相邻经历间隔超过该月数视为「间隙过大」
const GAP_THRESHOLD_MONTHS = 6;

// 将 "YYYY.MM" 解析为累计月数，用于比较与计算间隔
const parseMonth = (str: any) => {
  if (typeof str !== "string") return null;
  const match = str.match(/^(\d{4})\.(\d{1,2})$/);
  if (!match) return null;
  return Number(match[1]) * 12 + Number(match[2]);
};

// 将累计月数格式化为「X年Y个月」文案
const formatGap = (months: number) => {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years && rest) return `${years}年${rest}个月`;
  if (years) return `${years}年`;
  return `${rest}个月`;
};

// 时间线一致性检查：检测工作/教育/项目等模块时间重叠与过大间隙
export const useTimelineCheck = (
  data: MaybeRefOrGetter<Record<string, any> | null | undefined>,
) => {
  return computed(() => {
    const source = toValue(data) || {};
    const list: any[] = [];

    Object.keys(source).forEach((key) => {
      const items = Array.isArray(source[key]?.data) ? source[key].data : [];
      if (!items.length) return;

      // 解析含有效起止时间的条目
      const entries = items
        .map((item: any, index: number) => {
          const time = Array.isArray(item?.time) ? item.time : [];
          const start = parseMonth(time[0]);
          const end = parseMonth(time[1] ?? time[0]);
          return { item, index, name: item?.name || "", time, start, end };
        })
        .filter((e: any) => e.start != null && e.end != null);
      if (!entries.length) return;

      // 按开始时间排序，保证重叠与间隙判断顺序稳定
      const sorted = [...entries].sort((a: any, b: any) => a.start - b.start);
      const issues: any[] = [];

      // 重叠检测：任一条目开始时间早于另一条目结束时间即视为重叠
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          if (sorted[j].start < sorted[i].end) {
            issues.push({
              type: "overlap",
              text: `「${sorted[j].name || "未命名"}」(${getTime(sorted[j].time)}) 与「${sorted[i].name || "未命名"}」(${getTime(sorted[i].time)}) 时间重叠，请核对`,
            });
          }
        }
      }

      // 间隙检测：相邻条目结束与开始之间超过阈值
      for (let i = 0; i < sorted.length - 1; i++) {
        const gap = sorted[i + 1].start - sorted[i].end;
        if (gap > GAP_THRESHOLD_MONTHS) {
          issues.push({
            type: "gap",
            text: `「${sorted[i + 1].name || "未命名"}」与上一段「${sorted[i].name || "未命名"}」之间存在 ${formatGap(gap)} 空档，可考虑补充或说明`,
          });
        }
      }

      if (issues.length) {
        list.push({
          key,
          name: resumeStore.getModel(key)?.name || key,
          issues,
        });
      }
    });

    return {
      list,
      issueCount: list.reduce((total: number, m: any) => total + m.issues.length, 0),
    };
  });
};
