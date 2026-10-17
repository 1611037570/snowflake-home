<script setup>
import SfSkeleton from "@/components/el/skeleton";
</script>

<template>
  <!-- 用明确提示和高对比骨架展示编辑区加载状态。 -->
  <div class="resume-form-loading flex flex-col gap-3 p-3" role="status" aria-busy="true">
    <div class="flex items-center gap-3 text-sm text-sf-text-2">
      <!-- 加载图标持续旋转，明确表示编辑器仍在加载。 -->
      <span
        class="h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-sf-theme-2 border-t-sf-theme"
        aria-hidden="true"
      />
      <span>{{ $t("resumeEditorLoading") }}</span>
    </div>
    <SfSkeleton
      v-for="index in 3"
      :key="index"
      class="rounded-3xl border border-sf-b bg-sf-primary"
    />
  </div>
</template>

<style scoped>
.resume-form-loading :deep(.el-skeleton) {
  /* 骨架底色：使用更清晰的主题背景色，适配明暗模式。 */
  --el-skeleton-color: var(--sf-background-3);
  /* 骨架动画亮色：保留扫光变化，避免与页面背景融为一体。 */
  --el-skeleton-to-color: var(--sf-background-2);
}
</style>
