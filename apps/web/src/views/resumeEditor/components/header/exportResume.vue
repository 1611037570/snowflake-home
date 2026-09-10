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
    icon: "mdi:file-pdf-box",
    desc: "适合打印、发送或存档",
    fn: () => emitExport("resume-print-pdf"),
  },
  {
    name: "长图",
    icon: "material-symbols:image-outline",
    desc: "适合快速分享",
    fn: () => emitExport("resume-print-image"),
  },
  {
    name: "Markdown文档",
    icon: "mdi:language-markdown",
    desc: "适合编辑和分享的文本",
    fn: () => emitExport("resume-print-markdown"),
  },
  {
    name: "HTML网页",
    icon: "mdi:language-html5",
    desc: "适合编辑和分享的网页",
    fn: () => emitExport("resume-print-html"),
  },
];
const a = {
  name: "JSON完整备份",
  icon: "mdi:file-code-outline",
  desc: "备份、迁移或恢复完整简历数据",
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
    <div class="flex w-[600px] max-w-[90vw] flex-col gap-6">
      <div>
        <div class="text-lg font-bold">导出格式</div>
        <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            v-for="item in list"
            :key="item.name"
            class="group flex min-w-0 cursor-pointer items-center gap-3 rounded-3xl border border-sf-b p-3 transition-colors hover:border-sf-theme hover:bg-sf-theme-2"
            @click="item.fn"
          >
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sf-theme-2 text-sf-theme"
            >
              <SfIcon :icon="item.icon" size="6" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="truncate text-base font-bold">{{ item.name }}</div>
              <div class="mt-3 text-sm text-sf-text-2">{{ item.desc }}</div>
            </div>
            <SfIcon
              icon="mingcute:right-line"
              size="4"
              class="shrink-0 text-sf-text-3 transition-transform group-hover:translate-x-1 group-hover:text-sf-theme"
            />
          </div>
        </div>

        <div class="mt-3 flex flex-col gap-3 rounded-3xl bg-sf-bg-2 p-3">
          <div class="flex items-center justify-between gap-3">
            <span class="font-bold">清晰度</span>
            <span class="text-sm text-sf-text-2">导出图片质量</span>
          </div>
          <div class="flex items-center gap-3">
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
          <div class="text-sm" :class="exportScaleTip.class">
            {{ exportScaleTip.text }}
          </div>
        </div>
      </div>

      <div>
        <div class="text-lg font-bold">简历配置</div>
        <div
          class="group mt-3 flex cursor-pointer items-center gap-3 rounded-3xl border border-sf-b p-3 transition-colors hover:border-sf-theme hover:bg-sf-theme-2"
          @click="a.fn"
        >
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sf-bg-2 text-sf-theme"
          >
            <SfIcon :icon="a.icon" size="6" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="text-base font-bold">{{ a.name }}</div>
            <div class="mt-3 text-sm text-sf-text-2">{{ a.desc }}</div>
          </div>
          <SfIcon
            icon="mingcute:right-line"
            size="4"
            class="shrink-0 text-sf-text-3 transition-transform group-hover:translate-x-1 group-hover:text-sf-theme"
          />
        </div>
      </div>
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
