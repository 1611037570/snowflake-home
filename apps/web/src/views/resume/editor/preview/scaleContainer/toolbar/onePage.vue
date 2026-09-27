<script setup>
// 工具栏「一页纸」：发送事件，智能一页的计算与参数应用由预览层实例内部完成
import eventBus from "@/utils/modules/eventBus";

// 点击执行：通知编辑器预览实例执行智能一页
const onFitOnePage = () => {
  eventBus.emit("resume-smart-one-page");
};
</script>

<template>
  <SfTooltip :content="$t('smartOnePage')">
    <SfIcon
      icon="fa6-solid:compress"
      @click="onFitOnePage"
      size="5"
      boxSize="7"
      class="rounded-full text-sf-text-2 hover:bg-sf-theme-2 hover:text-sf-theme-text"
    />
  </SfTooltip>
</template>
