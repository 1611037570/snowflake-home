<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useDraggable } from "vue-draggable-plus";
import { useResumeStore } from "@/stores";
import { moveFieldByKey } from "@/components/business/dynamicForm/api";
import {
  CUSTOM_MODULE_ICON,
  DEFAULT_MODULE_NAMES,
} from "@/stores/modules/resume/config/defaultConfig";
import { jumpEditor, jumpPreview } from "../../../hooks/useModuleNav";
import AddModule from "./add.vue";
import ModuleProgress from "./progress/index.vue";
import MoreActions from "./moreActions.vue";
import ResumeClosing from "@/views/resume/components/resumeClosing.vue";

defineOptions({ name: "ModuleSidebar" });

// 模块名称最多显示的字数，超出截断，保证模块树宽度稳定
const NAME_MAX = 6;
// 模块树当前高亮项：进入时默认个人信息，之后只由点击决定
const activeKey = ref("user");

const resumeStore = useResumeStore();
const { runtimeConfig, system } = storeToRefs(resumeStore);
const listRef = ref(null);
const draggableItems = ref([]);
let draggedKeys = [];
let draggable = null;

// 名称超过上限时截断并补省略号，让「还有内容」看得出来
const shortName = (name) =>
  name.length > NAME_MAX ? `${name.slice(0, NAME_MAX)}…` : name;

// 点击模块树同步定位编辑区与预览区，并把高亮落到当前模块
function handleModuleJump(key) {
  activeKey.value = key;
  resumeStore.editingModuleKey = key;
  resumeStore.editingItemIndex = null;
  jumpEditor(key);
  jumpPreview(key);
}

// 左侧展示全部模块名称，同时带上模块图标、隐藏状态与记录数量
const moduleItems = computed(() =>
  (runtimeConfig.value?.fields || []).map((field) => {
    const records = resumeStore.currentData?.[field.key]?.list;
    return {
      key: field.key,
      name: resumeStore.getModel(field.key)?.name || field.key,
      fixed: field.fixed,
      icon:
        DEFAULT_MODULE_NAMES.find((item) => item.key === field.key)?.icon || CUSTOM_MODULE_ICON,
      // 隐藏模块在模块树中降为灰阶并显示圆点
      hidden: resumeStore.currentData?.[field.key]?.ui?.hidden === true,
      // 记录数量：对象模块没有记录，返回 null 时不展示
      count: Array.isArray(records) ? records.length : null,
    };
  }),
);

