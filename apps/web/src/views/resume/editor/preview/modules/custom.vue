<script setup>
import { computed, inject } from "vue";
import { getTime } from "../../utils";
import ResumeField from "../components/resumeField/index.vue";
import Title from "../components/title/index.vue";
import { getValidData } from "./validData";
import { isContentEmpty } from "../modules/validData";
import ItemTitle from "../components/itemTitle.vue";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
});
// 从上层注入获取原始简历数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");
const paragraphSpacingStyle = inject("paragraphSpacingStyle");
// 日期样式（2026.9 / 2026年9月），由设计配置注入
const dateStyle = inject("dateStyle");

// 自定义模块与内置数组模块统一直接读取 list
const customList = computed(() => getValidData(previewData.value?.[props.name]?.list || []));
</script>

<template>
  <div class="resume-row" :data-module="name" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏 -->
    <Title :module-key="name"></Title>
    <!-- 内容区 -->
    <template v-for="(item, index) in customList" :key="index">
      <div :style="paragraphSpacingStyle" class="flex flex-wrap items-center justify-between">
        <div class="flex max-w-full min-w-0 flex-wrap items-center gap-3">
          <ItemTitle :name="item.name" />
          <div>
            <ResumeField :model-value="item.post" />
          </div>
        </div>
        <div class="flex max-w-full min-w-0 flex-wrap items-center">
          <span>{{ getTime(item.startTime, item.endTime, dateStyle) }}</span>
        </div>
      </div>
      <!-- 补充描述/经历 -->
      <ResumeField
        :model-value="item.content"
        html
        v-if="!isContentEmpty(item.content)"
        class="mt-3"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
