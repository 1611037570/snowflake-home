<script>
// 页眉留白只在组件里声明一次，区域容器按该声明施加内边距。
const regionPadding = {
  top: 0, // 上边距统一使用页面设置，不叠加主题留白
  right: 0, // 水平留白沿用页面设置
  bottom: 0, // 个人信息与正文之间只使用模块间距
  left: 0, // 水平留白沿用页面设置
};
export default { regionPadding };
</script>

<template>
  <!-- 个人信息区域沿用页面边距与模块间距，不绘制下划线。 -->
  <div
    class="two-column-user relative box-border w-full min-w-0"
  >
    <slot />
  </div>
</template>
