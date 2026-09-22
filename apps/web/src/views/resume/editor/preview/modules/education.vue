<script setup>
import { computed, inject } from "vue";
import ResumeField from "../components/resumeField/index.vue";
import Title from "../components/title/index.vue";
import { isContentEmpty } from "../modules/validData";
import { getTime } from "../../utils";
import { getValidData } from "./validData";
import ItemTags from "../components/itemTags.vue";
import InlineInfoList from "../components/inlineInfoList.vue";

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

// 数组记录统一由 getValidData 过滤并提取业务内容
const education = computed(() => {
  const list = previewData.value?.education?.list || [];
  return getValidData(list);
});

// 判断是否有某项字段（用于渲染 infoList 的分隔点）
const hasField = (item, key) => {
  const v = item?.[key];
  return v && typeof v === "string" && v.trim();
};

// 教育经历链接兼容对象与旧数据中的字符串。
const getItemLink = (item) => {
  const link = item?.link;
  if (typeof link === "string") return { name: "", url: link.trim() };
  if (!link || typeof link !== "object") return { name: "", url: "" };
  return {
    name: String(link.name || "").trim(),
    url: String(link.url || "").trim(),
  };
};

// 条目是否含首行信息（名称/专业/学院/学历/学制/时间），为空时不渲染首行，避免多出空行间距
const hasItemHeader = (item) =>
  Boolean(
    item.name ||
      hasField(item, "college") ||
      hasField(item, "education") ||
      hasField(item, "mode") ||
      getTime(item.startTime, item.endTime, dateStyle),
  );

// 次信息行是否可渲染
const hasSubInfo = (item) => Boolean(hasField(item, "post") || hasField(item, "city"));

// 内容行成为条目首块（首行与次信息行都不渲染）时，由它承担段间距
const contentIsFirst = (item) => !hasItemHeader(item) && !hasSubInfo(item);

// 教育条目存在任一可展示信息时才创建条目容器
const hasEducationItem = (item) => {
  const link = getItemLink(item);
  return hasItemHeader(item) || hasSubInfo(item) || item.tags?.length || link.name || link.url;
};

// 教育条目的第二行包含专业、学院或城市
const hasEducationMeta = (item) =>
  hasField(item, "post") ||
  hasField(item, "college") ||
  hasField(item, "city");
</script>

<template>
  <div class="resume-row w-full" data-module="education" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏 -->
    <Title module-key="education"></Title>
    <!-- 内容区：直接渲染已过滤的业务数据 -->
    <template v-for="(item, index) in education" :key="index">
      <div
        v-if="hasEducationItem(item)"
        :style="paragraphSpacingStyle"
      >
        <!-- 学校名称、学历与学制放在同一行，时间保持右侧对齐 -->
        <div
          v-if="hasItemHeader(item)"
          class="flex flex-wrap items-center justify-between gap-3"
        >
          <div class="max-w-full min-w-0 flex-1">
            <InlineInfoList
              :items="[
                { value: item.name, emphasis: !dateLeft },
                item.education,
                item.mode,
              ]"
            />
          </div>
          <div
            class="flex max-w-full min-w-0 flex-wrap items-center gap-2"
            :class="dateLeft ? 'order-first' : ''"
          >
            <span :class="{ 'font-bold': dateLeft }" :style="dateLeft ? fontValue(1) : undefined">
              {{ getTime(item.startTime, item.endTime, dateStyle) }}
            </span>
          </div>
        </div>
        <!-- 专业与学院信息放在第二行，城市保持右侧对齐 -->
        <div
          v-if="hasEducationMeta(item)"
          class="flex flex-wrap items-center justify-between gap-3"
          :style="innerSpacingStyle"
        >
          <div class="max-w-full min-w-0 flex-1">
            <InlineInfoList :items="[item.post, item.college]" />
          </div>
          <div class="flex max-w-full min-w-0 flex-wrap items-center">
            <ResumeField v-if="hasField(item, 'city')" :model-value="item.city" />
          </div>
        </div>
        <!-- 学校标签与链接独立成行，避免和学校名称及时间争抢空间 -->
        <div
          v-if="item.tags?.length || getItemLink(item).name || getItemLink(item).url"
          class="flex flex-wrap items-center justify-between gap-3"
          :style="innerSpacingStyle"
        >
          <div class="flex flex-wrap items-center gap-3">
            <ItemTags :tags="item.tags" />
          </div>
          <template v-if="getItemLink(item).url || getItemLink(item).name">
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
      <!-- 补充描述/经历：成为条目首块时由段间距承担上间距 -->
      <ResumeField
        :model-value="item.content"
        html
        :style="contentIsFirst(item) ? paragraphSpacingStyle : innerSpacingStyle"
        v-if="!isContentEmpty(item.content)"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
