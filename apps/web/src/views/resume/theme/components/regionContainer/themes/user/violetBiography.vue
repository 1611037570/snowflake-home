<script>
// 个人信息沿用页面边距，不额外增加主题留白或接管纸张顶边。
const regionPadding = {
  top: 0, // 页面上边距由布局统一结算，不额外叠加页眉留白
  right: 0, // 右侧只使用页面边距
  bottom: 0, // 与正文之间只使用公共模块间距
  left: 0, // 左侧只使用页面边距
};
export default {
  regionPadding, // 个人信息区域内部留白
};
</script>

<template>
  <!-- 页眉资料使用黑色文字，装饰文字不占个人信息布局。 -->
  <div
    class="relative box-border flex w-full min-w-0 overflow-hidden text-black"
  >
    <span aria-hidden="true" class="pointer-events-none absolute top-6 right-9 text-right text-4xl leading-none font-black tracking-wide text-white/20">
      BIOGRAPHICAL<br />NOTES
    </span>
    <slot />
  </div>
</template>
