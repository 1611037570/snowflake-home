import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, toValue, type MaybeRefOrGetter } from "vue";
import { getTime } from "../utils";

const resumeStore = useResumeStore();
const { currentData } = storeToRefs(resumeStore);

// ==================== 工具函数 ====================

/** 按路径从对象中取值（支持数字下标） */
const getValueByPath = (obj: any, path: (string | number)[]): any => {
  let cur = obj;
  for (const key of path) {
    if (cur == null) return undefined;
    cur = cur[key];
  }
  return cur;
};

/** 判断值是否为空（未填写） */
const isEmpty = (val: any): boolean =>
  val == null ||
  (typeof val === "string" && val.trim() === "") ||
  (Array.isArray(val) && val.length === 0) ||
  (typeof val === "object" && !Array.isArray(val) && Object.keys(val).length === 0);

/** 获取字段显示标签：优先 label，其次 name，再次 prop，最后兜底 */
const getLabel = (field: any, prop: string): string =>
  field?.label || field?.name || prop || "字段";

/** 从字段配置中提取 model、source、prop（统一处理 model 为数组或对象） */
const getFieldMeta = (field: any) => {
  const model = field?.model ? (Array.isArray(field.model) ? field.model[0] : field.model) : field;
  const src = Array.isArray(model?.source) ? model.source : [];
  const prop = model?.prop || src[src.length - 1] || "";
  return { src, prop };
};

// ==================== 主函数 ====================

// 模块配置索引：按 key 快速查找，避免每次分析时线性遍历配置
const moduleFieldsMap = computed(() => {
  const map = new Map<string, any>();
  for (const f of resumeStore.currentConfig?.fields || []) map.set(f?.key, f);
  for (const f of resumeStore.currentFixedConfig?.fields || []) map.set(f?.key, f);
  return map;
});

const analyzeModule = (source: any, moduleKey: string) => {
  // 从 store 获取模块配置
  const moduleForm = moduleFieldsMap.value.get(moduleKey);

  // 无配置或没有 fields → 无法统计，返回 0
  if (!moduleForm?.fields?.length) {
    return { missing: [], score: 0 };
  }

  const missing: string[] = [];
  const stat = { done: 0, total: 0 };

  // 遍历模块下的字段
  for (const field of moduleForm.fields) {
    // ----- 数组类型（教育/工作/项目/账号等） -----
    if (field.type === "array" && field.addConfig) {
      const addConfig = field.addConfig;
      // 子项定义：优先 fields，其次 model（账号模块走这里）
      const itemDefs = addConfig.fields?.length ? addConfig.fields : addConfig.model;
      if (!itemDefs?.length) continue;

      // 父级是否必填（若 addConfig 或数组字段本身标记 required，则所有子字段视为必填）
      const parentRequired = addConfig.required === true || field.required === true;

      // 从第一个子项的 source 推导列表路径（去掉 '?' 及其后）
      const firstSrc = getFieldMeta(itemDefs[0]).src;
      const listPath = firstSrc.slice(0, firstSrc.indexOf("?"));
      const list = getValueByPath(source, listPath);

      // 情况1：列表为空 → 所有必填子项均未填
      if (!Array.isArray(list) || list.length === 0) {
        let hasRequired = false;
        for (const def of itemDefs) {
          const isRequired = def.required === true || parentRequired;
          if (!isRequired) continue;
          hasRequired = true;
          stat.total += 1;
          const { prop } = getFieldMeta(def);
          const label = getLabel(def, prop);
          if (!missing.includes(label)) missing.push(label);
        }
        if (hasRequired) {
          const groupLabel = addConfig.name || "内容";
          if (!missing.includes(groupLabel)) missing.push(groupLabel);
        }
        continue;
      }

      // 情况2：列表有数据 → 逐项检查每个必填子字段
      list.forEach((_, idx) => {
        for (const def of itemDefs) {
          const isRequired = def.required === true || parentRequired;
          if (!isRequired) continue;
          const { src, prop } = getFieldMeta(def);
          if (!src.length) continue;

          // 将路径中的 '?' 替换为当前索引
          const path = src.map((k) => (k === "?" ? idx : k));
          const value = getValueByPath(source, path);
          const filled = !isEmpty(value);

          stat.total += 1;
          if (filled) {
            stat.done += 1;
          } else {
            const label = getLabel(def, prop);
            if (!missing.includes(label)) missing.push(label);
          }
        }
      });
      continue;
    }

    // ----- 普通字段（含富文本） -----
    if (field.required !== true) continue;
    const { src, prop } = getFieldMeta(field);
    if (!src.length) continue;

    const value = getValueByPath(source, src);
    const filled = !isEmpty(value);
    stat.total += 1;
    if (filled) {
      stat.done += 1;
    } else {
      // 富文本编辑器缺失时统一显示“内容”
      const label = field.component === "wangEditor" ? "内容" : getLabel(field, prop);
      if (!missing.includes(label)) missing.push(label);
    }
  }

  // 计算得分（完成度 × 10，四舍五入）
  const score = stat.total ? Math.round((stat.done / stat.total) * 10) : 0;
  return { missing, score };
};
// 参与评分的固定模块列表
const SCORE_MODULE_KEYS = ["user", "education", "skill", "work", "project"] as const;
type ModuleAnalyzeResult = ReturnType<typeof analyzeModule>;

