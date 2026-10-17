<script setup>
import { computed, defineAsyncComponent } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import ModuleSearch from "./moduleSearch/index.vue";
import SortByTime from "./sortByTime.vue";

// 导入弹窗在操作列表出现时加载。
const ImportResume = defineAsyncComponent(() => import("@/views/resume/mine/components/importResume.vue"));
const resumeStore = useResumeStore();
const { currentData, runtimeConfig } = storeToRefs(resumeStore);
const moduleItems = computed(() => runtimeConfig.value?.fields || []);

// 批量收起全部模块，保留每条记录原有的展开状态。
function collapseAll() {
  for (const item of moduleItems.value) {
    const module = currentData.value?.[item.key];
    if (module?.ui) module.ui.collapsed = [];
  }
}

// 恢复模块、子记录及个人信息字段的显示，只修改已有隐藏状态。
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
  <!-- 展开列表与折叠后的下拉菜单共用相同操作，行规格与模块树一致。 -->
  <div class="flex flex-col gap-1.5">
    <ImportResume jump-after-import>
      <template #trigger="{ open }">
        <button
          type="button"
          class="rail-action flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-3xl p-1 text-[12px] text-sf-text-2 transition-colors select-none hover:bg-sf-bg"
          @click="open"
        >
          <SfIcon icon="fa6-solid:file-import" size="4" />
          <span class="max-md:hidden">导入简历</span>
        </button>
      </template>
    </ImportResume>
    <ModuleSearch />
    <SortByTime />
    <button
      type="button"
      class="rail-action flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-3xl p-1 text-[12px] text-sf-text-2 transition-colors select-none hover:bg-sf-bg"
      :disabled="!currentData || !runtimeConfig"
      @click="showAll"
    >
      <SfIcon icon="lucide:eye" size="4" />
      <span class="max-md:hidden">{{ $t("showAllContent") }}</span>
    </button>
    <button
      type="button"
      class="rail-action flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-3xl p-1 text-[12px] text-sf-text-2 transition-colors select-none hover:bg-sf-bg"
      :disabled="!currentData || !runtimeConfig"
      @click="collapseAll"
    >
      <SfIcon icon="fa-solid:caret-up" size="4" />
      <span class="max-md:hidden">{{ $t("collapseAllModules") }}</span>
    </button>
  </div>
</template>
