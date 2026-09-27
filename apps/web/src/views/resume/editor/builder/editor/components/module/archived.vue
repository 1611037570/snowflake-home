<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { isFieldRemoved } from "@/components/business/dynamicForm/api";

const resumeStore = useResumeStore();
const { runtimeConfig, currentData } = storeToRefs(resumeStore);

// 归档模块列表：仅统计配置中声明归档条件且数据为真的模块
const archivedList = computed(() => {
  const data = currentData.value;
  const fields = runtimeConfig.value?.fields || [];
  return fields.filter((field) => isFieldRemoved(data, field));
});

// 悬浮面板显隐状态（popover 渲染到 body，避免被侧栏 overflow 裁剪）
const panelVisible = ref(false);

// 模块名称：统一走 store 映射（内部读取 data[模块key].ui.title），兜底 key
const getModuleName = (field) => resumeStore.getModel(field.key)?.name || field.key;

// 恢复单个模块：将归档条件指向的数据置为 false，表单与预览同步恢复渲染
function handleRestore(field) {
  resumeStore.setModuleArchived(field.key, false);
  if (!archivedList.value.length) panelVisible.value = false;
}
</script>

<template>
  <!-- 有归档模块才展示 -->
  <div v-if="archivedList.length">
    <header class="flex h-10 items-center justify-between">
      <div class="flex items-center gap-1 font-bold">
        <SfIcon icon="lucide:archive" size="3" />
        <div class="text-lg">{{ $t("archiveCount", { count: archivedList.length }) }}</div>
      </div>
      <el-popover v-model:visible="panelVisible" placement="right" :width="208" trigger="click">
        <template #reference>
          <div class="mr-1.5 flex cursor-pointer items-center gap-1 text-sm text-sf-theme">
            <span>{{ $t("restoreArchive") }}</span>
            <SfIcon icon="lucide:chevron-right" size="4" />
          </div>
        </template>
        <!-- 悬浮面板：从箭头右侧弹出 -->
        <ul class="flex flex-col gap-2">
          <li
            v-for="field in archivedList"
            :key="field.key"
            class="flex items-center justify-between gap-3"
          >
            <span class="truncate text-sm text-sf-text">{{ getModuleName(field) }}</span>
            <el-button size="small" @click="handleRestore(field)">{{ $t("restore") }}</el-button>
          </li>
        </ul>
      </el-popover>
    </header>
  </div>
</template>

<style scoped></style>
