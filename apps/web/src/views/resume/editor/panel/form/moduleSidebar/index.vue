<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import { isFieldRemoved } from "@/components/business/dynamicForm/api";
import {
  CUSTOM_MODULE_ICON,
  DEFAULT_MODULE_NAMES,
} from "@/stores/modules/resume/config/defaultConfig";
import AddModule from "./add.vue";

defineOptions({ name: "ModuleSidebar" });

const resumeStore = useResumeStore();
const { currentData, runtimeConfig } = storeToRefs(resumeStore);

// 左侧只展示当前未归档的模块名称
const moduleItems = computed(() =>
  (runtimeConfig.value?.fields || [])
    .filter((field) => !isFieldRemoved(currentData.value, field))
    .map((field) => ({
      key: field.key,
      name: resumeStore.getModel(field.key)?.name || field.key,
      icon: DEFAULT_MODULE_NAMES.find((item) => item.key === field.key)?.icon || CUSTOM_MODULE_ICON,
    })),
);
</script>

<template>
  <aside class="flex h-full min-h-0 min-w-0 flex-col border-r border-sf-b">
    <div class="mx-3 shrink-0 border-b border-sf-b py-3 text-sm font-bold text-sf-text-2">
      {{ $t("moduleManager") }}
    </div>
    <SfScrollbar class="min-h-0 min-w-0 flex-1">
      <div class="flex min-h-full flex-col gap-3 py-3">
        <div
          v-for="item in moduleItems"
          :key="item.key"
          class="flex min-h-12 min-w-0 items-center gap-3 rounded-xl border border-sf-b bg-sf-primary text-sm font-semibold text-sf-text select-none"
        >
          <span
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-sf-theme-3 text-sf-theme"
          >
            <SfIcon :icon="item.icon" size="4" />
          </span>
          <span class="w-9 break-all text-center leading-4">{{ item.name }}</span>
        </div>
      </div>
    </SfScrollbar>
    <div class="shrink-0 border-t border-sf-b px-3 py-3">
      <AddModule />
    </div>
  </aside>
</template>
