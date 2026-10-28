<script setup>
import { TransitionPresets, useDebounceFn, useResizeObserver, useTransition } from "@vueuse/core";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { storeToRefs } from "pinia";
import i18n, { $t } from "@/locales";
import eventBus from "@/utils/modules/eventBus";
import { useResumeStore } from "@/stores";
import { RESUME_HEIGHT, RESUME_WIDTH } from "../shared/constants";
import Language from "./toolbar/language.vue";
import TemplateSettings from "./toolbar/templateSettings.vue";
import Settings from "./toolbar/settings.vue";
import MoreSettings from "./toolbar/moreSettings.vue";
import FontFamily from "./toolbar/fontFamily.vue";
import FontSize from "./toolbar/fontSize.vue";
import FontColor from "./toolbar/fontColor.vue";
import Spacing from "./toolbar/spacing.vue";
import SettingPill from "./toolbar/settingPill.vue";
import OnePage from "./toolbar/onePage.vue";
import PrintMode from "./toolbar/printMode.vue";

defineOptions({ name: "ScaleContainer" });

defineProps({
  /** 是否显示缩放操作栏 */
  showToolbar: { type: Boolean, default: true },
});

defineEmits(["fullscreen"]);

const containerRef = ref(null);
const resumeStore = useResumeStore();
const { system, selectedModule } = storeToRefs(resumeStore);
// 清空选中模块：直接调用 store 操作
const { clearSelectedModules } = resumeStore;
const contentRef = ref(null);
const contentSize = ref({ width: 0, height: 0 });
const availableSize = ref({ width: 0, height: 0 });
const showBackTop = ref(false);
const scaleDropdownVisible = ref(false); // 缩放下拉展开时保持入口高亮
const manualScale = ref(1);
const maxScale = ref(1);
const scaleMode = ref("onePage");

const PADDING = 20;
const BACK_TOP_THRESHOLD = 200;
const MIN_SCALE = 0.5;
const percent = (value) => `${Math.round(value * 100)}%`;
const SCALE_LIST = computed(() => {
  i18n.global.locale.value;
  return [
    // 一页模式默认展示，并同时根据当前可用宽高计算页面缩放比例
    {
      value: "onePage",
      name: $t("adaptiveOnePage"),
      active: scaleMode.value === "onePage",
    },
    // 自适应选项
    {
      value: "auto",
      name: $t("adaptiveMax"),
      active: scaleMode.value === "auto",
    },
    // 标准 A4 使用页面原始尺寸，不随容器宽高自动缩小。
    {
      value: "a4", // 标准 A4 缩放模式标识。
      name: $t("standardA4"), // 下拉选项显示名称。
      active: scaleMode.value === "a4", // 当前模式选中状态。
    },
    { divider: true },
    ...[0.5, 0.6, 0.7, 0.8, 0.9, 1].map((value) => {
      const name = percent(value);
      const isSelected = scaleMode.value === "manual" && manualScaleText.value === name;
      return {
        value,
        name,
        // 超出最大缩放比例的项禁用
        disabled: value > maxScale.value,
        // 选中项高亮并显示勾选
        active: isSelected,
      };
    }),
  ];
});

const onePageScale = computed(() => {
  const { width, height } = availableSize.value;
  if (width <= PADDING || height <= PADDING) return 0.1;
  return Math.min((width - PADDING) / RESUME_WIDTH, (height - PADDING) / RESUME_HEIGHT);
});

const scale = computed(() => {
  // 页面原始尺寸为 A4 对应的七百九十四乘一千一百二十三像素。
  if (scaleMode.value === "a4") return 1;
  if (scaleMode.value === "auto") return maxScale.value;
  if (scaleMode.value === "onePage") return onePageScale.value;
  return manualScale.value;
});
const transitionScale = useTransition(scale, {
  duration: 200,
  transition: TransitionPresets.easeOutCubic,
});
const scaleLabel = computed(() =>
  scaleMode.value === "auto"
    ? $t("adaptive")
    : scaleMode.value === "onePage"
      ? $t("onePage")
      : scaleMode.value === "a4"
        ? $t("standardA4")
        : percent(transitionScale.value),
);
const minScale = computed(() => Math.min(MIN_SCALE, maxScale.value));
const manualScaleText = computed(() => percent(manualScale.value));

const clampScale = (value) => {
  return Math.min(Math.max(value, minScale.value), maxScale.value);
};

const setManualScale = (value) => {
  scaleMode.value = "manual";
  manualScale.value = clampScale(value);
};

const setAutoScale = () => {
  scaleMode.value = "auto";
};

