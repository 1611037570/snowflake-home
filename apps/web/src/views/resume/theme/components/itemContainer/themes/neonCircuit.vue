<script setup>
import { computed, inject } from "vue";
import { useItemBox } from "../useItemBox";
import { resumeModuleKey } from "@/views/resume/editor/preview/shared/moduleContext";

const props = defineProps({
  blockRange: { // 当前分片块区间
    type: Object, // 块区间对象类型
    default: () => ({ start: 0 /* 起始块 */, end: Number.MAX_SAFE_INTEGER /* 结束块 */ }), // 缺省完整条目
  },
  contentRange: { // 当前分片正文区间
    type: Object, // 字符区间对象类型
    default: undefined, // 缺省完整正文
  },
  decoration: { // 当前分片装饰阶段
    type: String, // 阶段编号类型
    default: "full", // 缺省完整条目
  },
  timeline: { // 公共时间轴状态
    type: Boolean, // 时间轴开关类型
    default: false, // 缺省不使用时间轴
  },
});
const moduleKey = inject(resumeModuleKey, computed(() => ""));
const isExperience = computed(() => ["work", "project", "education"].includes(moduleKey.value));
const isSkill = computed(() => moduleKey.value === "skill");
const { fragmentStyle, boxStyle } = useItemBox(props, {
  radius: "0", // 条目保持直角
  paddingLeft: isExperience.value ? "18px" : "0px", // 经历内容与青色引线错开
});
</script>

<template>
  <!-- 经历条目的线和方块仅作装饰，分片盒模型仍由公共方法计算。 -->
  <div class="resume-item relative box-border min-w-0" :class="{ 'resume-item--timeline': timeline }" :style="[boxStyle, fragmentStyle]">
    <span v-if="isExperience" aria-hidden="true" class="pointer-events-none absolute inset-y-0 left-0 w-px bg-[#57E8E8]/65" />
    <span v-if="isExperience && ['full', 'top'].includes(decoration)" aria-hidden="true" class="pointer-events-none absolute top-[3px] -left-[4px] size-[8px] bg-[#72FFF7] shadow-[0_0_8px_#72FFF7]" />
    <slot />
    <span v-if="isSkill" aria-hidden="true" class="pointer-events-none absolute right-0 bottom-0 left-0 h-px bg-[#6BF8F5] shadow-[0_0_6px_#6BF8F5]" />
  </div>
</template>

<style lang="scss" scoped>
@use "./itemBase.scss";
</style>
