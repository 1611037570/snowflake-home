<script>
// 标语独立贴顶，页面上边距由引擎作为个人信息区域的首屏前置间距注入。
const regionPadding = {
  top: 0, // 页面上边距由引擎注入
  right: 0, // 不增加右侧留白
  bottom: 0, // 不增加底部留白
  left: 0, // 不增加左侧留白
};
export default { regionPadding /* 分页与区域组件共用的内部留白 */ };
</script>

<template>
  <div class="relative box-border flex w-full min-w-0">
    <slot />
  </div>
</template>
