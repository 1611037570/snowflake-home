<script>
// 默认正文只在区域内部留白，模块间距统一由引擎按模块之间施加。
const regionPadding = {
  top: 0, // 正文区域顶部不加留白，首个模块前的间距由布局结算
  right: 0, // 水平留白沿用页面设置
  bottom: 0, // 底部留白沿用页面设置
  left: 0, // 水平留白沿用页面设置
};
export default { regionPadding }; // 正文留白供分页与渲染共同读取
</script>

<template>
  <!-- 正文区域始终由同一容器承载，顶部留白由组件声明统一下发。 -->
  <div class="resume-view-container relative box-border flex min-w-0 bg-transparent text-inherit">
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
