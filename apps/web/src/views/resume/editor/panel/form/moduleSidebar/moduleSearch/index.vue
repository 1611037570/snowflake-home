<script setup>
import ModuleSearchContent from "./content.vue";
</script>

<template>
  <!-- 搜索入口位于左侧底部，面板向右展开并与入口底部对齐。 -->
  <SfDropdown trigger="click" placement="right-end" :show-arrow="false" class="w-full">
    <button
      type="button"
      class="rail-action flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-3xl p-1 text-[12px] text-sf-text-2 transition-colors select-none hover:bg-sf-bg"
    >
      <SfIcon icon="lucide:search" size="4" />
      <span class="max-md:hidden">{{ $t("moduleManager") }}</span>
    </button>
    <template #dropdown>
      <ModuleSearchContent />
    </template>
  </SfDropdown>
</template>