const setOnePageScale = () => {
  scaleMode.value = "onePage";
};

// 标准 A4：使用页面原始尺寸展示，供样式疑问入口确认后切换
const setStandardA4 = () => {
  scaleMode.value = "a4";
};

// 滚动超过指定距离时显示回到顶部按钮
const handleScroll = () => {
  const wrap = containerRef.value?.wrapRef;
  showBackTop.value = Boolean(wrap && wrap.scrollTop > BACK_TOP_THRESHOLD);
};

// 平滑滚动到预览容器顶部
const handleBackTop = () => {
  containerRef.value?.wrapRef?.scrollTo({ top: 0, behavior: "smooth" });
};

const handleScaleSelect = (item) => {
  // 原尺寸显示不受自适应最大缩放比例限制。
  if (item.value === "a4") {
    scaleMode.value = "a4";
    return;
  }
  if (item.value === "auto") {
    setAutoScale();
    return;
  }
  if (item.value === "onePage") {
    setOnePageScale();
    return;
  }
  // 禁用项不响应选择
  if (item.value > maxScale.value) return;
  setManualScale(item.value);
};

const updateScale = useDebounceFn(([entry]) => {
  const { width, height } = entry.contentRect;
  availableSize.value = { width, height };

  // 容器过小或尺寸无效时，退化为最小缩放
  if (width <= PADDING || height <= PADDING) {
    maxScale.value = 0.1;
    return;
  }

  // 只根据宽度计算缩放比例，让内容在垂直方向可以滚动
  maxScale.value = (width - PADDING) / RESUME_WIDTH;
  manualScale.value = clampScale(manualScale.value);
}, 50);

useResizeObserver(() => containerRef.value?.wrapRef, updateScale);

// 纸张数量：从预览节点统计，避免依赖分页引擎的内部状态
const pageCount = ref(1);
const syncPageCount = () => {
  const count = contentRef.value?.querySelectorAll?.(".resume-page-item")?.length ?? 0;
  pageCount.value = Math.max(1, count);
};

// 测量未缩放内容的实际宽高，用于补偿 transform: scale() 不改变布局尺寸的问题
useResizeObserver(contentRef, ([entry]) => {
  contentSize.value = {
    width: entry.contentRect.width,
    height: entry.contentRect.height,
  };
  // 页面数量随内容高度变化一并更新
  syncPageCount();
});

// QA 弹窗里的样式疑问入口通过事件切换标准 A4，避免跨组件逐层传递
onMounted(() => {
  eventBus.on("resume-standard-a4", setStandardA4);
  // 首帧渲染完成后先统计一次纸张数量
  syncPageCount();
});
onUnmounted(() => eventBus.off("resume-standard-a4", setStandardA4));
</script>

