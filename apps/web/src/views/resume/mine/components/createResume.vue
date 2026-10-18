<script setup>
import { useInfiniteScroll } from "@vueuse/core";
import { useResumeStore } from "@/stores";
import { trackResumeAction } from "@/hooks";
import { $t } from "@/locales";
import { createResumeStyleUi, resumeStyleTemplateList } from "@/views/resume/theme";
import { loadResumeTemplateData } from "@/views/resume/template/data/resumeData";
import { expandConfigModules } from "@/stores/modules/resume/hooks/useConfigTemplate";
import ThumbPreview from "@/views/resume/editor/preview/modes/thumb.vue";
import ResumePreviewSkeleton from "@/views/resume/components/resumePreviewSkeleton.vue";
import ResumeCardContainer from "./resumeCardContainer.vue";

const resumeStore = useResumeStore();

// 全部主题卡片共用同一份通用范本作内容，样式由各自主题预设提供。
const PREVIEW_BASE_FILE = "xiaoZhou.ts";
// 全屏预览复用模板页组件：异步加载，避免简历渲染链路进入草稿页首屏。
const TemplatePreview = markRaw(
  defineAsyncComponent(() => import("../../template/templatePreview.vue")),
);

const visible = ref(false);
// 通用范本正文只用于展示缩略图，标记非响应式避免整份简历被深层代理。
const baseItem = shallowRef(null);
const baseLoading = ref(false);

// 弹窗打开后再取范本正文：草稿列表本身不依赖这份数据。
const ensureBaseItem = async () => {
  if (baseItem.value) return;
  baseLoading.value = true;
  try {
    baseItem.value = markRaw(await loadResumeTemplateData(PREVIEW_BASE_FILE));
  } catch {
    ElMessage.error("模板暂时无法加载");
  } finally {
    baseLoading.value = false;
  }
};

const open = () => {
  if (resumeStore.resumeList.length >= resumeStore.maxCount) {
    ElMessage.warning(`简历数量已达上限（${resumeStore.maxCount}个），请先删除后再新建`);
    return;
  }
  visible.value = true;
  ensureBaseItem();
};

// 画廊卡片：名称与说明取自语言文案，内容统一沿用通用范本。
const cards = computed(() => {
  const base = baseItem.value;
  if (!base) return [];
  return resumeStyleTemplateList.map((style) => ({
    id: style.id, // 主题编号，用作列表 key
    name: $t(`resumeTemplateStyle_${style.localeId}_name`), // 模板显示名
    description: $t(`resumeTemplateStyle_${style.localeId}_description`), // 模板一句话说明
    ui: style.ui, // 套用时采用的界面配置
    item: { data: base.data, config: base.config, ui: style.ui }, // 缩略预览所需的简历项
  }));
});

// 首批卡片数量：触底再追加一批，避免整份主题清单一次性挂载缩略图。
const CARD_BATCH_SIZE = 20;
const scrollRef = ref(null);
const visibleCount = ref(CARD_BATCH_SIZE);
const shownCards = computed(() => cards.value.slice(0, visibleCount.value));
const hasMore = computed(() => visibleCount.value < cards.value.length);
// 距离底部三百像素时追加下一批卡片。
useInfiniteScroll(
  scrollRef,
  () => {
    visibleCount.value += CARD_BATCH_SIZE;
  },
  { distance: 300 },
);

// 深拷贝：套用模板时隔离示例数据，避免与缩略预览共享引用。
const deepClone = (value) => JSON.parse(JSON.stringify(value));

// 套用主题：内容取通用范本，界面配置按主题预设展开栏位。
const useStyle = (card) => {
  const base = baseItem.value;
  if (!base) return;
  const moduleKeys = expandConfigModules(base.config?.modules || [], base.data)
    .map((field) => field.key)
    .filter(Boolean);
  const item = {
    data: deepClone(base.data), // 与预览隔离的简历内容
    config: deepClone(base.config), // 与预览隔离的模块配置
    ui: createResumeStyleUi(card.ui, moduleKeys), // 当前主题的完整界面配置
  };
  // 新建成功后上报一次简历创建动作
  if (resumeStore.addResume(item)) {
    trackResumeAction({ eventType: "create", fileType: "none" });
  }
  visible.value = false;
};

// 空白简历：不套任何版式，直接新建并进入编辑器。
const createBlank = () => {
  // 新建成功后上报一次简历创建动作
  if (resumeStore.addResume()) trackResumeAction({ eventType: "create", fileType: "none" });
  visible.value = false;
};

// 大图预览：点卡片本体看细节，确认后再套用。
const previewCard = ref(null);
const isPreviewVisible = computed(() => !!previewCard.value);
const openPreview = (card) => {
  previewCard.value = card;
};
const closePreview = () => {
  previewCard.value = null;
};
const usePreview = () => {
  if (previewCard.value) useStyle(previewCard.value);
  closePreview();
};

// 关闭弹窗时复位预览，下次打开从推荐顺序重新开始。
watch(visible, (value) => {
  if (value) return;
  previewCard.value = null;
});
</script>

