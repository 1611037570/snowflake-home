/**
 * 简历预览层的共享尺寸常量
 * 统一维护分页、缩放、PDF 导出三处使用的尺寸，避免硬编码散落各处导致不一致
 */

/** 简历内容宽度（px），与 A4 96dpi 对应 */
export const RESUME_WIDTH = 794;
/** 简历内容高度（px） */
export const RESUME_HEIGHT = 1123;
/** 页码区域固定高度（px） */
export const PAGE_NUMBER_HEIGHT = 36;
/** PDF A4 页面宽度（mm） */
export const PDF_PAGE_WIDTH = 210;
/** PDF A4 页面高度（mm） */
export const PDF_PAGE_HEIGHT = 297;
/** 简历容器宽度固定样式（分页页面与单页测量容器共用） */
export const RESUME_CONTAINER_WIDTH = {
  width: `${RESUME_WIDTH}px`,
  minWidth: `${RESUME_WIDTH}px`,
  maxWidth: `${RESUME_WIDTH}px`,
};
/** 简历容器高度固定样式（分页页面与单页测量容器共用） */
export const RESUME_CONTAINER_HEIGHT = {
  height: `${RESUME_HEIGHT}px`,
  minHeight: `${RESUME_HEIGHT}px`,
  maxHeight: `${RESUME_HEIGHT}px`,
};
