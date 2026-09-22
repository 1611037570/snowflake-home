/**
 * useResumePages —— 新排版引擎接线层
 *
 * 预览只消费 PagePlan，不再生成分页裁剪样式。
 */
import { computed, type ComputedRef, type Ref } from "vue";
import { useResumeLayout } from "./engine/useResumeLayout";

interface UseResumePagesOptions {
  /** 隐藏测量宿主元素。 */
  measureRef: Ref<HTMLElement | null>;
  /** 简历原始业务数据。 */
  data: ComputedRef<Record<string, unknown>>;
  /** 简历主题配置。 */
  ui: ComputedRef<Record<string, any>>;
  /** 是否展示页码。 */
  showPageNumber: ComputedRef<boolean>;
  /** 字体加载版本。 */
  fontReadyVersion: Ref<number>;
  /** 展开后的模块字段配置。 */
  allModules: ComputedRef<any[]>;
}

export const useResumePages = ({
  measureRef,
  data,
  ui,
  showPageNumber,
  fontReadyVersion,
  allModules,
}: UseResumePagesOptions) => {
  const layout = useResumeLayout({
    measureRef,
    data,
    allModules,
    ui,
    showPageNumber,
    fontReadyVersion,
  });

  return {
    measureDone: layout.measureDone,
    pages: computed(() => layout.pagePlan.value.pages),
    pagePlan: layout.pagePlan,
    layout: layout.layout,
    nodes: layout.nodes,
    nodeMap: layout.nodeMap,
    moduleKeys: layout.moduleKeys,
    contentWidth: layout.contentWidth,
  };
};
