<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, inject } from "vue";
import Content from "../theme/content.vue";
import Title from "../theme/title.vue";
import Text from "./text.vue";

import { getTime } from "../../utils";

const resumeStore = useResumeStore();
const { currentData } = storeToRefs(resumeStore);

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");
const education = computed(() => {
  return (currentData.value.education || []).map((item) => ({
    ...item,
    infoList: [item.post, item.education, item.mode].filter(
      (v) => v && typeof v === "string" && v.trim(),
    ),
  }));
});
</script>

<template>
  <div class="resume-row w-full" data-module="education" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏 -->
    <Title title="教育经历"></Title>
    <!-- 内容区 -->
    <template v-for="(item, index) in education" :key="index">
      <div
        class="mt-2 flex items-center justify-between"
        :style="[lineHeightValue(3)]"
        v-if="item.name || getTime(item.time)"
      >
        <div class="flex items-baseline gap-4">
          <div class="font-bold" :style="[fontValue(3)]">
            <Text v-model:value="item.name" v-model:newValue="item.newName" />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Text :value="getTime(item.time)" v-model:newValue="item.newTime" />
        </div>
      </div>
      <div class="mt-1 flex items-center gap-2" v-if="item.infoList">
        <template v-for="(field, i) in item.infoList" :key="i">
          <Text :value="field" v-model:newValue="item[`newField${i}`]" />
          <div v-if="i < item.infoList.length - 1" class="h-1 w-1 rounded-full bg-black"></div>
        </template>
      </div>
      <!-- 补充描述/经历 -->
      <Content :content="item.content" />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
