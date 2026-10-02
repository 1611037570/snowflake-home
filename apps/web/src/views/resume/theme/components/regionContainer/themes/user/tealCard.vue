<script>
// 个人信息留白同时供页面渲染和区域高度计算读取。
export default {
  regionPadding: {
    top: 36, // 顶带与个人信息之间的留白
    right: 0, // 水平留白使用页面配置
    bottom: 24, // 个人信息与正文之间的留白
    left: 0, // 水平留白使用页面配置
  },
};
</script>

<template>
  <div class="relative w-full min-w-0 pt-9 pb-6"><slot /></div>
</template>
