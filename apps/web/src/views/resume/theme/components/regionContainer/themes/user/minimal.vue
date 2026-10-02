<script>
// 个人信息留白同时供页面渲染与分页高度计算读取。
const regionPadding = {
  top: 12, // 个人信息与页面顶部之间的内部留白
  right: 0, // 水平留白沿用页面配置
  bottom: 12, // 个人信息与正文之间的内部留白
  left: 0, // 水平留白沿用页面配置
};
export default { regionPadding };
</script>

<template>
  <!-- 极简个人信息区域：留白全部走 padding，不绘制任何底色与分割装饰 -->
  <div class="box-border w-full min-w-0 pt-3 pb-3">
    <slot />
  </div>
</template>
