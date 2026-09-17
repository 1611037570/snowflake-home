/**
 * useSmartOnePage —— 智能一页自适应（真实测量闭环）
 *
 * 不使用数学估算预测压缩结果，而是按优先级逐档下调参数、每档变更后等预览重新测量，
 * 直接读取预览真实的页数判定，避免估算偏差导致的「要点好几次才压到位」。
 * 压缩过程用导出遮罩屏蔽，用户看不到中间的排版变化。
 *
 * 参数只向下压缩、不回弹；失败或中途取消时回退到压缩前的参数。
 */
import { nextTick, onMounted, onUnmounted, watch, type ComputedRef, type Ref } from "vue";
import { ElMessage } from "element-plus";
import eventBus from "@/utils/modules/eventBus";
import { useResumeStore } from "@/stores";
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

/** 单个可调参数的压缩配置：从当前值向下压缩到 min，每次按 step 取整 */
export interface OnePageAdjustableItem {
  key: OnePageAdjustKey;
  min: number;
  step: number;
  /** 会改变测量结果的参数（行高、内容宽度）需等重新测量后再判定 */
  remeasure?: boolean;
}

/** 默认可用参数（取自 uiConfig.uiParamRanges，与编辑器滑杆一致）；数组顺序即压缩优先级：先压间距，最后压字号 */
export const defaultOnePageAdjustable: OnePageAdjustableItem[] = [
  { key: "moduleSpacing", ...uiParamRanges.moduleSpacing },
  { key: "paddingVertical", ...uiParamRanges.paddingVertical },
  { key: "paddingHorizontal", ...uiParamRanges.paddingHorizontal, remeasure: true },
  { key: "paragraphSpacing", ...uiParamRanges.paragraphSpacing, remeasure: true },
  { key: "lineHeight", ...uiParamRanges.lineHeight, remeasure: true },
  { key: "titleFontSize", ...uiParamRanges.titleFontSize, remeasure: true },
  { key: "fontSize", ...uiParamRanges.fontSize, remeasure: true },
];

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

/** 等待重新测量的兜底时长：参数不影响测量时不会产生新数据，避免流程挂住 */
const MEASURE_TIMEOUT = 300;

/** 按步长向下取整（浮点步长做精度兜底） */
const floorByStep = (value: number, step: number) => {
  const stepped = Math.floor(value / step + 1e-9) * step;
  return Number(stepped.toFixed(4));
};

/** useSmartOnePage 入参 */
interface UseSmartOnePageOptions {
  /** 用户设置的 ui（响应式） */
  ui: ComputedRef<Record<string, any>>;
  /** 预览层测量结果（模块+行高），由编辑态 ResumePages 实例传入 */
  moduleList: Ref<any[]>;
  /** 预览层真实分页结果，判定是否已压到一页 */
  pages: ComputedRef<any[]>;
  /** 压缩结果写入的目标 ui（编辑态简历 store 的 currentUI） */
  currentUI: Ref<Record<string, any>>;
  /** 编辑态才注册工具栏事件，其余模式（缩略图/全屏预览）不注册 */
  isEdit: ComputedRef<boolean>;
  /** 可调节参数（数组顺序即压缩优先级），默认 defaultOnePageAdjustable */
  adjustable?: OnePageAdjustableItem[];
}

export const useSmartOnePage = ({
  ui,
  moduleList,
  pages,
  currentUI,
  isEdit,
  adjustable = defaultOnePageAdjustable,
}: UseSmartOnePageOptions) => {
  const resumeStore = useResumeStore();

  // 读取 ui 中可调字段的当前值，缺失时用默认值兜底
  const pickAdjustable = (source: Record<string, any>) => {
    const result = {} as Record<OnePageAdjustKey, number>;
    for (const { key } of adjustable) {
      const value = source[key];
      result[key] = typeof value === "number" ? value : uiDefaults[key];
    }
    return result;
  };

  // 等待下一次测量落地：参数影响行高/宽度时会替换测量结果
  const waitForMeasure = () =>
    new Promise<void>((resolve) => {
      let timer = 0;
      const stopWatch = watch(
        moduleList,
        () => {
          window.clearTimeout(timer);
          stopWatch();
          resolve();
        },
        { flush: "post" },
      );
      timer = window.setTimeout(() => {
        stopWatch();
        resolve();
      }, MEASURE_TIMEOUT);
    });

  // 写入参数、等测量与分页落地后返回预览真实页数
  const applyAndCount = async (
    params: Record<OnePageAdjustKey, number>,
    item: OnePageAdjustableItem,
  ) => {
    currentUI.value = { ...currentUI.value, ...params };
    if (item.remeasure) await waitForMeasure();
    await nextTick();
    return pages.value.length;
  };

  // 压缩：逐档下调参数，直到真实页数为 1；工具栏通过事件触发
  const onFitOnePage = async () => {
    const signal = resumeStore.beginFittingOnePage();
    if (!signal) return;

    const base = pickAdjustable(ui.value);
    // 回退到压缩前的参数，避免失败或取消后留在半压缩状态
    const rollback = () => (currentUI.value = { ...currentUI.value, ...base });

    try {
      if (pages.value.length === 1) {
        ElMessage.success("简历已压缩为一页");
        return;
      }
      const params = { ...base };
      for (const item of adjustable) {
        let value = params[item.key];
        while (value > item.min + 1e-9) {
          params[item.key] = Math.max(floorByStep(value - item.step, item.step), item.min);
          const pageCount = await applyAndCount(params, item);
          if (signal.aborted) {
            rollback();
            return;
          }
          if (pageCount === 1) {
            ElMessage.success("简历已压缩为一页");
            return;
          }
          value = params[item.key];
        }
      }
      // 全部参数压到下限仍放不下
      rollback();
      ElMessage.error("内容过长，无法压缩到一页");
    } finally {
      resumeStore.finishFittingOnePage(signal);
    }
  };
  // 仅编辑态注册工具栏「一页纸」事件
  onMounted(() => {
    if (isEdit.value) eventBus.on("resume-smart-one-page", onFitOnePage);
  });
  onUnmounted(() => {
    if (isEdit.value) eventBus.off("resume-smart-one-page", onFitOnePage);
  });
};
