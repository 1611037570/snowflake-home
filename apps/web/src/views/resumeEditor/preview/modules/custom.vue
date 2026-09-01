<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, inject } from "vue";
import { getTime } from "../../utils";
import Content from "../theme/content.vue";
import Title from "../theme/title/index.vue";
import Text from "./text.vue";
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
});
// 从上层注入获取代理后的预览数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

const resumeStore = useResumeStore();
const { currentConfig } = storeToRefs(resumeStore);

// 代理数据解包访问自定义模块数组（数据以模块 key 为路径）
const customList = computed(() => previewData.value?.[props.name]?.data || []);
// 从表单配置中反查标题
const title = computed(() => {
  const field = currentConfig.value?.fields.find((f) => f.key === props.name);
  return field?.name;
});
</script>

<template>
  <div class="resume-row" :data-module="name" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏 -->
    <Title :title="title"></Title>
    <!-- 内容区 -->
    <template v-for="(item, index) in customList" :key="index">
      <div class="mb-3 flex flex-wrap items-center justify-between">
        <div class="flex min-w-0 max-w-full flex-wrap items-center gap-4">
          <div class="font-bold" :style="[fontValue(3)]">
            <Text v-model="item.name" />
          </div>
          <div>
            <Text v-model="item.post" />
          </div>
        </div>
        <div class="flex min-w-0 max-w-full flex-wrap items-center">
          <Text v-model="item.time" :display-value="getTime(item.time?.value)" />
        </div>
      </div>
      <!-- 补充描述/经历 -->
      <Content :content="item.content" />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
