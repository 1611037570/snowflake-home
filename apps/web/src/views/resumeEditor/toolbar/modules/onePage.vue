<script setup>
// 工具栏「一页纸」：点击后自动压缩当前简历为单页，成功或失败均弹提示
import { ElMessage } from "element-plus";
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import Icon from "../components/icon.vue";
import MeasureContent from "../../preview/components/measureContent.vue";
import { RESUME_WIDTH } from "../../preview/constants";
import { useSmartOnePage } from "../../preview/resumePages/useSmartOnePage";

const resumeStore = useResumeStore();
const { currentConfig, currentFixedConfig, currentUI, system, selectedModule } =
  storeToRefs(resumeStore);

// 当前简历的 ui 与模块列表（与预览层组装一致）
const ui = computed(() => currentUI.value || {});
const showPageNumber = computed(() => system.value.showPageNumber);
const allModules = computed(() => {
  const fixedModules = currentFixedConfig.value?.fields || [];
  const configModules = currentConfig.value?.fields || [];
  return [...fixedModules, ...configModules];
});

// 工具栏执行无需模块选中高亮
const isReadonly = computed(() => true);

// 仅点击后才启用收敛
const enabled = ref(false);

const { measureRef, themeStyles, fitParams, ready, isOnePage } = useSmartOnePage({
  ui,
  showPageNumber,
  selectedModule,
  isReadonly,
  enabled,
});
// 解构主题样式（嵌套 ref 在模板中不会自动解包）
const { paddingValue } = themeStyles;

// 收敛完成后：成功则写回简历 ui 并提示，失败则提示
const applyOrWarn = () => {
  if (isOnePage.value) {
    currentUI.value = { ...currentUI.value, ...fitParams.value };
    ElMessage.success("简历已压缩为一页");
  } else {
    ElMessage.error("内容过长，无法压缩到一页");
  }
};

// 点击后执行：已收敛则直接应用；否则启用收敛等待完成
let pendingApply = false;
const onFitOnePage = () => {
  if (ready.value) {
    applyOrWarn();
    return;
  }
  if (enabled.value) return; // 收敛中，忽略重复点击
  pendingApply = true;
  enabled.value = true;
};

// 本次点击触发的收敛完成后，应用结果并提示
watch(ready, (val) => {
  if (val && pendingApply) {
    pendingApply = false;
    applyOrWarn();
  }
});
</script>

<template>
  <!-- 隐藏测量容器：一页纸压缩依赖的真实 DOM 测量，不参与可见布局 -->
  <MeasureContent
    class="fixed -top-999 -left-999 bg-white text-black"
    :class="ui.fontFamily"
    ref="measureRef"
    :style="[paddingValue(), { width: `${RESUME_WIDTH}px` }]"
    :all-modules="allModules"
  />
  <Icon icon="fa6-solid:compress" size="4.5" content="智能一页纸" @click="onFitOnePage" />
</template>

<style lang="scss" scoped></style>
