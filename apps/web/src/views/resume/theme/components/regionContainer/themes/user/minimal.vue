<script>
// 个人信息留白同时供页面渲染与分页高度计算读取；与正文之间的距离由模块间距施加。
const regionPadding = {
  top: 0, // 顶部留白仅使用用户页面边距
  right: 0, // 水平留白沿用页面配置
  bottom: 0, // 与正文之间的距离由模块间距统一施加
  left: 0, // 水平留白沿用页面配置
};
export default { regionPadding };
</script>

<template>
  <!-- 极简个人信息区域：留白由区域容器按声明施加，不绘制任何底色与分割装饰 -->
  <div class="box-border w-full min-w-0">
    <slot />
  </div>
</template>
