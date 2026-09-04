<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAiStore } from "@/stores";

const aiStore = useAiStore();
const { activeModel, customModels } = storeToRefs(aiStore);

// 模型选项列表（雪花服务 + 自定义模型）
const modelOptions = computed(() => {
  const options = [{ value: "snowflake", name: "雪花服务" }];
  // 添加自定义模型
  customModels.value.forEach((model) => {
    options.push({
      value: model.provider,
      name: `${model.model} (${model.provider})`,
    });
  });
  return options;
});
</script>

<template>
  <!-- 模型切换下拉框 -->
  <SfSelect
    v-model="activeModel"
    :list="modelOptions"
    class="w-40"
    placeholder="选择模型"
  />
</template>
