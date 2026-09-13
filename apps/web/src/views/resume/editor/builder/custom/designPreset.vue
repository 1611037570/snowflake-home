<script setup>
import { ElMessage } from "element-plus";
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";

// 折叠面板：默认折叠
const activeNames = ref([]);

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);

// 一键设计预设：覆盖字体/间距/配色等 UI 参数（不修改模板 themeTemplate），取值均在 uiParamRanges 范围内
const PRESETS = [
  {
    name: "极简留白",
    desc: "大留白 + 宽松行距，适合内容较少的简历",
    themeColor: "#40a9ff",
    ui: {
      padding: 48,
      fontSize: 15,
      lineHeight: 1.5,
      moduleSpacing: 24,
      themeColor: "#40a9ff",
      userInfoMode: "text",
    },
  },
  {
    name: "紧凑商务",
    desc: "小边距 + 紧凑排版，一页纸友好。",
    themeColor: "#ff4d4f",
    ui: {
      padding: 16,
      fontSize: 14,
      lineHeight: 1.15,
      moduleSpacing: 8,
      themeColor: "#ff4d4f",
      userInfoMode: "icon",
    },
  },
];

// 套用预设：合并进当前 UI 配置，保留其它自定义项
const applyPreset = (preset) => {
  currentUI.value = { ...(currentUI.value ?? {}), ...preset.ui };
  ElMessage.success(`已应用「${preset.name}」设计方案`);
};
</script>

<template>
  <!-- 一键设计预设：折叠面板，默认折叠，直接渲染预设卡片 -->
  <SfCollapse v-model="activeNames">
    <SfCollapseItem name="designPreset">
      <template #title>
        <div class="flex items-center gap-2 text-base font-bold text-sf-text">
          <SfIcon icon="mdi:palette-outline" size="4" />
          <span>一键设计</span>
        </div>
      </template>
      <div class="grid grid-cols-2 gap-3 py-2">
        <div
          v-for="preset in PRESETS"
          :key="preset.name"
          class="cursor-pointer rounded-2xl border border-sf-b p-3 transition-all duration-200 hover:-translate-y-1 hover:border-sf-theme hover:bg-sf-theme-3"
          @click="applyPreset(preset)"
        >
          <div class="mb-2 flex items-center gap-2">
            <span
              class="h-4 w-4 rounded-full"
              :style="{ backgroundColor: preset.themeColor }"
            ></span>
            <span class="text-base font-bold">{{ preset.name }}</span>
          </div>
          <div class="text-sm leading-snug text-sf-text-2">{{ preset.desc }}</div>
        </div>
      </div>
    </SfCollapseItem>
  </SfCollapse>
</template>

<style lang="scss" scoped></style>
