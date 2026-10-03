<script>
// 时间轴原有正文上留白迁移到个人信息区域，区域职责与分页尺寸保持一致。
const regionPadding = {
  top: 0, // 页面顶部留白沿用页面设置
  right: 0, // 水平留白沿用页面设置
  bottom: 12, // 保留个人信息与时间轴正文原有间距
  left: 0, // 水平留白沿用页面设置
};
export default { regionPadding };
</script>

<template>
  <div class="relative flex w-full min-w-0 pb-3">
    <slot />
  </div>
</template>
