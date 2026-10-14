<script setup>
// 个人信息沿用公共排布，本主题只下发姓名、头像的字体与尺寸配色。
const appearanceStyle = {
  "--resume-user-name-size": "38px", // 姓名字号
  "--resume-user-name-line-height": "1.2", // 姓名行高倍数
  "--resume-user-name-spacing": "0.18em", // 姓名额外字距
  "--resume-user-name-color": "#3D544A", // 姓名深绿，比正文更重一级
  "--resume-user-name-family": '"Songti SC", "STSong", "Noto Serif CJK SC", serif', // 姓名衬线字体
  "--resume-user-subtitle-family": '"Songti SC", "STSong", "Noto Serif CJK SC", serif', // 副标题同为衬线，保持信纸字体统一
  "--resume-user-name-weight": "400", // 衬线姓名不加粗，保持信纸的轻盈感
  "--resume-user-avatar-shadow": "0 0 0 1px #C7AA7E", // 头像一圈浅金细边，与藤线圆点同色
};
</script>

<template>
  <!-- 外壳只声明外观变量，盒模型与公共个人信息区域保持一致。 -->
  <div :style="appearanceStyle">
    <slot />
  </div>
</template>
