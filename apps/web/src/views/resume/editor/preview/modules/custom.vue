<script setup>
import { computed, inject } from "vue";
import { getTime } from "../../utils";
import ResumeField from "../components/resumeField/index.vue";
import Title from "../components/title/index.vue";
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

// 自定义模块 data.list 为经历记录数组
const customData = computed(() => previewData.value?.[props.name]?.data || {});
const customList = computed(() => customData.value?.list || []);
</script>

<template>
  <div class="resume-row" :data-module="name" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏 -->
    <Title :module-key="name"></Title>
    <!-- 内容区 -->
    <template v-for="(item, index) in customList" :key="index">
      <div class="mb-3 flex flex-wrap items-center justify-between">
        <div class="flex max-w-full min-w-0 flex-wrap items-center gap-4">
          <div class="font-bold" :style="[fontValue(3)]">
            <ResumeField v-model="item.name" />
          </div>
          <div>
            <ResumeField v-model="item.post" />
          </div>
        </div>
        <div class="flex max-w-full min-w-0 flex-wrap items-center">
          <span>{{ getTime(item.time?.value) }}</span>
        </div>
      </div>
      <!-- 补充描述/经历 -->
      <ResumeField v-model="item.content" html />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
