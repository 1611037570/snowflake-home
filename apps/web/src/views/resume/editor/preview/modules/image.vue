<script setup>
import { computed } from "vue";
import ResumeField from "../components/resumeField/index.vue";
import Title from "../components/title/index.vue";
import { getPreviewTitle } from "../i18n";
import { getValidData } from "./validData";
import ItemTitle from "../components/itemTitle.vue";
import { useResumePreviewContext } from "../previewContext";
import ModuleContentContainer from "../components/moduleContentContainer.vue";

// 图片模块统一读取预览共享上下文。
const {
  data: previewData,
  lang: previewLang,
  theme: { fontValue, lineHeightValue, paragraphSpacingStyle },
} = useResumePreviewContext();
const imageAlt = computed(() => getPreviewTitle("image", previewLang.value));

// 数组记录统一由 getValidData 过滤并提取业务内容
const images = computed(() => getValidData(previewData.value?.image?.list || []));
</script>

<template>
  <div
    class="resume-row flex w-full flex-wrap items-start gap-x-3"
    data-module="image"
    :style="[lineHeightValue(), fontValue()]"
  >
    <!-- 模块根作为 flex 容器：作品卡片并排渲染、超出自动换行，且每个卡片独立成行便于分页识别 -->
    <!-- 标题栏：占满整行 -->
    <div class="w-full shrink-0">
      <Title module-key="image"></Title>
    </div>
    <!-- 单个作品：图片在上、名称在下，暂不展示描述 -->
    <ModuleContentContainer v-if="images.length" class="flex w-full flex-wrap items-start gap-x-3">
      <template v-for="(item, index) in images" :key="index">
      <div
        :style="[paragraphSpacingStyle, { width: `${item.size ?? 50}%` }]"
        class="flex min-w-0 flex-col gap-1"
      >
        <img v-if="item.img" :src="item.img" :alt="imageAlt" class="h-auto w-full rounded" />
        <ItemTitle :name="item.name" />
        <ResumeField class="text-center" :model-value="item.desc" />
      </div>
      </template>
    </ModuleContentContainer>
  </div>
</template>

<style lang="scss" scoped></style>
