import type { RegionConfig } from "../pageLayoutTypes";

/**
 * 区域内容高度：区域高度模式决定本区域在一页里能占用的高度。
 * 固定高度直接取配置值且不截断，自适应与剩余高度由调用方给出上限。
 */
export const getRegionContentHeight = (region: RegionConfig, fallback: number): number =>
  region.height.mode === "fixed" ? Math.max(0, region.height.value) : Math.max(0, fallback);

/** 区域上下内容内边距占用页面高度的总量 */
export const getRegionPaddingHeight = (region: RegionConfig): number =>
  (region.padding?.top ?? 0) + (region.padding?.bottom ?? 0);
