<script>
import { defaultModuleSpacing } from "@/stores/modules/resume/config/uiConfig";

// 默认正文补回首个模块前的留白，分页与预览共用模块间距设置。
const regionPadding = (ui) => ({
  top: Math.max(0, Number(ui?.page?.spacing?.module ?? defaultModuleSpacing) || 0), // 首个模块前的顶部留白
  right: 0, // 水平留白沿用页面设置
  bottom: 0, // 底部留白沿用页面设置
  left: 0, // 水平留白沿用页面设置
});
export default { regionPadding }; // 正文留白供分页与渲染共同读取
</script>

<template>
  <!-- 正文区域始终由同一容器承载，顶部留白由组件声明统一下发。 -->
  <div class="resume-view-container relative box-border flex min-w-0 bg-transparent text-inherit">
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
