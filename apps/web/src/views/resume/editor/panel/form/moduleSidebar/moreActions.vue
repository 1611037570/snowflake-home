<script setup>
import { computed, defineAsyncComponent } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { isFieldRemoved } from "@/components/business/dynamicForm/api";
import ModuleSearch from "./moduleSearch/index.vue";
import SortByTime from "./sortByTime.vue";

// 导入弹窗在操作列表出现时加载。
const ImportResume = defineAsyncComponent(() => import("@/views/resume/mine/components/importResume.vue"));
const resumeStore = useResumeStore();
const { currentData, runtimeConfig } = storeToRefs(resumeStore);
const moduleItems = computed(() =>
  (runtimeConfig.value?.fields || []).filter((field) => !isFieldRemoved(currentData.value, field)),
);

// 批量收起当前未归档模块，保留每条记录原有的展开状态。
function collapseAll() {
  for (const item of moduleItems.value) {
    const module = currentData.value?.[item.key];
    if (module?.ui) module.ui.collapsed = [];
  }
}

// 恢复未归档模块、子记录及个人信息字段的显示，只修改已有隐藏状态。
function showAll() {
  const clearHidden = (ui) => {
    if (!ui || typeof ui !== "object") return;
    if (ui.hidden === true) ui.hidden = false;
    for (const state of Object.values(ui)) clearHidden(state);
  };
  for (const item of moduleItems.value) {
    const module = currentData.value?.[item.key];
    clearHidden(module?.ui);
    if (Array.isArray(module?.list)) {
      for (const record of module.list) clearHidden(record?.ui);
    }
  }
}
</script>

<template>
  <!-- 展开列表与折叠后的下拉菜单共用相同操作。 -->
  <div class="flex flex-col items-center gap-[6px]">
    <ImportResume jump-after-import>
      <template #trigger="{ open }">
        <button
          type="button"
          class="flex-c w-fit min-w-0 cursor-pointer flex-col gap-1 rounded-xl border border-sf-b bg-sf-primary p-1 text-[9px] text-sf-text transition-colors select-none hover:border-sf-theme hover:text-sf-theme"
          @click="open"
        >
          <SfIcon icon="fa6-solid:file-import" size="4" />
          <span class="w-9 text-center leading-4 break-all">导入简历</span>
        </button>
      </template>
    </ImportResume>
    <ModuleSearch />
    <SortByTime />
    <button
      type="button"
      class="flex-c w-fit min-w-0 cursor-pointer flex-col gap-1 rounded-xl border border-sf-b bg-sf-primary p-1 text-[9px] text-sf-text transition-colors select-none hover:border-sf-theme hover:text-sf-theme"
      :disabled="!currentData || !runtimeConfig"
      @click="showAll"
    >
      <SfIcon icon="lucide:eye" size="4" />
      <span class="w-9 text-center leading-4 break-all">{{ $t("showAllContent") }}</span>
    </button>
    <button
      type="button"
      class="flex-c w-fit min-w-0 cursor-pointer flex-col gap-1 rounded-xl border border-sf-b bg-sf-primary p-1 text-[9px] text-sf-text transition-colors select-none hover:border-sf-theme hover:text-sf-theme"
      :disabled="!currentData || !runtimeConfig"
      @click="collapseAll"
    >
      <SfIcon icon="fa-solid:caret-up" size="4" />
      <span class="w-9 text-center leading-4 break-all">{{ $t("collapseAllModules") }}</span>
    </button>
  </div>
</template>
