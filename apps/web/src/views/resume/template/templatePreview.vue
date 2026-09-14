<script setup>
// 模板页专用预览：全屏展示简历，并在右侧保留模板文字信息
import { useResizeObserver } from "@vueuse/core";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import ResumePages from "@/views/resume/editor/preview/resumePages/index.vue";

defineOptions({ name: "TemplatePreview" });

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
  // 模板名称，用于右侧信息展示
  title: {
    type: String,
    default: "简历模板",
  },
});

const emit = defineEmits(["close", "use"]);

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
              <ResumePages :item="item" mode="preview" />
            </div>
          </div>
        </div>
      </section>

      <aside class="flex h-full w-1/3 min-w-0 flex-col border-l border-sf-b bg-sf-primary p-6">
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 flex-col gap-3">
            <span class="text-sm font-medium text-sf-text-2">简历模板</span>
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

        <div class="mt-9 flex flex-col gap-3 text-sm leading-7 text-sf-text-2">
          <p>查看模板的完整简历排版，确认样式后即可开始编辑。</p>
          <p>当前预览已按屏幕高度自适应，简历内容保持完整展示。</p>
        </div>

        <div class="mt-auto flex flex-col gap-3">
          <SfButton type="primary" class="w-full" @click="emit('use')">使用此模板</SfButton>
          <SfButton class="w-full" @click="emit('close')">返回模板列表</SfButton>
        </div>
      </aside>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped></style>
