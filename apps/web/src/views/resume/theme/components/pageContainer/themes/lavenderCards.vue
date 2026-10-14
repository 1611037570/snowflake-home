<template>
  <!-- 柔和渐变只绘制在纸张背景层，不改变内容和分页。 -->
  <div aria-hidden="true" class="resume-page-pattern pointer-events-none absolute inset-0 -z-10" />
</template>

<style scoped>
.resume-page-pattern {
  background-image:
    radial-gradient(ellipse 45% 20% at 100% 0%, rgba(250, 197, 227, 0.58), transparent 80%),
    radial-gradient(ellipse 65% 40% at 0% 2%, rgba(222, 199, 253, 0.6), transparent 85%),
    linear-gradient(160deg, #fbf6ff 0%, #f2f0ff 45%, #eafaff 100%);
}
</style>
