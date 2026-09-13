/**
 * useResumePages —— 简历分页核心逻辑接线层
 *
 * 组合测量（useRowInfo）与分页纯算法（paginate），产出分页结果
 * 与每页可见行裁剪样式，供 resumePages/index.vue 使用。
 */
import { computed, ref, watch, type ComputedRef, type Ref } from "vue";
import { paginateModules, buildPagesStyleText } from "./paginate";
import { useRowInfo } from "./useRowInfo";

/** useResumePages 入参 */
interface UseResumePagesOptions {
  measureRef: Ref<HTMLElement | null>;
  ui: ComputedRef<Record<string, any>>;
  showPageNumber: ComputedRef<boolean>;
  isThumb: ComputedRef<boolean>;
  uid: string;
  /** 期望渲染的模块列表（缩略图模式用于判断测量完整） */
  allModules: ComputedRef<any[]>;
}

/**
 * 组合测量与分页逻辑
 * @param options - 测量容器、模块列表、主题样式、模式标记等
 */
export const useResumePages = ({
  measureRef,
  ui,
  showPageNumber,
  isThumb,
  uid,
  allModules,
}: UseResumePagesOptions) => {
  // 测量监听配置：风格模板切换会改变行高，纳入监听触发重新测量分页
  const watchOptions = computed(() => ({
    padding: ui.value.padding,
    fontSize: ui.value.fontSize,
    lineHeight: ui.value.lineHeight,
    fontFamily: ui.value.fontFamily,
    themeTemplate: ui.value.themeTemplate,
    showPageNumber: showPageNumber.value,
  }));
  const { moduleList } = useRowInfo(measureRef, watchOptions, {
    // 缩略图模式：测量完整后冻结并释放监听，销毁测量容器也不会清空行数据
    stopAfterFirstMeasure: isThumb.value,
    // 缩略图数据静态：无需防抖合并编辑，立即测量；按期望模块数判定完整，避免异步挂载中途冻结
    debounce: isThumb.value ? 0 : undefined,
    expectedModuleCount: isThumb.value ? allModules.value.length : undefined,
    // 编辑器/全屏预览的隐藏测量容器尺寸变化均伴随内容 DOM 变更（MutationObserver 已覆盖），
    // 关闭 resize 观测，避免尺寸变化与内容变化重复触发测量（缩略图首测后即冻结，保留无副作用）
    observeResize: isThumb.value,
  });

  // 缩略图测量完成即销毁隐藏的测量容器，减少无用 DOM 与监听开销
  const measureDone = ref(false);
  watch(moduleList, (list) => {
    if (isThumb.value && list.length > 0) measureDone.value = true;
  });

  // 分页：调用纯算法按行高生成每页模块切片
  const pages = computed(() =>
    paginateModules({
      moduleList: moduleList.value,
      padding: ui.value.padding || 0,
      moduleSpacing: ui.value.moduleSpacing,
      showPageNumber: showPageNumber.value,
      stopAfterFirstPage: isThumb.value,
    }),
  );
  // 每页可见行裁剪样式：分页按顺序切分，隐藏行必为区间两端
  const pageStyleText = computed(() => buildPagesStyleText(pages.value, uid));

  // 透出测量结果（模块行高），供智能一页等上层逻辑按比例压缩参数
  return { measureDone, pages, pageStyleText, moduleList };
};