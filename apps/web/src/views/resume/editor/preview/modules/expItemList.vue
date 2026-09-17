<script setup>
import { computed, inject } from "vue";
import { getTime } from "../../utils";
import ResumeField from "../components/resumeField/index.vue";
import Title from "../components/title/index.vue";
import { getValidData } from "./validData";
import { isContentEmpty } from "../modules/validData";
// 属性：模块标识、标题、数据 key
const props = defineProps({
  moduleName: {
    type: String,
    required: true,
  },
  dataKey: {
    type: String,
    required: true,
  },
});

// 从上层注入获取原始简历数据
const previewData = inject("previewData");

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");
const paragraphSpacingStyle = inject("paragraphSpacingStyle");

// 数组记录统一由 getValidData 过滤并提取业务内容
const list = computed(() => getValidData(previewData.value?.[props.dataKey]?.list || []));
</script>

<template>
  <div class="resume-row" :data-module="moduleName" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏 -->
    <Title :module-key="moduleName"></Title>
    <!-- 内容区 -->
    <template v-for="(item, index) in list" :key="index">
      <div :style="paragraphSpacingStyle" class="flex flex-wrap items-center justify-between">
        <!-- 信息容器撑满行内剩余宽度，避免导出渲染时子项宽度取整触发换行错位 -->
        <div class="flex max-w-full min-w-0 flex-1 flex-wrap items-center gap-4">
          <div class="font-bold" :style="[fontValue(3)]">
            <ResumeField :model-value="item.name" />
          </div>
          <div>
            <ResumeField :model-value="item.post" />
          </div>
        </div>
        <div class="flex max-w-full min-w-0 flex-wrap items-center">
          <span>{{ getTime(item.startTime, item.endTime) }}</span>
        </div>
      </div>
      <!-- 补充描述/经历 -->
      <ResumeField
        :model-value="item.content"
        html
        class="mt-3"
        v-if="!isContentEmpty(item.content)"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
