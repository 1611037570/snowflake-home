<template>
  <!-- 右上角双环只绘制在纸张背景层，不参与布局与分页。 -->
  <div aria-hidden="true" class="resume-page-pattern pointer-events-none absolute inset-0 -z-10" />
</template>

<style scoped>
.resume-page-pattern {
  background-image:
    radial-gradient(circle 142px at 96% 5%, transparent 99%, rgba(142, 187, 178, 0.24) 100%, transparent calc(100% + 1px)),
    radial-gradient(circle 238px at 96% 5%, transparent 99%, rgba(142, 187, 178, 0.34) 100%, transparent calc(100% + 1px));
}
</style>