// 一次性分析全部评分模块，供各调用方共用一次计算
const analyzeAllModules = (source: any) => {
  const result = {} as Record<(typeof SCORE_MODULE_KEYS)[number], ModuleAnalyzeResult>;
  for (const key of SCORE_MODULE_KEYS) result[key] = analyzeModule(source, key);
  return result;
};

// 当前简历全模块分析结果：各模块得分 computed 共用，避免重复分析
const currentScores = computed(() => analyzeAllModules(currentData.value));

// 各模块必填完成度得分（0-10）：统一基于必填字段统计
export const userScore = computed(() => currentScores.value.user.score);
export const educationScore = computed(() => currentScores.value.education.score);
export const skillScore = computed(() => currentScores.value.skill.score);
export const workScore = computed(() => currentScores.value.work.score);
export const projectScore = computed(() => currentScores.value.project.score);

// 全部成绩汇总：必填完成度得分求和 + 总分进度（5项 每项满分10，总分满分50）
export const getAllScores = (data: any) => {
  const { user, education, skill, work, project } = analyzeAllModules(data);

  // 5项，每项满分10
  const totalScore = user.score + education.score + skill.score + work.score + project.score;
  const totalFull = 50;
  // 进度百分比 保留2位小数
  const progress = Number(((totalScore / totalFull) * 100).toFixed(2));

  return {
    userScore: user.score,
    educationScore: education.score,
    skillScore: skill.score,
    workScore: work.score,
    projectScore: project.score,
    totalScore,
    totalFull,
    progress,
  };
};

// 计算各简历模块进度及总进度
export const useProgress = (data: MaybeRefOrGetter<Record<string, any> | null | undefined>) => {
  return computed(() => {
    const source = toValue(data) || {};
    // 当前编辑数据时复用已缓存的全模块分析，避免与 Score 重复计算
    const cached: Record<string, ModuleAnalyzeResult> | null =
      source === currentData.value ? currentScores.value : null;
    const list = Object.keys(source).map((key) => {
      // 必填字段分析：缺失标签 + 必填完成度得分
      const { missing, score } = cached?.[key] ?? analyzeModule(source, key);
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
      // 时间线一致性检查结果（与进度共用同一数据源）
      timeline: checkTimeline(source),
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
function checkTimeline(source: Record<string, any>) {
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

    // 重叠检测：线性扫描，记录已遍历条目中结束最晚的条目，开始时间早于其结束时间即视为重叠
    let latestEnd = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].start < latestEnd.end) {
        issues.push({
          type: "overlap",
          text: `「${sorted[i].name || "未命名"}」(${getTime(sorted[i].time)}) 与「${latestEnd.name || "未命名"}」(${getTime(latestEnd.time)}) 时间重叠，请核对`,
        });
      }
      if (sorted[i].end > latestEnd.end) latestEnd = sorted[i];
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
}
