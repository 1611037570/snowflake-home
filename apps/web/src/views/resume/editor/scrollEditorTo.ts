/**
 * 滚动编辑区到指定元素
 * 按最近的可滚动容器计算目标位置，目标统一取卡片外圈，与选中边框范围一致
 */
export const scrollEditorTo = (target?: HTMLElement | null) => {
  if (!target) return;
  const wrap = target.closest<HTMLElement>(".el-scrollbar__wrap");
  if (!wrap) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  const top =
    target.getBoundingClientRect().top - wrap.getBoundingClientRect().top + wrap.scrollTop;
  wrap.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
};
