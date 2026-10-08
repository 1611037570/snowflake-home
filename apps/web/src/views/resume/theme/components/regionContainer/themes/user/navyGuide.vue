<script>
// 个人信息只声明内部留白，与正文之间的距离由引擎按模块间距施加。
const regionPadding = {
  top: 36, // 顶部色带与头像之间的距离
  right: 0, // 水平留白由页面控制
  bottom: 0, // 与正文之间的距离由模块间距统一施加
  left: 0, // 水平留白由页面控制
};
export default { regionPadding };
</script>

<template>
  <div class="relative flex w-full min-w-0">
    <slot />
  </div>
</template>
