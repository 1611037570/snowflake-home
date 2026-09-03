<script setup>
// 工具栏「一页纸」：发送事件，智能一页的计算与参数应用由预览层实例内部完成
import eventBus from "@/utils/modules/eventBus";
import Icon from "../components/icon.vue";

// 点击执行：通知编辑器预览实例执行智能一页
const onFitOnePage = () => {
  eventBus.emit("resume-smart-one-page");
};
</script>

<template>
  <Icon icon="fa6-solid:compress" size="4.5" content="智能一页纸" @click="onFitOnePage" />
</template>
