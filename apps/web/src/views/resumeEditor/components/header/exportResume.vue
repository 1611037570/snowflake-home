<script setup>
import { useResumeStore } from "@/stores";
import { getExportFileName, getResumeTitle } from "../../resumeName.ts";
import eventBus from "@/utils/modules/eventBus";
import { storeToRefs } from "pinia";
import { ref } from "vue";

const visible = ref(false);
const resumeStore = useResumeStore();
const { currentConfig, currentData, isPrinting } = storeToRefs(resumeStore);

// 导出当前简历配置为 JSON 文件
const exportConfig = () => {
  const json = JSON.stringify(currentConfig.value ?? {}, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  // 统一命名：年-月-日-简历标题（标题取自简历数据，非配置）
  link.download = getExportFileName(getResumeTitle(currentData.value), "json");
  link.click();
  URL.revokeObjectURL(url);
};

// 统一通过事件总线触发编辑器中的导出 hooks；导出期间保留弹窗，加载浮层显示在弹窗上方
const emitExport = (eventName) => {
  if (isPrinting.value) return;
  eventBus.emit(eventName);
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
  {
    name: "JSON配置",
    desc: "导出当前的简历配置，支持完整无损导入，方便随时恢复进度或跨设备使用",
    fn: () => {
      // 与 PDF/图片一致：导出后保留弹窗不自动关闭
      exportConfig();
    },
  },
];
</script>

<template>
  <div
    @click="visible = true"
    class="flex h-9 cursor-pointer items-center gap-1 rounded-3xl border border-sf-b bg-sf-page p-1 px-3 text-sm"
  >
    <SfIcon icon="fa6-solid:file-export" size="4" class="text-sf-theme" />
    <span> 导出简历 </span>
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
    </div>
  </SfModal>
</template>

<style lang="scss" scoped></style>
