/**
 * useResumePreviewData —— 预览数据代理
 *
 * 始终基于 props 传入的简历数据创建预览代理；父级已基于同一份数据创建过代理时直接复用，
 * 避免同一数据重复建代理树与重复挂 watch。缩略图、全屏预览等数据源不同的实例仍各自创建，
 * 保证多实例互不干扰。
 */
import { computed, inject, provide, type ComputedRef, type Ref } from "vue";
import { createPreviewProxy } from "../usePreviewData";

export const useResumePreviewData = (dataRef: ComputedRef<any>) => {
  // 父级已基于同一份数据创建过代理时直接复用
  const parentPreviewData = inject<Ref<any> | null>("previewData", null);
  const previewData = computed(() => {
    const source = dataRef.value || {};
    const parent = parentPreviewData?.value;
    if (parent?.__source === source) return parent;
    return createPreviewProxy(source);
  });
  provide("previewData", previewData);
};
