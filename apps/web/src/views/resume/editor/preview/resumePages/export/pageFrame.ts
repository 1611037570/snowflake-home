/**
 * 纸张外观与编辑器装饰的区分
 *
 * 编辑器预览会在每个页面上叠加一条页边线（.resume-page-editor-frame），
 * 它只是预览用的定位辅助线，纸张本身并没有这条线，导出时必须移除；
 * 而 ui.page.border 与 ui.page.radius 是主题声明的真实纸张外观，
 * 属于简历内容的一部分，导出通道不得清除。
 * 因此导出统一调用本模块：只摘掉预览装饰，纸张边框与圆角原样保留。
 */

/** 编辑器页边线类名：预览专有装饰，与 resumePages/index.vue 的声明保持一致 */
export const EDITOR_PAGE_FRAME_CLASS = "resume-page-editor-frame";

/**
 * 移除根元素及其后代上的编辑器页边线。
 * 页边线只由该类提供，摘掉类即完成清除；传入分页容器时覆盖容器内所有页面，传入单个页面克隆体时只处理该页面。
 * @param element 导出使用的根元素或页面克隆体
 */
export const stripEditorPageFrame = <T extends HTMLElement>(element: T): T => {
  [element, ...element.querySelectorAll<HTMLElement>(`.${EDITOR_PAGE_FRAME_CLASS}`)].forEach((frame) =>
    frame.classList.remove(EDITOR_PAGE_FRAME_CLASS),
  );
  return element;
};
