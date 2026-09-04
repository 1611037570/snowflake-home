<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAiStore } from "@/stores";

const aiStore = useAiStore();
const { activeModel, modelList } = storeToRefs(aiStore);

// 模型选项列表（雪花服务 + 已添加的自定义模型）
const modelOptions = computed(() => {
  const options: Array<{ value: string; name: string }> = [{ value: "snowflake", name: "雪花服务" }];
  // 添加已部署的自定义模型（至少要有 provider 和 key 才展示）
  modelList.value.forEach((model) => {
    if (model.provider && model.key) {
      options.push({
        value: model.id,
        name: model.name || `${model.model} (${model.provider})`,
      });
    }
  });
  return options;
});
</script>

<template>
  <!-- 模型切换下拉框 -->
  <SfSelect v-model="activeModel" :list="modelOptions" class="w-40" placeholder="选择模型" />
</template>
