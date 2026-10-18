<script setup>
// 个人信息沿用公共排布，本主题只下发姓名与头像的尺寸。
const appearanceStyle = {
  "--resume-user-name-size": "30px", // 姓名字号
  "--resume-user-avatar-radius": "0", // 头像直角，与模块细边框呼应
};
</script>

<template>
  <!-- 外壳只声明外观变量，盒模型与公共个人信息区域保持一致。 -->
  <div :style="appearanceStyle">
    <slot />
  </div>
</template>
