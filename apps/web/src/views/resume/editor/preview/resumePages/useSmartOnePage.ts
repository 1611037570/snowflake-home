/**
 * useSmartOnePage —— 智能一页自适应（按比例压缩 + 二分搜索 + 局部回退精修）
 *
 * 压缩思路：
 *   - 以「当前参数」为基准，所有参数由同一个「压缩强度」驱动、按权重同时向下限靠拢，
 *     避免把某一个参数榨干、其余不动带来的突兀效果；强度越小改动越少，收敛结果是「最小可行压缩量」
 *   - 对强度做二分搜索（真实页数作为判定），探测次数为对数级，不必逐档穷举
 *   - 收敛后按视觉敏感度从高到低逐个回退单参数，能放下一页就保留，
 *     让字号、行高这类最显眼的参数尽量不动
 *   - 标题字号按正文缩放比例派生，锁定「标题 / 正文」的设计比例，避免标题相对变大
 *   - 判定读取预览真实的页数，与正式排版完全一致，不依赖估算模型
 *   - 过程用导出遮罩屏蔽，用户看不到中间的排版变化
 *
 * 参数只向下压缩、不回弹；失败或中途取消时回退到压缩前的参数。
 */
import { nextTick, onMounted, onUnmounted, watch, type ComputedRef, type Ref } from "vue";
import { ElMessage } from "element-plus";
import eventBus from "@/utils/modules/eventBus";
import { useResumeStore } from "@/stores";
import type { PagePlan } from "./engine/paginate/pagePlan";
import {
  defaultFontSize,
  defaultLineHeight,
  defaultModuleSpacing,
  defaultPaddingHorizontal,
  defaultPaddingVertical,
  defaultParagraphSpacing,
  defaultTitleFontSize,
  uiParamRanges,
} from "@/stores/modules/resume/uiConfig";

/** 可被智能压缩的 ui 字段 */
export type OnePageAdjustKey =
  | "moduleSpacing"
  | "paddingVertical"
  | "paddingHorizontal"
  | "paragraphSpacing"
  | "lineHeight"
  | "titleFontSize"
  | "fontSize";

/** 单个可调参数的压缩配置 */
export interface OnePageAdjustableItem {
  key: OnePageAdjustKey;
  min: number;
  step: number;
  /** 压缩权重：同一强度下按权重比例向下限靠拢，视觉越敏感权重越小，缺省按 1 处理 */
  weight?: number;
  /** 会改变测量结果的参数（行高、内容宽度）需等重新测量后再判定 */
  remeasure?: boolean;
  /** 派生参数：跟随该字段的缩放比例，用于锁定参数间的设计比例 */
  ratioOf?: OnePageAdjustKey;
}

/** 默认可用参数（范围取自 uiConfig.uiParamRanges，与编辑器滑杆一致）：间距让路多、字号让路少 */
export const defaultOnePageAdjustable: OnePageAdjustableItem[] = [
  { key: "moduleSpacing", ...uiParamRanges.moduleSpacing, weight: 1 },
  { key: "paddingVertical", ...uiParamRanges.paddingVertical, weight: 1 },
  { key: "paddingHorizontal", ...uiParamRanges.paddingHorizontal, weight: 1, remeasure: true },
  { key: "paragraphSpacing", ...uiParamRanges.paragraphSpacing, weight: 1, remeasure: true },
  { key: "lineHeight", ...uiParamRanges.lineHeight, weight: 0.7, remeasure: true },
  { key: "fontSize", ...uiParamRanges.fontSize, weight: 0.4, remeasure: true },
  // 标题字号跟随正文字号缩放，保持原有比例，不单独驱动
  { key: "titleFontSize", ...uiParamRanges.titleFontSize, remeasure: true, ratioOf: "fontSize" },
];

/** 局部回退顺序：视觉越敏感越先尝试回退，能放下一页就尽量不动它 */
const RESTORE_ORDER: OnePageAdjustKey[] = ["fontSize", "lineHeight"];

