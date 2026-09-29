<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useDraggable } from "vue-draggable-plus";
import { useResumeStore } from "@/stores";
import { isFieldRemoved, moveFieldByKey } from "@/components/business/dynamicForm/api";
import {
  CUSTOM_MODULE_ICON,
  DEFAULT_MODULE_NAMES,
} from "@/stores/modules/resume/config/defaultConfig";
import { jumpEditor } from "../../../hooks/useModuleNav";
import AddModule from "./add.vue";

defineOptions({ name: "ModuleSidebar" });

const resumeStore = useResumeStore();
const { currentData, runtimeConfig } = storeToRefs(resumeStore);
const listRef = ref(null);
const draggableItems = ref([]);
let draggedKeys = [];
let draggable = null;

// 左侧只展示当前未归档的模块名称
const moduleItems = computed(() =>
  (runtimeConfig.value?.fields || [])
    .filter((field) => !isFieldRemoved(currentData.value, field))
    .map((field) => ({
      key: field.key,
      name: resumeStore.getModel(field.key)?.name || field.key,
      fixed: field.fixed,
      icon: DEFAULT_MODULE_NAMES.find((item) => item.key === field.key)?.icon || CUSTOM_MODULE_ICON,
    })),
);

watch(
  moduleItems,
  (items) => {
    draggableItems.value = [...items];
  },
  { immediate: true },
);

onMounted(async () => {
  await nextTick();
  // 模块拖拽沿用动态表单效果，并将顺序写回运行时字段配置
  draggable = useDraggable(listRef, draggableItems, {
    animation: 300,
    easing: "cubic-bezier(.2, .8, .2, 1)",
    ghostClass: "module-sidebar-ghost",
    handle: ".module-sidebar-drag",
    forceFallback: true,
    fallbackClass: "module-sidebar-drag-fallback",
    fallbackOnBody: true,
    onMove: (event) => !event.related?.dataset?.fixed,
    onStart: () => {
      draggedKeys = draggableItems.value.map((item) => item.key);
    },
    onEnd: (event) => {
      const fromKey = draggedKeys[event.oldIndex];
      const toKey = draggedKeys[event.newIndex];
      if (fromKey && toKey) {
        moveFieldByKey(
          runtimeConfig.value?.fields || [],
          fromKey,
          toKey,
          event.oldIndex < event.newIndex ? "after" : "before",
        );
      }
    },
  });
});

onUnmounted(() => {
  draggable?.destroy();
  draggable = null;
});
</script>

<template>
  <aside class="flex h-full min-h-0 min-w-0 flex-col border-r border-sf-b">
    <!-- <div class="mx-3 shrink-0 border-b border-sf-b py-3 text-sm font-bold text-sf-text-2">
      {{ $t("moduleManager") }}
    </div> -->
    <SfScrollbar class="module-list-scroll min-h-0 min-w-0 flex-1">
      <div ref="listRef" class="flex min-h-full flex-col gap-1.5">
        <div
          v-for="item in draggableItems"
          :key="item.key"
          :data-fixed="item.fixed ? 'true' : undefined"
          class="flex-c w-fit min-w-0 cursor-pointer flex-col gap-1 rounded-xl border border-sf-b bg-sf-primary p-1 text-[9px] text-sf-text transition-colors select-none hover:border-sf-theme hover:text-sf-theme"
          @click="jumpEditor(item.key)"
        >
          <SfIcon v-if="item.fixed" :icon="item.icon" size="4" />
          <SfIcon
            v-if="!item.fixed"
            icon="icon-park-outline:drag"
            size="4"
            class="module-sidebar-drag cursor-move! text-sf-text-2"
            @click.stop
          />
          <span class="w-9 text-center leading-4 break-all">{{ item.name }}</span>
        </div>
      </div>
    </SfScrollbar>
    <div class="border-t border-sf-b">
      <AddModule />
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.module-list-scroll {
  :deep(.el-scrollbar__view) {
    padding: 0 8px !important;
  }
}

.module-sidebar-ghost {
  opacity: 0;
}

.module-sidebar-drag-fallback {
  transform: scale(1.03);
  border-radius: 12px;
  opacity: 1 !important;
  box-shadow: 0 14px 30px rgba(17, 24, 39, 0.18);
}
</style>
