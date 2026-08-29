<script setup>
import { ElMessage } from "element-plus";
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import Icon from "../components/icon.vue";

// 预设选择弹窗可见性
const visible = ref(false);

const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);

// 字体名映射
const FONT_NAMES = {
  "text-puhui": "阿里普惠体",
  "text-yyqx": "汉仪易烊千玺体",
  "": "跟随系统",
};

// 间距档位：由 moduleSpacing 归一化展示
const densityOf = (spacing) => (spacing >= 20 ? "宽松" : spacing >= 10 ? "标准" : "紧凑");

// 一键设计预设：覆盖字体/间距/配色等 UI 参数，取值均在 uiParamRanges 范围内
const PRESETS = [
  {
    name: "极简留白",
    desc: "大留白 + 宽松行距，干净大气，适合内容较少的简历",
    themeColor: "#40a9ff",
    ui: {
      padding: 48,
      fontSize: 15,
      lineHeight: 1.5,
      moduleSpacing: 24,
      fontFamily: "text-puhui",
      themeColor: "#40a9ff",
      userInfoMode: "text",
      themeTemplate: "default",
    },
  },
  {
    name: "紧凑商务",
    desc: "小边距 + 紧凑排版，一页纸友好，信息密度高",
    themeColor: "#ff4d4f",
    ui: {
      padding: 16,
      fontSize: 14,
      lineHeight: 1.15,
      moduleSpacing: 8,
      fontFamily: "text-puhui",
      themeColor: "#ff4d4f",
      userInfoMode: "icon",
      themeTemplate: "modern",
    },
  },
  {
    name: "创意撞色",
    desc: "大字号 + 图标信息 + 亮眼配色，适合设计类岗位",
    themeColor: "#9254de",
    ui: {
      padding: 24,
      fontSize: 18,
      lineHeight: 1.4,
      moduleSpacing: 16,
      fontFamily: "text-yyqx",
      themeColor: "#9254de",
      userInfoMode: "icon",
      themeTemplate: "modern",
    },
  },
  {
    name: "稳重深蓝",
    desc: "均衡参数 + 经典蓝色，稳重专业，适合技术/管理岗",
    themeColor: "#40a9ff",
    ui: {
      padding: 32,
      fontSize: 16,
      lineHeight: 1.3,
      moduleSpacing: 16,
      fontFamily: "text-puhui",
      themeColor: "#40a9ff",
      userInfoMode: "text",
      themeTemplate: "default",
    },
  },
  {
    name: "活力清新",
    desc: "系统字体 + 青绿色调，清爽有活力，适合应届/新锐岗位",
    themeColor: "#36cfc9",
    ui: {
      padding: 36,
      fontSize: 15,
      lineHeight: 1.45,
      moduleSpacing: 20,
      fontFamily: "",
      themeColor: "#36cfc9",
      userInfoMode: "icon",
      themeTemplate: "default",
    },
  },
  {
    name: "经典纸张",
    desc: "系统字体 + 暖色点缀，纸质简历质感，通用稳妥",
    themeColor: "#ffa940",
    ui: {
      padding: 40,
      fontSize: 14,
      lineHeight: 1.35,
      moduleSpacing: 18,
      fontFamily: "",
      themeColor: "#ffa940",
      userInfoMode: "text",
      themeTemplate: "default",
    },
  },
];

// 套用预设：合并进当前 UI 配置，保留其它自定义项
const applyPreset = (preset) => {
  currentUI.value = { ...(currentUI.value ?? {}), ...preset.ui };
  visible.value = false;
  ElMessage.success(`已应用「${preset.name}」设计方案`);
};
</script>

<template>
  <Icon icon="mdi:palette-outline" size="4" content="设计预设" @click="visible = true" />

  <SfModal v-model="visible" title="一键设计预设">
    <div class="grid w-[560px] grid-cols-2 gap-3 p-4">
      <div
        v-for="preset in PRESETS"
        :key="preset.name"
        class="cursor-pointer rounded-2xl border border-sf-b p-4 transition-all duration-200 hover:-translate-y-1 hover:border-sf-theme hover:bg-sf-theme-3"
        @click="applyPreset(preset)"
      >
        <div class="mb-2 flex items-center gap-2">
          <span class="h-4 w-4 rounded-full" :style="{ backgroundColor: preset.themeColor }"></span>
          <span class="text-base font-bold">{{ preset.name }}</span>
        </div>
        <div class="text-sm leading-snug text-sf-text-2">{{ preset.desc }}</div>
        <div class="mt-2 flex items-center gap-2 text-xs text-sf-text-3">
          <span>字体：{{ FONT_NAMES[preset.ui.fontFamily] }}</span>
          <span>·</span>
          <span>密度：{{ densityOf(preset.ui.moduleSpacing) }}</span>
        </div>
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
