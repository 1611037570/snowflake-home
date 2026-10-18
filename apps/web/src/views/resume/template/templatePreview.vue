<script setup>
// 通用简历预览：全屏展示简历，并在右侧展示调用方提供的文字信息
import { useResizeObserver } from "@vueuse/core";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useOverlayKeys } from "@/hooks/modules/useOverlayKeys";
import { useResumeStore } from "@/stores";
import { useThemeStore } from "@/stores/modules/theme";
import { darkThemeColors, lightThemeColors } from "@/configs/modules/theme";
import { RESUME_HEIGHT, RESUME_WIDTH } from "@/views/resume/editor/preview/shared/constants";
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
    default: "",
  },
  // 模板描述
  description: {
    type: String,
    default: "",
  },
  // 模板标签
  tags: {
    type: Array,
    default: () => [],
  },
  // 右侧标题上方的场景文案
  eyebrowText: {
    type: String,
    default: "",
  },
  // 右侧主操作文案，为空时不显示主操作按钮
  primaryActionText: {
    type: String,
    default: "",
  },
  // 右侧次操作文案
  secondaryActionText: {
    type: String,
    default: "",
  },
  // 模板预览只展示第一页，草稿预览仍保留完整分页
  singlePage: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "action"]);
const { system } = storeToRefs(useResumeStore());
// 标签彩虹配色：与卡片信息层同一套规则，亮色取浅色主题色、暗色取饱和主题色，按顺序循环取用
const { isDark } = storeToRefs(useThemeStore());
const tagColorList = computed(() =>
  (isDark.value ? darkThemeColors : lightThemeColors).map((color) => color.value),
);
const getTagStyle = (index) => ({
  background: tagColorList.value[index % tagColorList.value.length],
});
// 浅色底配深色文字、饱和底配白字，两种模式下都保持可读
const tagTextClass = computed(() => (isDark.value ? "text-sf-theme-text" : "text-sf-text"));

const stageRef = ref(null);
const contentRef = ref(null);
const stageSize = ref({ width: 0, height: 0 });
const contentSize = ref({ width: 0, height: 0 });
const previousBodyOverflow = ref(null);

// 缩放基准固定为单页尺寸：让一页正好铺满舞台，多页内容超出后靠滚动查看
const scale = computed(() => {
  const { width: stageWidth, height: stageHeight } = stageSize.value;
  if (!stageWidth || !stageHeight) return 1;
  return Math.min(stageWidth / RESUME_WIDTH, stageHeight / RESUME_HEIGHT);
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

// ESC 关闭走弹层仲裁：弹窗或确认框盖在本层之上时，按键只作用于最上层。
useOverlayKeys({ escape: () => emit("close") }, () => props.visible);

// 全屏打开时锁定页面滚动，关闭后恢复原页面状态。
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      previousBodyOverflow.value = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return;
    }
    if (previousBodyOverflow.value !== null) {
      document.body.style.overflow = previousBodyOverflow.value;
      previousBodyOverflow.value = null;
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (previousBodyOverflow.value !== null) {
    document.body.style.overflow = previousBodyOverflow.value;
    previousBodyOverflow.value = null;
  }
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex h-dvh w-full flex-col overflow-hidden bg-sf-bg-2 md:flex-row"
    >
      <section
        class="flex min-h-0 w-full min-w-0 flex-1 items-center justify-center overflow-hidden py-3 md:h-full md:w-2/3"
      >
        <!-- 舞台外层只负责测量可视尺寸，滚动统一交给 SfScrollbar -->
        <div ref="stageRef" class="relative h-full w-full">
          <SfScrollbar class="absolute inset-0">
            <!-- 一页铺满可视区，其余页面向下滚动查看 -->
            <div class="flex min-h-full w-full items-start justify-center">
              <div class="relative shrink-0" :style="scaledContentStyle">
                <div
                  ref="contentRef"
                  class="absolute top-0 left-0 origin-top-left"
                  :style="{ transform: `scale(${scale})` }"
                >
                  <ResumePages
                    :item="item"
                    :show-page-number="system.showPageNumber"
                    :mode="singlePage ? 'single' : 'preview'"
                  />
                </div>
              </div>
            </div>
          </SfScrollbar>
        </div>
      </section>

      <!-- 信息栏贴在底部：高度随内容，超出时才内部滚动，不再固定占一半 -->
      <aside
        class="flex w-full min-w-0 flex-col overflow-y-auto border-t border-sf-b bg-sf-primary p-3 md:h-full md:w-1/3 md:border-t-0 md:border-l"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 flex-col gap-3">
            <span class="text-sm font-medium text-sf-text-2">{{ eyebrowText }}</span>
            <h1 class="truncate text-2xl font-black text-sf-text">{{ title }}</h1>
          </div>
          <button
            type="button"
            class="flex h-9 w-9 shrink-0 cursor-pointer! items-center justify-center rounded-full text-sf-text transition-colors hover:bg-sf-bg-2"
            :aria-label="$t('resumeTemplateClosePreview')"
            @click="emit('close')"
          >
            <SfIcon icon="lucide:x" size="5" />
          </button>
        </div>
        <div v-if="tags.length || description" class="mt-3 flex flex-col gap-3">
          <p v-if="description" class="text-sm leading-7 text-sf-text-2">
            {{ description }}
          </p>
          <!-- 标签与卡片信息层同款：小圆角、按顺序取用配置里的彩虹色 -->
          <div v-if="tags.length" class="flex flex-wrap gap-x-3 gap-y-1">
            <span
              v-for="(tag, index) in tags"
              :key="tag"
              class="rounded-md px-3 py-1 text-xs"
              :class="tagTextClass"
              :style="getTagStyle(index)"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        <div class="mt-3 flex flex-col gap-3">
          <SfButton v-if="primaryActionText" type="theme" class="w-full" @click="emit('action')">
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
