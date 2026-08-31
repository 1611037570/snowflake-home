<script setup>
// 工具栏「一页纸」：复用预览层测量结果，同步计算压缩参数并写入简历 ui
import { ElMessage } from "element-plus";
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import Icon from "../components/icon.vue";
import { useSmartOnePage } from "../../preview/resumePages/useSmartOnePage";

const resumeStore = useResumeStore();
const { currentUI, system } = storeToRefs(resumeStore);

// 当前简历的 ui 与页码开关（与预览层组装一致）
const ui = computed(() => currentUI.value || {});
const showPageNumber = computed(() => system.value.showPageNumber);

const { computeFit } = useSmartOnePage({ ui, showPageNumber });

// 点击执行：同步计算并应用，成功或失败均弹提示
const onFitOnePage = () => {
  const result = computeFit();
  if (!result) return;
  if (result.ok) {
    currentUI.value = { ...currentUI.value, ...result.fitParams };
    ElMessage.success("简历已压缩为一页");
  } else {
    ElMessage.error("内容过长，无法压缩到一页");
  }
};
</script>

<template>
  <Icon icon="fa6-solid:compress" size="4.5" content="智能一页纸" @click="onFitOnePage" />
</template>
