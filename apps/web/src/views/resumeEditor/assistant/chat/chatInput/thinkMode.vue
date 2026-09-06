<script setup>
import { storeToRefs } from "pinia";
import { useAiStore } from "@/stores";

const aiStore = useAiStore();
const { thinkMode } = storeToRefs(aiStore);

// 思考模式配置
const thinkModes = [
  {
    name: "快速模式",
    value: false,
  },
  {
    name: "深度思考",
    value: true,
  },
];
</script>

<template>
  <!-- 深度思考模式 -->
  <div class="flex items-center rounded-xl bg-sf-primary p-1">
    <button
      v-for="mode in thinkModes"
      :key="mode.value"
      class="relative cursor-pointer rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all duration-300"
      :class="
        thinkMode == mode.value
          ? 'bg-sf-theme text-white'
          : 'text-sf-text-3 hover:bg-sf-bg-2 hover:text-sf-text'
      "
      @click="thinkMode = mode.value"
    >
      {{ mode.name }}
    </button>
  </div>
</template>
