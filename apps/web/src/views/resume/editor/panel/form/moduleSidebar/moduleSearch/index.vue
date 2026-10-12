<script setup>
import ModuleSearchContent from "./content.vue";
</script>

<template>
  <!-- 搜索入口位于左侧底部，面板向右展开并与入口底部对齐。 -->
  <SfDropdown trigger="click" placement="right-end" :show-arrow="false" class="w-fit">
    <button
      type="button"
      class="flex-c w-fit min-w-0 cursor-pointer flex-col gap-1 rounded-xl border border-sf-b bg-sf-primary p-1 text-[9px] text-sf-text transition-colors select-none hover:border-sf-theme hover:text-sf-theme"
    >
      <SfIcon icon="lucide:search" size="4" />
      <span class="w-9 text-center leading-4 break-all">{{ $t("moduleManager") }}</span>
    </button>
    <template #dropdown>
      <ModuleSearchContent />
    </template>
  </SfDropdown>
</template>
