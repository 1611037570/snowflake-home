<template>
  <!-- 点阵与页脚几何图形位于页面背景层，不占正文和分页空间。 -->
  <div aria-hidden="true" class="color-dot-notes-paper resume-page-pattern pointer-events-none absolute inset-0 -z-10">
    <span class="absolute bottom-[116px] left-[22px] h-[60px] w-[60px] rotate-[15deg] bg-[#89BEFA]" />
    <span class="absolute right-[45px] bottom-[36px] h-[48px] w-[48px] rounded-full border-[4px] border-[#89D98A]" />
  </div>
</template>

<style scoped>
.color-dot-notes-paper {
  background-image: radial-gradient(circle, #e3e8ef 0.8px, transparent 0.9px);
  background-size: 18px 18px;
}
</style>
