<script>
// 经典页眉留白：容器不加内边距，组件自己声明并在根元素上补出等值间距。
const regionPadding = {
  top: 36, // 页眉内容与纸张上沿之间的留白
  right: 0, // 水平留白使用页面配置
  bottom: 24, // 页眉与正文上细线之间的留白
  left: 0, // 水平留白使用页面配置
};
export default {
  regionPadding, // 分页高度与组件内边距共用同一份数值
};
</script>

<template>
  <!-- 经典个人信息区域：只补上下留白，不画底色与边框，正文的分节感交给正文区域。 -->
  <div class="relative w-full min-w-0 pt-9 pb-6"><slot /></div>
</template>
