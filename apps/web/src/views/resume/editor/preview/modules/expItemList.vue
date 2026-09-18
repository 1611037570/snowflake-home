<script setup>
import { computed, inject } from "vue";
import { getTime } from "../../utils";
import ResumeField from "../components/resumeField/index.vue";
import Title from "../components/title/index.vue";
import { getValidData } from "./validData";
import { isContentEmpty } from "../modules/validData";
import ItemTitle from "../components/itemTitle.vue";
import ItemTags from "../components/itemTags.vue";

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
// 日期样式（2026.9 / 2026年9月），由设计配置注入
const dateStyle = inject("dateStyle");

// 数组记录统一由 getValidData 过滤并提取业务内容
const list = computed(() => getValidData(previewData.value?.[props.dataKey]?.list || []));

// 条目是否含首行信息（名称/部门/岗位/时间），为空时不渲染首行，避免多出空行间距
const hasItemHeader = (item) =>
  Boolean(item.name || item.department || item.post || item.startTime || item.endTime);
</script>

<template>
  <div class="resume-row" :data-module="moduleName" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏 -->
    <Title :module-key="moduleName"></Title>
    <!-- 内容区 -->
    <template v-for="(item, index) in list" :key="index">
      <div v-if="hasItemHeader(item)" :style="paragraphSpacingStyle">
        <!-- 首行：名称与部门，右侧时间 -->
        <div class="flex flex-wrap items-center justify-between">
          <!-- 信息容器撑满行内剩余宽度，避免导出渲染时子项宽度取整触发换行错位 -->
          <div class="flex max-w-full min-w-0 flex-1 flex-wrap items-center gap-3">
            <ItemTitle :name="item.name" />
            <ResumeField :model-value="item.department" />
            <!-- 条目标签：仅声明标签的模块有数据时渲染 -->
            <ItemTags :tags="item.tags" />
          </div>
          <div class="flex max-w-full min-w-0 flex-wrap items-center">
            <span>{{ getTime(item.startTime, item.endTime, dateStyle) }}</span>
          </div>
        </div>
        <!-- 次行：岗位居左，城市居右 -->
        <div class="flex flex-wrap items-center justify-between">
          <div class="flex max-w-full min-w-0 flex-1 flex-wrap items-center">
            <ResumeField :model-value="item.post" />
          </div>
          <div class="flex max-w-full min-w-0 flex-wrap items-center">
            <ResumeField :model-value="item.city" />
          </div>
        </div>
      </div>
      <!-- 补充描述/经历：无首行时由段间距承担上间距，有首行时用固定 mt-3 与首行贴合 -->
      <ResumeField
        :model-value="item.content"
        html
        v-if="!isContentEmpty(item.content)"
        :style="hasItemHeader(item) ? undefined : paragraphSpacingStyle"
        :class="hasItemHeader(item) ? 'mt-3' : ''"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