// 表单进入模块编辑状态时，同步更新模块树高亮项。
watch(
  () => resumeStore.editingModuleKey,
  (key) => {
    if (!key || !moduleItems.value.some((item) => item.key === key)) return;
    activeKey.value = key;
  },
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
  <aside class="module-tree flex h-full min-h-0 min-w-0 flex-col bg-sf-primary p-1.5">
    <!-- 完成度：固定在模块列表上方，随简历内容实时更新 -->
    <ModuleProgress />
    <SfScrollbar class="module-list-scroll min-h-0 min-w-0 flex-1">
      <!-- 模块行固定高度，名称最多显示六个字 -->
      <div ref="listRef" class="flex min-h-full shrink-0 flex-col gap-1.5">
        <div
          v-for="item in draggableItems"
          :key="item.key"
          :data-fixed="item.fixed ? 'true' : undefined"
          class="rail-row group/rail flex h-8 min-w-0 cursor-pointer items-center gap-1 rounded-3xl p-1 transition-colors select-none"
          :class="
            item.key === activeKey
              ? 'bg-sf-theme-3 text-sf-theme'
              : item.hidden
                ? 'text-sf-text-3'
                : 'text-sf-text-2 hover:bg-sf-bg'
          "
          @click="handleModuleJump(item.key)"
        >
          <!-- 图标与拖拽把手叠放：悬停时互换，行宽保持不动 -->
          <span class="relative h-4 w-4 shrink-0">
            <span
              class="module-sidebar-icon absolute inset-0 flex items-center justify-center transition-opacity duration-150"
              :class="item.fixed ? '' : 'group-hover/rail:opacity-0'"
            >
              <SfIcon :icon="item.icon" size="4" />
            </span>
            <!-- 固定模块不参与拖拽，悬停时保留原图标并显示抓手光标 -->
            <span
              v-if="!item.fixed"
              class="module-sidebar-drag pointer-events-none absolute inset-0 flex cursor-grab! items-center justify-center opacity-0 transition-opacity duration-150 group-hover/rail:pointer-events-auto group-hover/rail:opacity-100 active:cursor-grabbing!"
              @click.stop
            >
              <!-- 图标组件自身带 cursor-pointer，抓手光标必须加感叹号才生效 -->
              <SfIcon
                icon="icon-park-outline:drag"
                size="4"
                class="cursor-grab! text-sf-text-3 active:cursor-grabbing!"
              />
            </span>
          </span>
          <span class="module-name max-w-21 truncate text-[12px]">{{ shortName(item.name) }}</span>
          <!-- 右侧显示记录数量：圆形底色徽标；隐藏模块同时保留一个圆点提示 -->
          <span class="rail-meta ml-auto flex shrink-0 items-center gap-1">
            <span v-if="item.hidden" class="h-1.5 w-1.5 rounded-full bg-sf-text-3"></span>
            <span
              v-if="item.count !== null"
              class="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] leading-none tabular-nums"
              :class="
                item.key === activeKey
                  ? 'bg-sf-theme text-sf-theme-text'
                  : 'bg-sf-bg-2 text-sf-text-3'
              "
              >{{ item.count }}</span
            >
          </span>
        </div>
      </div>
    </SfScrollbar>
    <!-- 底部操作与模块行保持同一视觉规格 -->
    <div class="flex shrink-0 flex-col gap-1.5 border-t border-sf-b pt-1.5">
      <button
        v-if="system.moreOperationsExpanded"
        type="button"
        class="rail-action flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-3xl p-1 text-[12px] text-sf-text-2 transition-colors select-none hover:bg-sf-bg"
        aria-expanded="true"
        @click="system.moreOperationsExpanded = false"
      >
        <SfIcon icon="fa-solid:caret-up" size="4" />
        <span class="max-md:hidden">{{ $t("collapseSidebarMore") }}</span>
      </button>
      <button
        v-else
        type="button"
        class="rail-action flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-3xl p-1 text-[12px] text-sf-text-2 transition-colors select-none hover:bg-sf-bg"
        aria-expanded="false"
        @click="system.moreOperationsExpanded = true"
      >
        <SfIcon icon="fa-solid:caret-down" size="4" />
        <span class="max-md:hidden">{{ $t("expandSidebarMore") }}</span>
      </button>
      <div v-if="system.moreOperationsExpanded" class="max-h-[50vh] min-h-0 overflow-y-auto">
        <MoreActions />
      </div>
      <SfDropdown
        v-else
        trigger="click"
        placement="right-end"
        :show-arrow="false"
        class="w-full"
      >
        <button
          type="button"
          class="rail-action flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-3xl p-1 text-[12px] text-sf-text-2 transition-colors select-none hover:bg-sf-bg"
          aria-haspopup="menu"
        >
          <SfIcon icon="mdi:dots-horizontal" size="4" />
          <span class="max-md:hidden">{{ $t("moreOperations") }}</span>
        </button>
        <template #dropdown>
          <div class="flex w-40 flex-col gap-1.5 rounded-2xl border border-sf-b bg-sf-primary p-1.5">
            <MoreActions />
          </div>
        </template>
      </SfDropdown>
      <AddModule />
    </div>
    <!-- 收尾文案：沿用简历首页的同一句寄语，置于模块树最下方；窄屏栏宽只放得下图标，文案隐藏 -->
    <ResumeClosing
      class="max-md:hidden shrink-0 border-t border-sf-b px-1 pt-1.5 text-center text-[11px] leading-4 text-sf-text-3"
    />
  </aside>
</template>

<style lang="scss" scoped>
/* 模块树改为加宽的图标 + 名称列表 */
.module-tree {
  width: 152px;
}

.module-list-scroll {
  :deep(.el-scrollbar__view) {
    /* 模块树左右留白与上下间距保持一致 */
    padding: 0 !important;
  }
}

.module-sidebar-ghost {
  opacity: 0;
}

/* 跟手拖拽的克隆体：圆角与模块行一致 */
.module-sidebar-drag-fallback {
  transform: scale(1.03);
  border-radius: 24px;
  opacity: 1 !important;
  box-shadow: 0 14px 30px rgba(17, 24, 39, 0.18);
}

/* 移动端编辑区宽度有限，收回到只显示图标：名称、数量与内边距一并收起 */
@media (max-width: 767px) {
  .module-tree {
    width: 48px;
    padding: 6px;
  }

  .rail-row {
    justify-content: center;
    gap: 0;
    overflow: hidden;
    padding: 0;
  }

  .rail-row .module-name,
  .rail-row .rail-meta {
    display: none;
  }

  /* 触屏端保留模块图标并关闭悬停拖拽层，单次点击直接交给模块行。 */
  .module-sidebar-icon {
    opacity: 1 !important;
  }

  .module-sidebar-drag {
    display: none;
  }

  .rail-action {
    justify-content: center;
    gap: 0;
    padding: 0;
  }
}
</style>
