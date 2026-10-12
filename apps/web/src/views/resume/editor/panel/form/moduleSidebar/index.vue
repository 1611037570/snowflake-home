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
import SortByTime from "./sortByTime.vue";

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

// 一次收起导航栏中的全部模块，沿用现有模块展开状态。
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
  <aside class="flex h-full min-h-0 min-w-0 flex-col border-r border-sf-b bg-sf-primary py-[6px]">
    <!-- <div class="mx-3 shrink-0 border-b border-sf-b py-3 text-sm font-bold text-sf-text-2">
      {{ $t("moduleManager") }}
    </div> -->
    <SfScrollbar class="module-list-scroll min-h-0 min-w-0 flex-1">
      <!-- 模块间距与侧栏留白统一为六像素，底部留白计入滚动范围。 -->
      <div ref="listRef" class="flex min-h-full shrink-0 flex-col gap-[6px] pb-[6px]">
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
    <!-- 底部入口由容器统一提供上下间距和左右留白。 -->
    <div class="flex shrink-0 flex-col items-center gap-[6px] border-t border-sf-b px-[6px] pt-[6px]">
      <SortByTime />
      <!-- 全部显示入口沿用底部模块操作样式。 -->
      <button
        type="button"
        class="flex-c w-fit min-w-0 cursor-pointer flex-col gap-1 rounded-xl border border-sf-b bg-sf-primary p-1 text-[9px] text-sf-text transition-colors select-none hover:border-sf-theme hover:text-sf-theme"
        :disabled="!currentData || !runtimeConfig"
        @click="showAll"
      >
        <SfIcon icon="lucide:eye" size="4" />
        <span class="w-9 text-center leading-4 break-all">{{ $t("showAllContent") }}</span>
      </button>
      <!-- 折叠入口固定在添加模块上方，沿用模块卡片外观。 -->
      <button
        type="button"
        class="flex-c w-fit min-w-0 cursor-pointer flex-col gap-1 rounded-xl border border-sf-b bg-sf-primary p-1 text-[9px] text-sf-text transition-colors select-none hover:border-sf-theme hover:text-sf-theme"
        :disabled="!currentData || !runtimeConfig"
        @click="collapseAll"
      >
        <SfIcon icon="fa-solid:caret-up" size="4" />
        <span class="w-9 text-center leading-4 break-all">{{ $t("collapseAllModules") }}</span>
      </button>
      <AddModule />
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.module-list-scroll {
  :deep(.el-scrollbar__view) {
    /* 模块树左右留白与上下间距保持一致。 */
    padding: 0 6px !important;
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