<template>
  <ResumeCardContainer @click="open">
    <div class="group flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden">
      <div class="flex h-15 w-15 items-center justify-center rounded-full bg-sf-theme-2">
        <SfIcon
          icon="ic:round-add"
          size="8"
          class="text-sf-theme transition-transform duration-300 group-hover:rotate-90"
        />
      </div>
      <span class="text-base font-black text-sf-text">新建简历</span>
      <span class="text-sm text-sf-text-2">挑一套版式，或从零开始</span>
    </div>
  </ResumeCardContainer>

  <SfModal v-model="visible" title="新建简历" width="min(90vw, 1440px)">
    <!-- 高度取弹窗上限减去标题与内边距，画廊滚动始终落在弹窗内 -->
    <div class="flex h-[calc(90vh-72px)] w-full flex-col gap-3">
      <!-- 顶部：说明模板只管版式，右侧给出模板总数 -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-sf-text-2">模板只决定版式，内容进编辑器再改</p>
        <span v-if="cards.length" class="text-xs text-sf-text-3">共 {{ cards.length }} 套版式</span>
      </div>

      <!-- 范本正文未就绪时按真实卡片尺寸占位，避免弹窗里整片空白 -->
      <div
        v-if="baseLoading"
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        <div
          v-for="index in 10"
          :key="index"
          class="flex flex-col overflow-hidden rounded-2xl border border-sf-b bg-sf-primary"
        >
          <div class="relative aspect-[794/1123] w-full overflow-hidden">
            <ResumePreviewSkeleton />
          </div>
          <div class="flex flex-col gap-3 border-t border-sf-b px-3 py-3">
            <div class="h-3 w-1/2 animate-pulse rounded bg-sf-bg" />
            <div class="h-3 w-5/6 animate-pulse rounded bg-sf-bg" />
          </div>
        </div>
      </div>

      <!-- 范本加载失败时给出可重试的提示 -->
      <div
        v-else-if="!baseItem"
        class="flex h-60 flex-col items-center justify-center gap-3 text-sf-text-2"
      >
        <SfIcon icon="lucide:circle-alert" size="8" class="text-sf-text-3" />
        <span class="text-sm">模板暂时无法加载</span>
        <SfButton plain @click="ensureBaseItem">重试</SfButton>
      </div>

      <!-- 模板画廊：空白卡常驻首位，其余按主题清单的推荐顺序平铺 -->
      <div v-else ref="scrollRef" class="min-h-0 flex-1 overflow-y-auto pr-1">
        <div class="grid grid-cols-2 gap-3 pb-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <!-- 从零开始：整卡按 A4 比例，信息层浮在卡片底部，与模板页同构 -->
          <div
            class="flex aspect-[794/1123] w-full cursor-pointer flex-col overflow-hidden rounded-[4px] border-2 border-dashed border-sf-b bg-sf-primary transition-colors hover:border-sf-theme"
            @click="createBlank"
          >
            <div
              class="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 text-sf-text-2"
            >
              <span class="flex h-15 w-15 items-center justify-center rounded-full bg-sf-theme-2 text-sf-theme">
                <SfIcon icon="ph:file-plus-duotone" size="7" />
              </span>
              <span class="text-base font-black">从零开始</span>
            </div>
            <div class="relative border-t border-sf-b bg-sf-primary p-1">
              <div class="truncate text-center text-base font-black text-sf-text">空白简历</div>
            </div>
          </div>

          <!-- 主题卡片：缩略图铺满整卡，名称浮在卡片底部 -->
          <div
            v-for="card in shownCards"
            :key="card.id"
            class="group relative flex aspect-[794/1123] w-full cursor-pointer flex-col overflow-hidden rounded-[4px] border border-sf-b bg-sf-primary transition-colors hover:border-sf-theme"
            :title="card.description"
            @click="openPreview(card)"
          >
            <!-- 缩略图铺满整卡，信息层浮在它的下半部分之上 -->
            <div class="absolute inset-0">
              <ThumbPreview :item="card.item" />
            </div>
            <!-- 信息层之外的剩余空间：悬浮遮罩与按钮在这里垂直居中 -->
            <div class="relative min-h-0 flex-1">
              <div
                class="invisible absolute inset-0 flex items-center justify-center gap-3 bg-sf-transparent-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100"
              >
                <SfButton @click.stop="openPreview(card)">预览</SfButton>
                <SfButton @click.stop="useStyle(card)">使用此模板</SfButton>
              </div>
            </div>
            <!-- 信息层浮在卡片底部：纯色背景、高度随内容，名称居中 -->
            <div class="relative border-t border-sf-b bg-sf-primary p-1">
              <div class="truncate text-center text-base font-black text-sf-text">{{ card.name }}</div>
            </div>
          </div>
        </div>

        <!-- 全部卡片已展开时给出结束提示 -->
        <div
          v-if="cards.length && !hasMore"
          class="flex items-center justify-center gap-3 pb-3 text-xs text-sf-text-3"
        >
          <span class="h-px w-12 bg-sf-border" />
          <span>{{ $t("resumeTemplateNoMore") }}</span>
          <span class="h-px w-12 bg-sf-border" />
        </div>
      </div>
    </div>

    <!-- 全屏预览叠在弹窗之上，确认后直接套用 -->
    <TemplatePreview
      :visible="isPreviewVisible"
      :item="previewCard?.item || {}"
      single-page
      level="z-90"
      eyebrow-text="样式模板"
      :title="previewCard?.name || ''"
      :description="previewCard?.description || ''"
      primary-action-text="使用此模板"
      secondary-action-text="返回模板列表"
      @close="closePreview"
      @action="usePreview"
    />
  </SfModal>
</template>
