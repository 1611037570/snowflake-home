<script setup>
// 墨阶页眉：墨黑通栏色带只绘图并下发个人信息排版变量，内容仍由公共组件渲染。
const headerStyle = {
  backgroundColor: "#22262B", // 页眉墨黑底色
  color: "#EDEAE4", // 联系方式等文字跟随近白
  "--resume-user-name-size": "38px", // 姓名字号
  "--resume-user-name-line-height": "1.15", // 姓名行高倍数
  "--resume-user-name-spacing": "0.04em", // 姓名字距
  "--resume-user-name-color": "#FFFFFF", // 姓名纯白
  "--resume-user-subtitle-spacing": "0.2em", // 副标题加宽字距
  "--resume-user-subtitle-color": "#B9B3AB", // 副标题灰米色
  "--resume-user-avatar-radius": "0", // 头像收为直角
};
</script>

<template>
  <!-- 色带不额外增加留白，区域装饰内边距仍由公共容器结算。 -->
  <div class="relative flex w-full min-w-0" :style="headerStyle">
    <slot />
  </div>
</template>
