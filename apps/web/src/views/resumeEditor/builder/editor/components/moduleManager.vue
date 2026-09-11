<script setup>
import { computed, getCurrentInstance, nextTick, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useDraggable } from "vue-draggable-plus";
import { useResumeStore } from "@/stores";
import { setFieldArchived, setFieldHidden } from "../../../utils";
import { useModuleNav } from "../../../useModuleNav";

defineOptions({ name: "ModuleManager" });

const { proxy } = getCurrentInstance();
const resumeStore = useResumeStore();
const { currentData, runtimeConfig } = storeToRefs(resumeStore);
const { keyword, filteredList, jumpAll } = useModuleNav();
const listRef = ref(null);
const moduleFields = computed(() => runtimeConfig.value?.fields || []);
let draggable = null;

// 查找模块时先恢复归档状态，再同步定位编辑区与预览区
const handleFind = async (module) => {
  if (module.archived) setFieldArchived(currentData.value, module.field, false);
  await nextTick();
  jumpAll(module.key);
};

// 切换模块在简历预览中的显示状态
const handleHidden = (module) => {
  setFieldHidden(currentData.value, module.field, !module.hidden);
};

// 切换模块归档状态，归档后同步取消 AI 模块选中
const handleArchived = (module) => {
  const archived = !module.archived;
  setFieldArchived(currentData.value, module.field, archived);
  if (archived) resumeStore.unselectModule(module.key);
};

// 删除模块时同步移除模块数据与运行时配置
const handleDelete = (module) => {
  proxy.$confirm(`确定要删除${module.name}模块吗？`, "删除确认").then(() => {
    const index = moduleFields.value.findIndex((field) => field.key === module.key);
    if (index < 0) return;
    moduleFields.value.splice(index, 1);
    if (currentData.value) delete currentData.value[module.key];
    resumeStore.unselectModule(module.key);
  });
};

// 管理面板首次展开后初始化拖拽，确保悬浮内容已经挂载
const handlePanelVisible = async (visible) => {
  if (!visible || draggable) return;
  await nextTick();
  // 搜索时隐藏拖拽手柄，避免过滤列表与完整模块顺序不一致
  draggable = useDraggable(listRef, moduleFields, {
    animation: 150,
    ghostClass: "module-manager-ghost",
    handle: ".module-manager-drag",
    onMove: (event) => !event.related?.dataset?.fixed,
  });
};

onUnmounted(() => {
  draggable?.destroy();
  draggable = null;
});
</script>

<template>
  <!-- 原生定位层承载悬浮位置，避免下拉组件内部定位样式使入口占据文档流 -->
  <div class="absolute top-3 right-3 z-10">
    <SfDropdown
      trigger="click"
      placement="bottom-end"
      :show-arrow="false"
      @visible-change="handlePanelVisible"
    >
      <SfTooltip content="模块管理">
        <SfIcon
          icon="mdi:widgets"
          size="5"
          boxSize="9"
          class="cursor-pointer rounded-full border border-sf-b bg-sf-primary text-sf-theme shadow-sm hover:bg-sf-theme-2"
        />
      </SfTooltip>
      <template #dropdown>
        <div class="w-84 rounded-3xl border border-sf-b bg-sf-primary py-3">
          <header class="px-3">
            <div class="mb-3 flex items-center justify-between">
              <div class="flex items-center gap-3 font-bold text-sf-text">
                <SfIcon icon="mdi:widgets" size="4" />
                <span>模块管理</span>
              </div>
              <span class="text-xs text-sf-text-2">{{ moduleFields.length }} 个模块</span>
            </div>
            <SfInput v-model="keyword" placeholder="搜索模块" clearable />
          </header>
          <SfScrollbar class="mt-3" max-height="388px">
            <div ref="listRef" class="flex flex-col gap-3">
              <div
                v-for="module in filteredList"
                :key="module.key"
                :data-fixed="module.field.fixed ? 'true' : undefined"
                class="group flex h-12 items-center gap-3 rounded-3xl bg-sf-bg px-3"
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
                  <span v-if="module.hidden" class="text-xs text-sf-text-2">已隐藏</span>
                  <span v-if="module.archived" class="text-xs text-sf-text-2">已归档</span>
                </div>
                <div class="flex shrink-0 items-center gap-3 text-sf-text-2">
                  <SfTooltip content="同步查找">
                    <SfIcon
                      icon="mdi:map-search-outline"
                      size="4"
                      class="cursor-pointer hover:text-sf-theme"
                      @click.stop="handleFind(module)"
                    />
                  </SfTooltip>
                  <SfTooltip :content="module.hidden ? '显示' : '隐藏'">
                    <SfIcon
                      :icon="module.hidden ? 'lucide:eye' : 'lucide:eye-off'"
                      size="4"
                      class="cursor-pointer hover:text-sf-theme"
                      @click.stop="handleHidden(module)"
                    />
                  </SfTooltip>
                  <SfTooltip :content="module.archived ? '恢复归档' : '归档'">
                    <SfIcon
                      :icon="module.archived ? 'lucide:archive-restore' : 'lucide:archive'"
                      size="4"
                      class="cursor-pointer hover:text-sf-theme"
                      @click.stop="handleArchived(module)"
                    />
                  </SfTooltip>
                  <SfTooltip v-if="!module.field.fixed" content="删除">
                    <SfIcon
                      icon="ic:round-delete"
                      size="4"
                      class="cursor-pointer hover:text-sf-theme"
                      @click.stop="handleDelete(module)"
                    />
                  </SfTooltip>
                </div>
              </div>
              <div v-if="!filteredList.length" class="py-3 text-center text-sm text-sf-text-2">
                未找到相关模块
              </div>
            </div>
          </SfScrollbar>
        </div>
      </template>
    </SfDropdown>
  </div>
</template>

<style scoped>
.module-manager-ghost {
  opacity: 0.5;
}
</style>
