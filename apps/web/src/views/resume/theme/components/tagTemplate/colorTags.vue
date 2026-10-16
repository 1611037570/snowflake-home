<script setup lang="ts">
import { lightThemeColors } from "@/configs/modules/theme";
import ResumeField from "@/views/resume/editor/preview/components/resumeField/index.vue";

defineProps<{
  items: {
    name?: string; // 标签名称。
    desc?: string; // 笔记风展示的描述。
  }[]; // 当前展示的标签条目。
  variant: "notion" | "rainbowTag"; // 笔记风显示描述，彩虹标签只显示名称。
  sample?: boolean; // 是否显示编辑菜单中的静态示例。
}>();
</script>

<template>
  <!-- 彩色标签共用浅色实底、深色文字和最小字号，避免随主题背景失去对比。 -->
  <div class="flex w-full flex-wrap gap-3" :class="sample ? 'text-xs' : ''">
    <span
      v-for="(item, index) in items"
      :key="index"
      class="max-w-full rounded-3xl px-3 py-1 text-[#2e2e2e] break-words"
      :style="{
        backgroundColor: lightThemeColors[index % lightThemeColors.length].value,
        fontSize: 'max(12px, 1em)',
      }"
    >
      <template v-if="sample"><span class="font-bold">{{ item.name }}</span><span v-if="variant === 'notion' && item.desc" class="text-[0.875em]">{{ ` ${item.desc}` }}</span></template>
      <template v-else>
        <!-- 标签内的名称统一加粗，笔记风描述保持常规字重。 -->
        <ResumeField :model-value="item.name" tag="span" boxClass="font-bold" />
        <template v-if="variant === 'notion' && item.desc">{{ " " }}<span class="text-[0.875em]"><ResumeField :model-value="item.desc" tag="span" /></span></template>
      </template>
    </span>
  </div>
</template>