/** 可调字段缺失时的兜底默认值 */
const uiDefaults: Record<OnePageAdjustKey, number> = {
  moduleSpacing: defaultModuleSpacing,
  paddingVertical: defaultPaddingVertical,
  paddingHorizontal: defaultPaddingHorizontal,
  paragraphSpacing: defaultParagraphSpacing,
  lineHeight: defaultLineHeight,
  titleFontSize: defaultTitleFontSize,
  fontSize: defaultFontSize,
};

/** 压缩强度分档数：二分搜索在这个档位网格上找最小可行强度 */
const COMPRESS_LEVELS = 20;

/** 等待重新测量的兜底时长：参数不影响测量时不会产生新数据，避免流程挂住 */
const MEASURE_TIMEOUT = 300;

/** 按步长对齐（只向下压，避免出现滑杆无法表示的值） */
const floorByStep = (value: number, step: number) => {
  const stepped = Math.floor(value / step + 1e-9) * step;
  return Number(stepped.toFixed(4));
};

/** useSmartOnePage 入参 */
interface UseSmartOnePageOptions {
  /** 用户设置的 ui（响应式） */
  ui: ComputedRef<Record<string, any>>;
  /** 预览层统一页面计划，判定是否已压到一页并等待重新排版 */
  pagePlan: ComputedRef<PagePlan>;
  /** 压缩结果写入的目标 ui（编辑态简历 store 的 currentUI） */
  currentUI: Ref<Record<string, any>>;
  /** 编辑态才注册工具栏事件，其余模式（缩略图/全屏预览）不注册 */
  isEdit: ComputedRef<boolean>;
  /** 可调节参数，默认 defaultOnePageAdjustable */
  adjustable?: OnePageAdjustableItem[];
}

