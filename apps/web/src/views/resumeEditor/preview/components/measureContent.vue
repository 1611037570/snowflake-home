<script setup>
import { provide } from "vue";
import ResumeModule from "../modules/index.vue";

defineProps({
  allModules: {
    type: Array,
    required: true,
  },
});

// 标记当前处于离屏测量子树：下游 diffField 据此跳过 registry 注册与高亮 class，避免双份实例开销
provide("isMeasureMode", true);
</script>

<template>
  <div class="flex flex-col">
    <template v-for="(item, index) in allModules" :key="index">
      <ResumeModule :data="item" :name="item.key" class="resume-module-wrapper" />
    </template>
  </div>
</template>
