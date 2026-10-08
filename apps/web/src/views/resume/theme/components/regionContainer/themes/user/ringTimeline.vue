<script>
// 个人信息自身不含底部装饰，与正文之间的距离改由正文区域声明（只作用于首页）。
const regionPadding = {
  top: 0, // 页面顶部留白沿用页面设置
  right: 0, // 水平留白沿用页面设置
  bottom: 0, // 个人信息内部不再占用与正文之间的距离
  left: 0, // 水平留白沿用页面设置
};
export default { regionPadding };
</script>

<template>
  <div class="relative flex w-full min-w-0">
    <slot />
  </div>
</template>
