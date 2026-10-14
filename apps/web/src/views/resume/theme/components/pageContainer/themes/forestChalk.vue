<template>
  <!-- 细点纸纹只绘制在页面背景层，不改变内容测量和分页。 -->
  <div aria-hidden="true" class="resume-page-pattern pointer-events-none absolute inset-0 -z-10" />
</template>

<style scoped>
.resume-page-pattern {
  background-image: radial-gradient(circle, rgba(206, 233, 218, 0.07) 0.75px, transparent 1px);
  background-size: 11px 11px;
}
</style>
