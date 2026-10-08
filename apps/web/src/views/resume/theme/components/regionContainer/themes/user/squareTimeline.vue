<script>
// 方节点时间轴页眉下留白由个人信息区域声明，分页与预览共用同一尺寸。
const regionPadding = {
  top: 0, // 页面顶部留白沿用页面设置
  right: 0, // 水平留白沿用页面设置
  bottom: 24, // 个人信息与时间轴正文之间的留白
  left: 0, // 水平留白沿用页面设置
};
export default { regionPadding };
</script>

<template>
  <div class="relative flex w-full min-w-0">
    <slot />
  </div>
</template>