<template>
  <div class="group relative flex h-full flex-col self-stretch overflow-hidden">
    <!-- 字体工具组独立放在最左侧，其余参数与视图操作继续按两行排列。 -->
    <div
      class="grid h-14 shrink-0 grid-cols-[auto_minmax(0,1fr)] grid-rows-2 border-b border-sf-b bg-sf-primary select-none"
      v-show="showToolbar"
    >
      <!-- 按参考图排列：字体名在上，字号与字体灰度在下。 -->
      <div class="row-span-2 flex w-42 shrink-0 flex-col border-r border-sf-b px-3">
        <div class="flex min-h-0 flex-1 items-center justify-center">
          <FontFamily />
        </div>
        <div class="flex min-h-0 flex-1 items-center justify-between">
          <FontSize />
          <FontColor />
        </div>
      </div>
      <!-- 上行：间距与缩放参数，宽度不足时向右滚动。 -->
      <div class="toolbar-row flex min-h-0 flex-1 items-center gap-3 overflow-x-auto px-3">
        <Spacing />
        <SfDropdown
          trigger="hover"
          placement="bottom-start"
          :show-arrow="false"
          @visible-change="scaleDropdownVisible = $event"
        >
          <SettingPill
            :label="$t('toolbarZoom')"
            :value="scaleLabel"
            :active="scaleDropdownVisible"
          />
          <template #dropdown>
            <SfList
              :list="SCALE_LIST"
              class="w-[140px]"
              :border="false"
              :auto-close="false"
              @onClick="handleScaleSelect"
            >
            </SfList>
          </template>
        </SfDropdown>
        <span class="text-[11px] whitespace-nowrap text-sf-text-3">{{
          $t("paperPageCount", { count: pageCount })
        }}</span>
      </div>
      <!-- 下行：设计面板入口与整份简历的操作，同样从左侧排起 -->
      <div class="toolbar-row flex min-h-0 flex-1 items-center gap-1 overflow-x-auto px-3">
        <TemplateSettings />
        <Settings />
        <MoreSettings />
        <Language />
        <span class="mx-1 h-4 w-px shrink-0 bg-sf-b"></span>
        <OnePage />
        <PrintMode />
        <!-- 全屏带文字标签，与相邻的整份简历操作保持同一种入口样式 -->
        <button
          type="button"
          class="flex h-6 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2 text-[11px] text-sf-text-2 transition-colors hover:bg-sf-bg"
          @click="$emit('fullscreen')"
        >
          <SfIcon icon="lucide:maximize" size="4" />
          <span class="whitespace-nowrap">{{ $t("fullscreen") }}</span>
        </button>
        <SfTooltip v-if="selectedModule.length" :content="$t('clearSelection')">
          <SfIcon
            icon="lucide:circle-slash"
            size="4"
            boxSize="6"
            class="cursor-pointer rounded-full text-sf-text-2 transition-colors hover:bg-sf-bg"
            @click="clearSelectedModules"
          />
        </SfTooltip>
      </div>
    </div>
    <!-- 预览滚动区外层：画布比面板低一档，纸张靠阴影浮起 -->
    <div class="preview-canvas relative min-h-0 flex-1 bg-sf-bg">
      <!-- 滚动区紧贴顶部工具栏，顶部留白放入滚动内容，避免固定空隙截断预览。 -->
      <SfScrollbar
        ref="containerRef"
        :data-resume-preview-scroll="showToolbar ? '' : undefined"
        class="relative min-h-0 flex-1"
        :style="{
          marginRight: 'var(--resume-toolbar-width, 0px)',
          width: 'calc(100% - var(--resume-toolbar-width, 0px))',
        }"
        view-class="relative min-h-full w-full"
        @scroll="handleScroll"
      >
        <!-- 顶部留白随内容滚动；标准 A4 超出容器宽度时靠左。 -->
        <div
          class="absolute top-3"
          :class="
            scaleMode === 'a4' && contentSize.width > availableSize.width
              ? 'left-0'
              : 'left-1/2 -translate-x-1/2'
          "
          :style="{
            width: `${contentSize.width * scale}px`,
            height: `${contentSize.height * scale}px`,
          }"
        >
          <div
            ref="contentRef"
            class="w-fit pb-3!"
            :class="{ grayscale: system.printMode }"
            :style="{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }"
          >
            <slot></slot>
          </div>
        </div>
      </SfScrollbar>
    </div>
    <SfTooltip
      v-if="showBackTop"
      :content="$t('backToTop')"
      class="absolute right-12 bottom-12 z-10"
    >
      <SfIcon
        @click="handleBackTop"
        icon="mingcute:up-line"
        size="8"
        boxSize="10"
        class="cursor-pointer rounded-full bg-sf-theme text-sf-theme-text"
      />
    </SfTooltip>
  </div>
</template>

<style scoped>
/* 两行入口共用同一套横向排布：宽度不足时横向滚动，不显示滚动条 */
.toolbar-row {
  scrollbar-width: none;
}
.toolbar-row::-webkit-scrollbar {
  display: none;
}
/* 入口一律不压缩，超宽交给行内横向滚动接手 */
.toolbar-row > * {
  flex-shrink: 0;
}

:global(.scale-dropdown-popper) {
  z-index: 9999 !important;
}

/* 纸张投影：与画布分层；导出与打印使用各自样式，不受这里影响 */
.preview-canvas {
  --preview-paper-shadow:
    0 1px 3px color-mix(in srgb, var(--sf-base) 8%, transparent),
    0 18px 48px color-mix(in srgb, var(--sf-base) 12%, transparent);
  --preview-grid-color: color-mix(in srgb, var(--sf-text-3) 38%, transparent);
  background-color: color-mix(
    in srgb,
    var(--sf-background) 55%,
    var(--sf-background-2) 45%
  );
  background-image: radial-gradient(
    circle,
    var(--preview-grid-color) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
}

:global(.dark) .preview-canvas {
  --preview-paper-shadow:
    0 1px 3px color-mix(in srgb, var(--sf-base) 5%, transparent),
    0 18px 48px color-mix(in srgb, var(--sf-base) 8%, transparent);
  --preview-grid-color: color-mix(in srgb, var(--sf-text-3) 46%, transparent);
}

/* 预览纸张保持真实纸张直角，通过描边和投影与画布分层。 */
.preview-canvas :deep(.resume-page-item) {
  box-shadow: var(--preview-paper-shadow);
}

</style>
