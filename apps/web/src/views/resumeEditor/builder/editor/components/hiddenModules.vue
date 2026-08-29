<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { isFieldHidden } from "@/components/business/dynamicForm/code/fieldVisible";

const resumeStore = useResumeStore();
const { currentConfig, currentData } = storeToRefs(resumeStore);

// 隐藏模块列表：仅统计配置中声明隐藏条件且数据为真的模块
const hiddenList = computed(() => {
  const data = currentData.value;
  const fields = currentConfig.value?.fields || [];
  return fields.filter((field) => isFieldHidden(data, field));
});

// 弹窗状态
const dialogVisible = ref(false);
function handleOpen() {
  dialogVisible.value = true;
}

// 模块名称：优先 store 映射，其次自定义模块数据里的 name，兜底 key
const getModuleName = (field) => resumeStore.getModel(field.key)?.name || field.key;

// 恢复模块：将隐藏条件指向的数据置为 false，表单与预览同步恢复渲染
function setFieldHidden(field, value) {
  const path = field.checks?.hidden?.path;
  if (!path?.length) return;
  let cur = currentData.value;
  for (let i = 0; i < path.length - 1; i++) {
    cur = cur?.[path[i]];
  }
  if (cur) cur[path[path.length - 1]] = value;
}

// 恢复单个模块：全部恢复后自动关闭弹窗
function handleRestore(field) {
  setFieldHidden(field, false);
  if (!hiddenList.value.length) dialogVisible.value = false;
}
</script>

<template>
  <!-- 有隐藏模块才展示 -->
  <div v-if="hiddenList.length">
    <header class="mt-2 mb-3 flex items-center text-lg font-bold">
      <SfIcon icon="lucide:eye-off" size="5" />
      <div>隐藏模块</div>
    </header>
    <div
      class="flex cursor-pointer items-center gap-1 text-sm text-sf-theme"
      @click="handleOpen"
    >
      <span>隐藏 {{ hiddenList.length }} 个模块，点击恢复</span>
      <SfIcon icon="lucide:chevron-right" size="4" />
    </div>

    <SfModal v-model="dialogVisible" title="隐藏模块">
      <ul class="flex w-80 flex-col gap-2 p-5">
        <li
          v-for="field in hiddenList"
          :key="field.key"
          class="flex items-center justify-between gap-3"
        >
          <span class="truncate text-sm text-sf-text">{{ getModuleName(field) }}</span>
          <el-button size="small" @click="handleRestore(field)">恢复</el-button>
        </li>
      </ul>
    </SfModal>
  </div>
</template>

<style scoped></style>