export const useSmartOnePage = ({
  ui,
  pagePlan,
  currentUI,
  isEdit,
  adjustable = defaultOnePageAdjustable,
}: UseSmartOnePageOptions) => {
  const resumeStore = useResumeStore();

  // 读取 ui 中可调字段的当前值，缺失时用默认值兜底
  const pickBase = (source: Record<string, any>) => {
    const result = {} as Record<OnePageAdjustKey, number>;
    for (const { key } of adjustable) {
      const value = source[key];
      result[key] = typeof value === "number" ? value : uiDefaults[key];
    }
    return result;
  };

  // 等待下一次测量落地：参数影响行高/宽度时会替换测量结果
  const waitForMeasure = (signal: AbortSignal, isCurrentResume: () => boolean) =>
    new Promise<void>((resolve) => {
      let timer = 0;
      let settled = false;
      let stopWatch = () => {};
      const finish = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        stopWatch();
        signal.removeEventListener("abort", finish);
        resolve();
      };
      stopWatch = watch(
        pagePlan,
        finish,
        { flush: "post" },
      );
      timer = window.setTimeout(finish, MEASURE_TIMEOUT);
      if (signal.aborted || !isCurrentResume()) finish();
      else signal.addEventListener("abort", finish, { once: true });
    });

  // 压缩：二分搜索最小可行强度并局部精修，工具栏通过事件触发
  const onFitOnePage = async () => {
    const signal = resumeStore.beginFittingOnePage();
    if (!signal) return;
    // 记录压缩所属简历，避免旧任务覆盖新简历参数
    const resumeId = resumeStore.currentItem?.id;
    const isCurrentResume = () => resumeStore.currentItem?.id === resumeId;
    const isCurrentTask = () => !signal.aborted && isCurrentResume();

    const base = pickBase(ui.value);
    // 已应用的参数：用于判断本次是否需要等重新测量
    let applied = { ...base };

    // 派生参数跟随基准参数的比例，锁定参数间的设计比例关系
    const applyDerived = (params: Record<OnePageAdjustKey, number>) => {
      for (const item of adjustable) {
        if (!item.ratioOf) continue;
        const scale = params[item.ratioOf] / base[item.ratioOf];
        const target = base[item.key] * scale;
        params[item.key] = Math.min(
          Math.max(floorByStep(target, item.step), item.min),
          base[item.key],
        );
      }
      return params;
    };

    // 按压缩强度推导参数：整体按权重向各自下限靠拢，只向下压
    const paramsAtLevel = (level: number) => {
      const t = level / COMPRESS_LEVELS;
      const result = {} as Record<OnePageAdjustKey, number>;
      for (const item of adjustable) {
        const span = base[item.key] - item.min;
        if (span <= 0) {
          result[item.key] = item.min;
          continue;
        }
        // 权重决定前期让路比例；t 接近 1 时仍会走到下限，保证压缩能力不被削弱
        const weight = item.weight ?? 1;
        const strength = weight * t + (1 - weight) * t ** 3;
        const target = base[item.key] - span * strength;
        result[item.key] = Math.min(
          Math.max(floorByStep(target, item.step), item.min),
          base[item.key],
        );
      }
      // 派生参数按最终比例统一计算，避免受遍历顺序影响
      return applyDerived(result);
    };

    // 应用一组参数，返回预览真实页数
    const applyParams = async (params: Record<OnePageAdjustKey, number>) => {
      if (!isCurrentTask()) return null;
      const needsRemeasure = adjustable.some(
        (item) => item.remeasure && params[item.key] !== applied[item.key],
      );
      currentUI.value = { ...currentUI.value, ...params };
      applied = params;
      if (needsRemeasure) await waitForMeasure(signal, isCurrentResume);
      if (!isCurrentTask()) return null;
      await nextTick();
      if (!isCurrentTask()) return null;
      return pagePlan.value.pages.length;
    };

    // 回退到压缩前的参数，避免失败或取消后留在半压缩状态
    const rollback = () => {
      if (isCurrentResume()) currentUI.value = { ...currentUI.value, ...base };
    };

    try {
      if (!isCurrentTask()) return;
      if (pagePlan.value.pages.length === 1) {
        ElMessage.success("简历已压缩为一页");
        return;
      }
      // 先探最大强度：压到极限仍放不下说明内容确实过长
      const maxPageCount = await applyParams(paramsAtLevel(COMPRESS_LEVELS));
      if (!isCurrentTask()) {
        rollback();
        return;
      }
      if (maxPageCount !== 1) {
        rollback();
        ElMessage.error("内容过长，无法压缩到一页");
        return;
      }
      // 二分最小可行强度：0 档（未压缩）已知不可行
      let low = 0;
      let high = COMPRESS_LEVELS;
      while (low + 1 < high) {
        const mid = Math.floor((low + high) / 2);
        const pageCount = await applyParams(paramsAtLevel(mid));
        if (!isCurrentTask()) {
          rollback();
          return;
        }
        if (pageCount === 1) {
          high = mid;
        } else {
          low = mid;
        }
      }
      // 局部精修：按视觉敏感度逐个回退单参数，能放下一页就保留，让显眼的参数尽量少动
      let best = paramsAtLevel(high);
      await applyParams(best);
      if (!isCurrentTask()) {
        rollback();
        return;
      }
      for (const key of RESTORE_ORDER) {
        const item = adjustable.find((option) => option.key === key);
        if (!item) continue;
        const next = Math.min(best[key] + item.step, base[key]);
        if (next === best[key]) continue;
        const candidate = applyDerived({ ...best, [key]: next });
        const pageCount = await applyParams(candidate);
        if (!isCurrentTask()) {
          rollback();
          return;
        }
        if (pageCount === 1) {
          best = candidate;
        } else {
          // 回退这一档后放不下，恢复已知可行的组合
          await applyParams(best);
        }
      }
      if (!isCurrentTask()) {
        rollback();
        return;
      }
      ElMessage.success("简历已压缩为一页");
    } finally {
      resumeStore.finishFittingOnePage(signal);
    }
  };
  // 仅编辑态注册工具栏「一页纸」事件
  onMounted(() => {
    if (isEdit.value) eventBus.on("resume-smart-one-page", onFitOnePage);
  });
  onUnmounted(() => {
    if (isEdit.value) {
      eventBus.off("resume-smart-one-page", onFitOnePage);
      resumeStore.cancelFittingOnePage();
    }
  });
};
