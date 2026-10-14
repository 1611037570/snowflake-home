<template>
  <!-- 缩略图加载时保持简历纸张的基本轮廓，避免预览区域空白。 -->
  <div class="flex h-full w-full flex-col gap-3 bg-sf-primary p-3" aria-hidden="true">
    <div class="flex items-center gap-3 border-b border-sf-b pb-3">
      <div class="h-12 w-12 shrink-0 animate-pulse rounded-full bg-sf-bg" />
      <div class="flex flex-1 flex-col gap-3">
        <div class="h-3 w-1/2 animate-pulse rounded bg-sf-bg" />
        <div class="h-3 w-3/4 animate-pulse rounded bg-sf-bg" />
      </div>
    </div>
    <div v-for="section in 3" :key="section" class="flex flex-col gap-3">
      <div class="h-3 w-1/3 animate-pulse rounded bg-sf-bg" />
      <div class="h-3 w-full animate-pulse rounded bg-sf-bg" />
      <div class="h-3 w-5/6 animate-pulse rounded bg-sf-bg" />
    </div>
  </div>
</template>
