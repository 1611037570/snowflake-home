<script setup>
import { useResumeStore } from "@/stores";
import { getExportFileName, resumeTitle } from "../../resumeName.ts";
import eventBus from "@/utils/modules/eventBus";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";

const visible = ref(false);
// 默认使用标准 1x，导出弹窗中可切换更高清晰度
const exportScale = ref(1);
const exportScaleList = [
  { name: "1x", value: 1 },
  { name: "2x", value: 2 },
  { name: "4x", value: 4 },
  { name: "8x", value: 8 },
];
// 根据倍率提示导出耗时和资源占用
const exportScaleTip = computed(() => {
  if (exportScale.value === 8) {
    return {
      class: "text-sf-error",
      text: "最高清晰度，导出很慢，占用大量内存，可能失败或崩溃。",
    };
  }
  if (exportScale.value === 4) {
    return {
      class: "text-sf-error",
      text: "最清晰，导出慢，占用较多内存，可能失败或崩溃。",
    };
  }
  if (exportScale.value === 2) {
    return {
      class: "text-sf-warning",
      text: "更清晰，导出速度稍慢。",
    };
  }
  return {
    class: "text-sf-text-2",
    text: "清晰度正常，导出速度快。",
  };
});
const resumeStore = useResumeStore();
const { currentItem, isPrinting } = storeToRefs(resumeStore);

// 导出当前完整简历为 JSON 文件（data/config/ui），支持无损导入恢复
const exportConfig = () => {
  const json = JSON.stringify(currentItem.value ?? {}, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  // 统一命名：年-月-日-简历标题（标题取自简历数据，非配置）
  link.download = getExportFileName(resumeTitle.value, "json");
  link.click();
  URL.revokeObjectURL(url);
};

// 统一通过事件总线触发编辑器中的导出 hooks；点击导出后关闭弹窗，加载浮层全屏展示
const emitExport = (eventName) => {
  if (isPrinting.value) return;
  visible.value = false;
  eventBus.emit(eventName, exportScale.value);
};

// 菜单配置
const list = [
  {
    name: "PDF文件",
    desc: "将简历导出为高清PDF格式，适合打印、邮件发送或存档，排版清晰不变形",
    fn: () => emitExport("resume-print-pdf"),
  },
  {
    name: "图片",
    desc: "将简历一键导出为PNG图片，方便在社交媒体、作品集或PPT中直接展示",
    fn: () => emitExport("resume-print-image"),
  },
];
const a = {
  name: "JSON完整备份",
  desc: "导出完整简历数据，支持无损导入恢复，方便随时备份或跨设备使用",
  fn: () => {
    // 导出配置后关闭弹窗
    visible.value = false;
    exportConfig();
  },
};
</script>

<template>
  <div
    @click="visible = true"
    class="flex h-9 cursor-pointer items-center gap-1 rounded-3xl border border-sf-b bg-sf-page p-1 px-2 text-sm transition-colors hover:bg-sf-theme hover:text-white"
  >
    <SfIcon icon="material-symbols:download" size="4" />
    <span> 导出简历 </span>
    <SfIcon icon="mingcute:down-line" size="4" />
  </div>

  <SfModal v-model="visible" title="导出简历">
    <div class="flex w-[400px] flex-col gap-3">
      <div class="text-lg">选择您希望导出简历的格式</div>

      <template v-for="item in list" :key="item.name">
        <div
          class="cursor-pointer rounded-3xl border border-sf-b p-3 transition-colors hover:bg-sf-theme-2"
          @click="item.fn"
        >
          <div class="text-xl">
            {{ item.name }}
          </div>
          <div class="text-sm">{{ item.desc }}</div>
        </div>
      </template>
      <div class="flex items-center gap-3">
        <span class="shrink-0">清晰度</span>
        <SfButton
          v-for="item in exportScaleList"
          :key="item.value"
          class="flex-1"
          border
          :type="exportScale === item.value ? 'theme' : 'bg'"
          @click="exportScale = item.value"
          >{{ item.name }}</SfButton
        >
      </div>
      <div class="rounded-xl bg-sf-bg-2 p-3 text-sm" :class="exportScaleTip.class">
        {{ exportScaleTip.text }}
      </div>
      <div>简历配置</div>
      <div
        class="cursor-pointer rounded-3xl border border-sf-b p-3 transition-colors hover:bg-sf-theme-2"
        @click="a.fn"
      >
        <div class="text-xl">
          {{ a.name }}
        </div>
        <div class="text-sm">{{ a.desc }}</div>
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
