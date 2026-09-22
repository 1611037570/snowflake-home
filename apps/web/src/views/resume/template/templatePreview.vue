<script setup>
// 通用简历预览：全屏展示简历，并在右侧展示调用方提供的文字信息
import { useResizeObserver } from "@vueuse/core";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import ResumePages from "@/views/resume/editor/preview/resumePages/index.vue";

defineOptions({ name: "ResumePreview" });

const props = defineProps({
  // 全屏是否可见，由父组件单向控制
  visible: {
    type: Boolean,
    default: false,
  },
  // 简历项：{ data, config, ui }
  item: {
    type: Object,
    required: true,
  },
  // 右侧信息标题
  title: {
    type: String,
    default: "简历模板",
  },
  // 右侧标题上方的场景文案
  eyebrowText: {
    type: String,
    default: "简历模板",
  },
  // 右侧主操作文案，为空时不显示主操作按钮
  primaryActionText: {
    type: String,
    default: "使用此模板",
  },
  // 右侧次操作文案
  secondaryActionText: {
    type: String,
    default: "返回模板列表",
  },
  // 模板预览只展示第一页，草稿预览仍保留完整分页
  singlePage: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "action"]);

const stageRef = ref(null);
const contentRef = ref(null);
const stageSize = ref({ width: 0, height: 0 });
const contentSize = ref({ width: 0, height: 0 });
const previousBodyOverflow = ref(null);

// 按左右栏可用空间缩放，优先让简历高度铺满且不产生滚动。
const scale = computed(() => {
  const { width: stageWidth, height: stageHeight } = stageSize.value;
  const { width: contentWidth, height: contentHeight } = contentSize.value;
  if (!stageWidth || !stageHeight || !contentWidth || !contentHeight) return 1;
  return Math.min(stageWidth / contentWidth, stageHeight / contentHeight);
});

const scaledContentStyle = computed(() => ({
  width: `${contentSize.value.width * scale.value}px`,
  height: `${contentSize.value.height * scale.value}px`,
}));

useResizeObserver(stageRef, ([entry]) => {
  const { width, height } = entry.contentRect;
  stageSize.value = { width, height };
});

useResizeObserver(contentRef, ([entry]) => {
  const { width, height } = entry.contentRect;
  contentSize.value = { width, height };
});

const handleKeydown = (event) => {
  if (event.key === "Escape" && props.visible) emit("close");
};

// 全屏打开时锁定页面滚动，关闭后恢复原页面状态。
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      window.addEventListener("keydown", handleKeydown);
      previousBodyOverflow.value = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return;
    }
    window.removeEventListener("keydown", handleKeydown);
    if (previousBodyOverflow.value !== null) {
      document.body.style.overflow = previousBodyOverflow.value;
      previousBodyOverflow.value = null;
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (previousBodyOverflow.value !== null) {
    document.body.style.overflow = previousBodyOverflow.value;
    previousBodyOverflow.value = null;
  }
});
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex h-dvh w-full overflow-hidden bg-sf-bg-2">
      <section class="flex h-full w-2/3 min-w-0 items-center justify-center overflow-hidden p-3">
        <div ref="stageRef" class="flex h-full w-full items-center justify-center overflow-hidden">
          <div class="relative shrink-0" :style="scaledContentStyle">
            <div
              ref="contentRef"
              class="absolute top-0 left-0 origin-top-left"
              :style="{ transform: `scale(${scale})` }"
            >
              <ResumePages :item="item" :mode="singlePage ? 'single' : 'preview'" />
            </div>
          </div>
        </div>
      </section>

      <aside class="flex h-full w-1/3 min-w-0 flex-col border-l border-sf-b bg-sf-primary p-6">
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 flex-col gap-3">
            <span class="text-sm font-medium text-sf-text-2">{{ eyebrowText }}</span>
            <h1 class="truncate text-2xl font-black text-sf-text">{{ title }}</h1>
          </div>
          <button
            type="button"
            class="flex h-9 w-9 shrink-0 cursor-pointer! items-center justify-center rounded-full text-sf-text transition-colors hover:bg-sf-bg-2"
            aria-label="关闭预览"
            @click="emit('close')"
          >
            <SfIcon icon="lucide:x" size="5" />
          </button>
        </div>
        <div class="mt-auto flex flex-col gap-3">
          <SfButton
            v-if="primaryActionText"
            type="theme"
            class="w-full"
            @click="emit('action')"
          >
            {{ primaryActionText }}
          </SfButton>
          <SfButton type="bg" class="w-full" @click="emit('close')">
            {{ secondaryActionText }}
          </SfButton>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped></style>
