<template>
  <!-- 细点仅作为纸张纹理，不占正文空间。 -->
  <div aria-hidden="true" class="paper-dots resume-page-pattern pointer-events-none absolute inset-0 -z-10" />
</template>

<style scoped>
.paper-dots {
  background-image: radial-gradient(circle, #d8dce2 0.8px, transparent 0.9px);
  background-size: 18px 18px;
}
</style>
