<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, inject } from "vue";
import { getTime } from "../../utils";
import Content from "../theme/content.vue";
import Title from "../theme/title.vue";
import Text from "./text.vue";

const resumeStore = useResumeStore();
const { currentData } = storeToRefs(resumeStore);

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

const projectList = computed(() => currentData.value.project || []);
</script>

<template>
  <div class="resume-row" data-module="project" :style="[lineHeightValue(), fontValue()]">
    <!-- 标题栏 -->
    <Title title="项目经历"></Title>
    <!-- 内容区 -->
    <template v-for="item in projectList" :key="item.name">
      <div class="mb-3 flex items-center justify-between" :style="[lineHeightValue(3)]">
        <div class="flex items-center gap-4">
          <div class="font-bold" :style="[fontValue(3)]">
            <Text v-model:value="item.name" v-model:newValue="item.newName" />
          </div>
          <div>
            <Text v-model:value="item.post" v-model:newValue="item.newPost" />
          </div>
        </div>
        <div class="flex items-center">
          <Text :value="getTime(item.time)" v-model:newValue="item.newTime" />
        </div>
      </div>
      <!-- 补充描述/经历 -->
      <Content :content="item.content" />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
