<script setup>
import { computed, inject } from "vue";
import { getTime } from "../../utils";
import ResumeField from "../components/resumeField/index.vue";
import Title from "../components/title/index.vue";
import { getValidData } from "./validData";
import { isContentEmpty } from "../modules/validData";
import ItemTitle from "../components/itemTitle.vue";
import ItemTags from "../components/itemTags.vue";
import InlineInfoList from "../components/inlineInfoList.vue";

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
const innerSpacingStyle = inject("innerSpacingStyle");
const linkUnderline = inject("linkUnderline", computed(() => false));
// 日期样式（2026.9 / 2026年9月），由设计配置注入
const dateStyle = inject("dateStyle");
// 日期位置（左/右），由设计配置注入
const datePosition = inject("datePosition");
const dateLeft = computed(() => datePosition?.value === "left");
// 项目、工作与自定义经历使用统一的分层信息布局。
const hasStructuredLayout =
  ["project", "work"].includes(props.moduleName) || props.moduleName.startsWith("custom_");

// 数组记录统一由 getValidData 过滤并提取业务内容
const list = computed(() => getValidData(previewData.value?.[props.dataKey]?.list || []));

// 条目链接兼容对象与旧数据中的字符串，展示内容不限制用户输入格式
const getItemLink = (item) => {
  const link = item?.link;
  if (typeof link === "string") return { name: "", url: link.trim() };
  if (!link || typeof link !== "object") return { name: "", url: "" };
  return {
    name: String(link.name || "").trim(),
    url: String(link.url || "").trim(),
  };
};

// 条目是否含首行信息，链接也属于首行信息
const hasItemHeader = (item) => {
  const link = getItemLink(item);
  return Boolean(item.name || item.department || item.post || item.startTime || item.endTime || link.name || link.url);
};
</script>

<template>
  <div class="resume-row" :data-module="moduleName" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏 -->
    <Title :module-key="moduleName"></Title>
    <!-- 内容区 -->
    <template v-for="(item, index) in list" :key="index">
      <!-- 项目、工作与自定义经历按名称、岗位信息、标签链接分层展示，避免首行信息过多 -->
      <div v-if="hasStructuredLayout && hasItemHeader(item)" :style="paragraphSpacingStyle">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="min-w-0 flex-1">
            <ItemTitle :name="item.name" :emphasis="!dateLeft" />
          </div>
          <div
            class="flex max-w-full min-w-0 flex-wrap items-center"
            :class="dateLeft ? 'order-first' : ''"
          >
            <span :class="{ 'font-bold': dateLeft }" :style="dateLeft ? fontValue(1) : undefined">
              {{ getTime(item.startTime, item.endTime, dateStyle) }}
            </span>
          </div>
        </div>
        <div
          class="flex flex-wrap items-center justify-between gap-3"
          :style="innerSpacingStyle"
        >
          <div class="max-w-full min-w-0 flex-1">
            <InlineInfoList :items="[item.post, item.department]" />
          </div>
          <div class="flex max-w-full min-w-0 flex-wrap items-center">
            <ResumeField :model-value="item.city" />
          </div>
        </div>
        <div
          v-if="
            item.tags?.length ||
            (hasStructuredLayout && (getItemLink(item).name || getItemLink(item).url))
          "
          class="flex flex-wrap items-center justify-between gap-3"
          :style="innerSpacingStyle"
        >
          <!-- 标签组件是多根节点，包裹后作为整体参与左右布局 -->
          <div class="flex flex-wrap items-center gap-3">
            <ItemTags :tags="item.tags" />
          </div>
          <template
            v-if="
              hasStructuredLayout &&
              (getItemLink(item).url || getItemLink(item).name)
            "
          >
            <a
              v-if="getItemLink(item).url"
              :href="getItemLink(item).url"
              :title="getItemLink(item).name"
              target="_blank"
              rel="noopener noreferrer"
              class="inline max-w-full min-w-0 break-all hover:underline"
              :class="{ underline: linkUnderline }"
            >
              <ResumeField
                :model-value="getItemLink(item).name || getItemLink(item).url"
                class="inline max-w-full min-w-0 break-all"
              />
            </a>
            <span v-else class="text-sf-theme">{{ getItemLink(item).name }}</span>
          </template>
        </div>
      </div>
      <div v-else-if="hasItemHeader(item)" :style="paragraphSpacingStyle">
        <!-- 首行：名称与部门，右侧时间 -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <!-- 信息容器撑满行内剩余宽度，避免导出渲染时子项宽度取整触发换行错位 -->
          <div
            class="flex max-w-full min-w-0 flex-1 flex-wrap items-center gap-3"
          >
            <ItemTitle :name="item.name" :emphasis="!dateLeft" />
            <ResumeField :model-value="item.department" />
            <!-- 条目标签：仅声明标签的模块有数据时渲染 -->
            <ItemTags :tags="item.tags" />
          </div>
          <div
            class="flex max-w-full min-w-0 flex-wrap items-center"
            :class="dateLeft ? 'order-first' : ''"
          >
            <span :class="{ 'font-bold': dateLeft }" :style="dateLeft ? fontValue(1) : undefined">
              {{ getTime(item.startTime, item.endTime, dateStyle) }}
            </span>
          </div>
        </div>
        <!-- 次行：岗位居左，城市居右 -->
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex max-w-full min-w-0 flex-1 flex-wrap items-center">
            <ResumeField :model-value="item.post" />
          </div>
          <div class="flex max-w-full min-w-0 flex-wrap items-center">
            <ResumeField :model-value="item.city" />
          </div>
        </div>
      </div>
      <!-- 补充描述/经历：无首行时由段间距承担上间距，有首行时使用内部间距贴合 -->
      <ResumeField
        :model-value="item.content"
        html
        v-if="!isContentEmpty(item.content)"
        :style="hasItemHeader(item) ? innerSpacingStyle : paragraphSpacingStyle"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
