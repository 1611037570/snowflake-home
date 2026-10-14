<script setup>
// 个人信息沿用公共排布，本主题只下发霓虹配色的文字样式变量。
const appearanceStyle = {
  "--resume-user-name-size": "48px", // 姓名字号
  "--resume-user-name-line-height": "1.1", // 姓名行高倍数
  "--resume-user-name-spacing": "0.07em", // 姓名额外字距
  "--resume-user-name-color": "#f4fffe", // 姓名近白
  "--resume-user-name-family": 'Consolas, "Courier New", monospace', // 姓名等宽字体
  "--resume-user-name-shadow": "2px 2px #e83ae0, -2px -1px #62f5f2", // 姓名品红与青色双色辉光
  "--resume-user-subtitle-color": "#70f7f4", // 副标题青色
  "--resume-user-subtitle-size": "16px", // 副标题字号
  "--resume-user-subtitle-spacing": "0.1em", // 副标题字距
  "--resume-user-subtitle-family": 'Consolas, "Courier New", monospace', // 副标题等宽字体
  "--resume-user-subtitle-shadow": "0 0 8px rgba(94, 245, 242, 0.45)", // 副标题青色辉光
  "--resume-user-contact-gap": "6px", // 资料行距
  "--resume-user-contact-label-color": "#69f8f4", // 标签用青色与数值区分
};
</script>

<template>
  <!-- 外壳只声明外观变量，盒模型与公共个人信息区域保持一致。 -->
  <div :style="appearanceStyle">
    <slot />
  </div>
</template>
