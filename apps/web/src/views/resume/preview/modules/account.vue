<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { computed, inject } from "vue";
import Text from "./text.vue";

const resumeStore = useResumeStore();
const { currentData } = storeToRefs(resumeStore);

const fontValue = inject("fontValue");
const lineHeightValue = inject("lineHeightValue");

const account = computed(() => currentData.value.account || []);
</script>

<template>
  <div class="resume-row" data-module="work" :style="[lineHeightValue(), fontValue()]">
    <!-- 社交链接 -->
    <div
      v-for="(item, index) in account"
      :key="index"
      class="mt-1 flex items-center gap-2"
      data-module="user"
    >
      <Text v-model:value="item.name" v-model:newValue="item.newName" />
      <span v-if="item.name && item.url" class="pr-1">：</span>
      <a :href="item.url" target="_blank" class="font-medium hover:underline">
        <Text v-model:value="item.url" v-model:newValue="item.newUrl" />
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
