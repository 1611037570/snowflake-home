/**
 * 仅在目标未完整显示时滚动到可视区域
 * 按最近的可滚动容器计算目标位置，目标统一取卡片外圈，与选中边框范围一致
 */
export const scrollEditorTo = (target?: HTMLElement | null) => {
  if (!target) return;
  const targetRect = target.getBoundingClientRect();
  const wrap = target.closest<HTMLElement>(".el-scrollbar__wrap");
  if (!wrap) {
    if (targetRect.top >= 0 && targetRect.bottom <= window.innerHeight) return;
    target.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }
  const wrapRect = wrap.getBoundingClientRect();
  const visibleTop = wrapRect.top + wrap.clientTop;
  const visibleBottom = visibleTop + wrap.clientHeight;
  if (targetRect.top >= visibleTop && targetRect.bottom <= visibleBottom) return;
  const offset =
    targetRect.height > wrap.clientHeight
      ? targetRect.top - visibleTop
      : targetRect.top < visibleTop
        ? targetRect.top - visibleTop
        : targetRect.bottom - visibleBottom;
  const top = wrap.scrollTop + offset;
  // 将目标滚到刚好可见的位置，避免新增和导航操作造成多余位移
  wrap.scrollTo({
    top: Math.min(wrap.scrollHeight - wrap.clientHeight, Math.max(0, top)),
    behavior: "smooth",
  });
};
