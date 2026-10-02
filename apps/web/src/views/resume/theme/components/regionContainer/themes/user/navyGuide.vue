<script>
// 个人信息区域的留白由组件与分页共用，顶部色带后不再叠加模块间距。
const regionPadding = {
  top: 36, // 顶部色带与头像之间的距离
  right: 0, // 水平留白由页面控制
  bottom: 36, // 个人信息与正文之间的内部距离
  left: 0, // 水平留白由页面控制
};
export default { regionPadding };
</script>

<template>
  <div class="relative flex w-full min-w-0 py-9">
    <slot />
  </div>
</template>
