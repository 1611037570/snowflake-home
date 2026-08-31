<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { setFieldHidden } from "../../../utils";
import { isFieldHidden } from "@/components/business/dynamicForm/code/fieldVisible";

const resumeStore = useResumeStore();
const { currentConfig, currentData } = storeToRefs(resumeStore);

// 隐藏模块列表：仅统计配置中声明隐藏条件且数据为真的模块
const hiddenList = computed(() => {
  const data = currentData.value;
  const fields = currentConfig.value?.fields || [];
  return fields.filter((field) => isFieldHidden(data, field));
});

// 悬浮面板显隐状态（popover 渲染到 body，避免被侧栏 overflow 裁剪）
const panelVisible = ref(false);

// 模块名称：优先 store 映射，其次自定义模块数据里的 name，兜底 key
const getModuleName = (field) => resumeStore.getModel(field.key)?.name || field.key;

// 恢复单个模块：将隐藏条件指向的数据置为 false，表单与预览同步恢复渲染
function handleRestore(field) {
  setFieldHidden(currentData.value, field, false);
  if (!hiddenList.value.length) panelVisible.value = false;
}
</script>

<template>
  <!-- 有隐藏模块才展示 -->
  <div v-if="hiddenList.length">
    <header class="mt-2 mb-3 flex items-center justify-between">
      <div class="flex items-center gap-1 font-bold">
        <SfIcon icon="lucide:eye-off" size="3" />
        <div class="text-lg">被隐藏模块{{ hiddenList.length }} 个</div>
      </div>
      <el-popover v-model:visible="panelVisible" placement="right" :width="208" trigger="click">
        <template #reference>
          <div class="flex cursor-pointer items-center gap-1 text-sm text-sf-theme">
            <span>点击恢复</span>
            <SfIcon icon="lucide:chevron-right" size="4" />
          </div>
        </template>
        <!-- 悬浮面板：从箭头右侧弹出 -->
        <ul class="flex flex-col gap-2">
          <li
            v-for="field in hiddenList"
            :key="field.key"
            class="flex items-center justify-between gap-3"
          >
            <span class="truncate text-sm text-sf-text">{{ getModuleName(field) }}</span>
            <el-button size="small" @click="handleRestore(field)">恢复</el-button>
          </li>
        </ul>
      </el-popover>
    </header>
  </div>
</template>

<style scoped></style>
