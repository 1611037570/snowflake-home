<script setup>
import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useDraggable } from "vue-draggable-plus";
import { moveFieldByKey } from "@/components/business/dynamicForm/api";
import { useResumeStore } from "@/stores";
import { useModuleNav } from "../../useModuleNav";
import { $t } from "@/locales";

defineOptions({ name: "ModuleManagerContent" });

const { proxy } = getCurrentInstance();
const resumeStore = useResumeStore();
const { runtimeConfig } = storeToRefs(resumeStore);
const { keyword, searchResults, moduleList, jumpAll, jumpToHit, jumpPreview } = useModuleNav();
const listRef = ref(null);
const moduleFields = computed(() => runtimeConfig.value?.fields || []);
// 拖拽排序作用于可导航模块，结束后按 key 回填完整字段列表
const visibleModules = ref([]);
// 拖拽前的可见模块 key 顺序：用于按下标还原起止模块
let draggedKeys = [];
watch(
  moduleList,
  (list) => {
    visibleModules.value = [...list];
  },
  { immediate: true },
);
let draggable = null;

// 查找模块时先恢复归档状态，再同步定位编辑区与预览区
const handleFind = async (module) => {
  if (module.archived) resumeStore.setModuleArchived(module.key, false);
  await nextTick();
  jumpAll(module.key);
};

// 查找内容命中项：恢复归档后定位到命中的记录或字段行，并同步预览区模块
const handleFindHit = async (module, hit) => {
  if (module.archived) resumeStore.setModuleArchived(module.key, false);
  await nextTick();
  jumpToHit(module.key, hit);
  jumpPreview(module.key);
};

// 命中项标题：记录命中显示「记录标题 · 字段标签」，对象模块字段命中只显示字段标签
const hitTitle = (hit) => {
  const record =
    hit.recordTitle || (hit.itemIndex != null ? $t("recordNumber", { number: hit.itemIndex + 1 }) : "");
  return record ? `${record} · ${hit.label}` : hit.label;
};

// 切换模块在简历预览中的显示状态
const handleHidden = (module) => {
  resumeStore.setModuleHidden(module.key, !module.hidden);
};

// 切换模块归档状态，归档后同步取消 AI 模块选中
const handleArchived = (module) => {
  resumeStore.setModuleArchived(module.key, !module.archived);
};

// 删除模块时同步移除模块数据与运行时配置
const handleDelete = (module) => {
  proxy.$confirm($t("deleteModuleConfirm", { name: module.name }), $t("deleteConfirm")).then(() => {
    resumeStore.removeModule(module.key);
  });
};

onMounted(async () => {
  await nextTick();
  // 搜索时隐藏拖拽手柄，避免过滤列表与完整模块顺序不一致
  draggable = useDraggable(listRef, visibleModules, {
    animation: 150,
    ghostClass: "module-manager-ghost",
    handle: ".module-manager-drag",
    onMove: (event) => !event.related?.dataset?.fixed,
    onStart: () => {
      draggedKeys = visibleModules.value.map((item) => item.field.key);
    },
    // 前移落到目标模块之后、后移落到目标模块之前，与拖拽结果一致
    onEnd: (event) => {
      const fromKey = draggedKeys[event.oldIndex];
      const toKey = draggedKeys[event.newIndex];
      if (!fromKey || !toKey) return;
      moveFieldByKey(
        moduleFields.value,
        fromKey,
        toKey,
        event.oldIndex < event.newIndex ? "after" : "before",
      );
    },
  });
});

onUnmounted(() => {
  draggable?.destroy();
  draggable = null;
});
</script>

<template>
  <div class="w-84 rounded-3xl border border-sf-b bg-sf-primary py-3">
    <header class="px-3">
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center gap-3 font-bold text-sf-text">
          <SfIcon icon="mdi:widgets" size="4" />
          <span>{{ $t("moduleManager") }}</span>
        </div>
        <span class="text-xs text-sf-text-2">{{ $t("moduleCount", { count: moduleFields.length }) }}</span>
      </div>
      <SfInput v-model="keyword" :placeholder="$t('searchModuleOrContent')" clearable />
    </header>
    <SfScrollbar class="mt-3" max-height="388px">
      <div ref="listRef" class="flex flex-col gap-3">
        <template v-for="module in searchResults" :key="module.key">
          <div
            class="flex flex-col gap-3"
            :data-fixed="module.field.fixed ? 'true' : undefined"
          >
            <div
              class="group flex h-10 items-center gap-3 rounded-3xl bg-sf-bg px-3"
              :class="module.hidden || module.archived ? 'opacity-60' : ''"
            >
              <SfIcon
                v-if="!module.field.fixed && !keyword"
                icon="icon-park-outline:drag"
                size="4"
                class="module-manager-drag cursor-move! text-sf-text-3"
              />
              <div class="flex min-w-0 flex-1 items-center gap-3">
                <span class="truncate text-sm text-sf-text">{{ module.name }}</span>
                <span v-if="module.hidden" class="text-xs text-sf-text-2">{{ $t("hidden") }}</span>
                <span v-if="module.archived" class="text-xs text-sf-text-2">{{ $t("archived") }}</span>
              </div>
              <div class="flex shrink-0 items-center gap-3 text-sf-text-2">
                <SfTooltip :content="$t('syncSearch')">
                  <SfIcon
                    icon="mdi:map-search-outline"
                    size="4"
                    class="cursor-pointer hover:text-sf-theme"
                    @click.stop="handleFind(module)"
                  />
                </SfTooltip>
                <SfTooltip :content="module.hidden ? $t('show') : $t('hide')">
                  <SfIcon
                    :icon="module.hidden ? 'lucide:eye' : 'lucide:eye-off'"
                    size="4"
                    class="cursor-pointer hover:text-sf-theme"
                    @click.stop="handleHidden(module)"
                  />
                </SfTooltip>
                <SfTooltip :content="module.archived ? $t('restoreArchive') : $t('archive')">
                  <SfIcon
                    :icon="module.archived ? 'lucide:archive-restore' : 'lucide:archive'"
                    size="4"
                    class="cursor-pointer hover:text-sf-theme"
                    @click.stop="handleArchived(module)"
                  />
                </SfTooltip>
                <SfTooltip v-if="!module.field.fixed" :content="$t('delete')">
                  <SfIcon
                    icon="ic:round-delete"
                    size="4"
                    class="cursor-pointer hover:text-sf-theme"
                    @click.stop="handleDelete(module)"
                  />
                </SfTooltip>
              </div>
            </div>
            <!-- 内容命中：按记录或字段列出命中项，点击定位到对应行 -->
            <div
              v-if="module.hits.length"
              class="ml-3 flex flex-col gap-3 border-l border-sf-border pl-3"
            >
              <div
                v-for="(hit, index) in module.hits"
                :key="`${hit.itemIndex ?? 'field'}-${hit.fieldKey}-${index}`"
                class="flex cursor-pointer flex-col rounded-xl bg-sf-bg px-3 py-1 hover:text-sf-theme"
                @click.stop="handleFindHit(module, hit)"
              >
                <span class="truncate text-xs text-sf-text-2">{{ hitTitle(hit) }}</span>
                <span class="truncate text-xs text-sf-text-3">{{ hit.text }}</span>
              </div>
            </div>
          </div>
        </template>
        <div v-if="!searchResults.length" class="py-3 text-center text-sm text-sf-text-2">
          {{ $t("notFound") }}
        </div>
      </div>
    </SfScrollbar>
  </div>
</template>

<style scoped>
.module-manager-ghost {
  opacity: 0.5;
}
</style>
