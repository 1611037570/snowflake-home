<script setup>
import { useRouter } from "vue-router";
import { useResumeStore } from "@/stores";
import { trackResumeAction } from "@/hooks";
import { $t } from "@/locales";
import { createResumeStyleUi, resumeStyleTemplateList } from "@/views/resume/theme";
import { loadResumeTemplateData } from "@/views/resume/template/data/resumeData";
import { expandConfigModules, initializeDefaultAddedFields } from "@/stores/modules/resume/hooks/useConfigTemplate";
import ThumbPreview from "@/views/resume/editor/preview/modes/thumb.vue";
import ResumePreviewSkeleton from "@/views/resume/components/resumePreviewSkeleton.vue";
import AiResumeGenerator from "@/views/resume/components/aiResumeGenerator.vue";
import ResumeCardContainer from "./resumeCardContainer.vue";

const resumeStore = useResumeStore();
const router = useRouter();

// 全部主题卡片共用同一份通用范本作内容，样式由各自主题预设提供。
const PREVIEW_BASE_FILE = "xiaoZhou.ts";

const visible = ref(false);
// 通用范本正文只用于展示缩略图，标记非响应式避免整份简历被深层代理。
const baseItem = shallowRef(null);
const baseLoading = ref(false);
const aiGenerator = ref(null);

// 弹窗打开后再取范本正文：草稿列表本身不依赖这份数据。
const ensureBaseItem = async () => {
  if (baseItem.value) return;
  baseLoading.value = true;
  try {
    baseItem.value = markRaw(await loadResumeTemplateData(PREVIEW_BASE_FILE));
  } catch {
    ElMessage.error($t("resumeCreateTemplateLoadFailed"));
  } finally {
    baseLoading.value = false;
  }
};

const open = () => {
  if (resumeStore.resumeList.length >= resumeStore.maxCount) {
    ElMessage.warning($t("resumeCreateMaxLimit", { max: resumeStore.maxCount }));
    return;
  }
  visible.value = true;
  ensureBaseItem();
};

// 推荐档之外的版式去模板库看，先关弹窗再跳转
const goAllTemplates = () => {
  visible.value = false;
  router.push("/resume/template");
};

// 画廊卡片：只放「推荐」档的主题，名称与说明取自语言文案，内容沿用通用范本。
// 推荐档固定顺序：与模板页推荐排序一致（template/index.vue 的 recommendedTemplateIds）。
const RECOMMENDED_ORDER = ["blueAngleHeader", "blueProfileBand", "default", "minimal"];
const cards = computed(() => {
  const base = baseItem.value;
  if (!base) return [];
  const rank = (id) => {
    const index = RECOMMENDED_ORDER.indexOf(id);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  return resumeStyleTemplateList
    .filter((style) => style.design.includes("recommended"))
    .map((style) => ({
      id: style.id, // 主题编号，用作列表 key
      name: $t(`resumeTemplateStyle_${style.localeId}_name`), // 模板显示名
      ui: style.ui, // 套用时采用的界面配置
      item: { data: base.data, config: base.config, ui: style.ui }, // 缩略预览所需的简历项
    }))
    .sort((left, right) => rank(left.id) - rank(right.id));
});

// 深拷贝：套用模板时隔离示例数据，避免与缩略预览共享引用。
const deepClone = (value) => JSON.parse(JSON.stringify(value));

// 创建分两步：先选版式，再写简历主人的姓名与求职岗位
const step = ref(1);
// 第二步预览与套用的版式：始终是一张真实模板卡
const styleCard = ref(null);
// 内容是否留空：随机选版式时只保留个人信息，其余模块交给编辑器
const blankContent = ref(false);
const formName = ref("");
const formPosition = ref("");

// 主动选中一套版式，内容取模板示例
const chooseCard = (card) => {
  styleCard.value = card;
  blankContent.value = false;
  step.value = 2;
};
// 随机挑一套推荐版式，内容从零开始
const chooseRandom = () => {
  const list = cards.value;
  if (!list.length) return;
  styleCard.value = list[Math.floor(Math.random() * list.length)];
  blankContent.value = true;
  step.value = 2;
};

// 套用主题：内容取通用范本，界面配置按主题预设展开栏位。
const buildFromCard = (card) => {
  const base = baseItem.value;
  const moduleKeys = expandConfigModules(base.config?.modules || [], base.data)
    .map((field) => field.key)
    .filter(Boolean);
  return {
    data: deepClone(base.data), // 与预览隔离的简历内容
    config: deepClone(base.config), // 与预览隔离的模块配置
    ui: createResumeStyleUi(card.ui, moduleKeys), // 当前主题的完整界面配置
  };
};

// 空白内容：与 addResume() 的空白初始化保持同一口径，版式取随机到的那套
const buildBlank = (card) => {
  const data = {};
  initializeDefaultAddedFields(data);
  if (!card) return { data };
  // 空白内容只有个人信息模块，栏位按这一份配置展开
  const moduleKeys = expandConfigModules([{ key: "user" }], data)
    .map((field) => field.key)
    .filter(Boolean);
  return { data, ui: createResumeStyleUi(card.ui, moduleKeys) };
};

// 第二步填写的姓名与岗位写进个人信息模块，留空则保持所选版式的原样
const applyUserInfo = (item) => {
  const name = formName.value.trim();
  const position = formPosition.value.trim();
  if (!name && !position) return;
  item.data = item.data || {};
  item.data.user = item.data.user || {};
  item.data.user.data = {
    ...(item.data.user.data || {}),
    ...(name ? { name } : {}),
    ...(position ? { position } : {}),
  };
};

// 第二步确认：按所选版式创建简历并进入编辑器
const confirmCreate = () => {
  const item = blankContent.value ? buildBlank(styleCard.value) : buildFromCard(styleCard.value);
  applyUserInfo(item);
  // 新建成功后上报一次简历创建动作
  if (resumeStore.addResume(item)) {
    trackResumeAction({ eventType: "create", fileType: "none" });
  }
  visible.value = false;
};

// AI 生成沿用当前所选版式，并把已填写的岗位与姓名带入三项输入。
const openAiGenerator = () => {
  const item = blankContent.value ? buildBlank(styleCard.value) : buildFromCard(styleCard.value);
  applyUserInfo(item);
  visible.value = false;
  nextTick(() => aiGenerator.value?.open(item, {
    position: formPosition.value.trim(), // 已填写的求职岗位。
    supplement: formName.value.trim() ? `姓名：${formName.value.trim()}` : "", // 已填写的真实姓名。
  }));
};

// 共享生成器返回最终简历后，沿用新建入口的创建与统计流程。
const handleAiGenerated = (item) => {
  if (resumeStore.addResume(item)) {
    trackResumeAction({ eventType: "create", fileType: "none" });
  }
};

// 关闭弹窗时复位步骤、表单与选择，下次打开从第一步开始。
watch(visible, (value) => {
  if (value) return;
  step.value = 1;
  styleCard.value = null;
  blankContent.value = false;
  formName.value = "";
  formPosition.value = "";
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
      <span class="text-base font-black text-sf-text">{{ $t("resumeCreateNewResume") }}</span>
      <span class="text-sm text-sf-text-2">{{ $t("resumeCreateSubtitle") }}</span>
    </div>
  </ResumeCardContainer>

  <SfModal v-model="visible" :title="$t('resumeCreateNewResume')" width="min(90vw, 1440px)">
    <!-- 高度取弹窗上限减去标题与内边距，画廊滚动始终落在弹窗内 -->
    <div class="flex h-[calc(90vh-72px)] w-full flex-col gap-3">
      <!-- 步骤指示：先选版式，再填简历主人的姓名与岗位 -->
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3 text-sm">
          <span :class="step === 1 ? 'font-bold text-sf-theme' : 'text-sf-text-3'">{{ $t("resumeCreateStep1") }}</span>
          <span class="h-px w-6 bg-sf-border" />
          <span :class="step === 2 ? 'font-bold text-sf-theme' : 'text-sf-text-3'">{{ $t("resumeCreateStep2") }}</span>
        </div>
        <div v-if="step === 1 && cards.length" class="flex items-center gap-3 text-xs text-sf-text-3">
          <span>{{ $t("resumeCreateRecommendedCount", { count: cards.length }) }}</span>
          <button
            type="button"
            class="cursor-pointer font-bold text-sf-theme hover:underline"
            @click="goAllTemplates"
          >
            {{ $t("resumeCreateViewAll") }}
          </button>
        </div>
      </div>

      <!-- 第一步：从版式里挑一个起点 -->
      <template v-if="step === 1">
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
          <span class="text-sm">{{ $t("resumeCreateTemplateLoadFailed") }}</span>
          <SfButton plain @click="ensureBaseItem">{{ $t("resumeCreateRetry") }}</SfButton>
        </div>

        <!-- 模板画廊：随机卡常驻首位，其余只放推荐档主题 -->
        <SfScrollbar v-else class="min-h-0 flex-1" flush>
          <div class="flex min-h-full shrink-0 flex-col">
            <div class="grid grid-cols-2 gap-3 pb-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              <!-- 随机选：点一下从推荐档里随机挑一套版式，内容从零开始 -->
              <div
                class="flex aspect-[794/1123] w-full cursor-pointer flex-col overflow-hidden rounded-[4px] border-2 border-dashed border-sf-b bg-sf-primary transition-colors hover:border-sf-theme"
                @click="chooseRandom"
              >
                <div class="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 text-sf-text-2">
                  <span class="flex h-15 w-15 items-center justify-center rounded-full bg-sf-theme-2 text-sf-theme">
                    <SfIcon icon="ph:dice-five-duotone" size="7" />
                  </span>
                  <span class="text-base font-black">{{ $t("resumeCreateRandomPick") }}</span>
                </div>
                <div class="relative border-t border-sf-b bg-sf-primary p-1">
                  <div class="truncate text-center text-base font-black text-sf-text">{{ $t("resumeCreateRandomCard") }}</div>
                </div>
              </div>

              <!-- 主题卡片：缩略图铺满整卡，点一下即选中并进入第二步 -->
              <div
                v-for="card in cards"
                :key="card.id"
                class="relative flex aspect-[794/1123] w-full cursor-pointer flex-col overflow-hidden rounded-[4px] border border-sf-b bg-sf-primary transition-colors hover:border-sf-theme"
                @click="chooseCard(card)"
              >
                <!-- 缩略图铺满整卡，信息层浮在它的下半部分之上 -->
                <div class="absolute inset-0">
                  <ThumbPreview :item="card.item" />
                </div>
                <div class="relative min-h-0 flex-1" />
                <!-- 信息层浮在卡片底部：纯色背景、高度随内容，名称居中 -->
                <div class="relative border-t border-sf-b bg-sf-primary p-1">
                  <div class="truncate text-center text-base font-black text-sf-text">
                    {{ card.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SfScrollbar>
      </template>

      <!-- 第二步：左边整页看版式，右边填姓名与求职岗位 -->
      <div v-else class="flex min-h-0 flex-1 flex-col gap-3 md:flex-row md:gap-0">
        <!-- 所选版式的整页预览：高度撑满，按 A4 比例等比缩放，不加外框 -->
        <div class="relative min-h-0 flex-1 overflow-hidden p-3 md:pr-6">
          <ThumbPreview v-if="styleCard" :item="styleCard.item" />
          <div v-else class="flex h-full w-full items-center justify-center text-sf-text-3">
            <SfIcon icon="ph:file-plus-duotone" size="12" />
          </div>
        </div>
        <div
          class="flex shrink-0 flex-col gap-3 md:w-[320px] md:border-l md:border-sf-b md:pl-6 lg:w-[360px]"
        >
          <div class="flex flex-col gap-1">
            <div class="text-base font-black text-sf-text">{{ $t("resumeCreateWriteYourself") }}</div>
            <div class="text-sm leading-7 text-sf-text-2">
              {{ $t("resumeCreateWriteYourselfTip") }}
            </div>
          </div>
          <label class="flex flex-col gap-1">
            <span class="text-sm text-sf-text-2">{{ $t("resumeCreateNameLabel") }}</span>
            <div class="flex h-10 items-center rounded-xl border border-sf-b px-3">
              <SfInput v-model="formName" :placeholder="$t('resumeCreateOptional')" class="h-10 flex-1 bg-transparent" />
            </div>
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-sm text-sf-text-2">{{ $t("resumeCreatePositionLabel") }}</span>
            <div class="flex h-10 items-center rounded-xl border border-sf-b px-3">
              <SfInput v-model="formPosition" :placeholder="$t('resumeCreateOptional')" class="h-10 flex-1 bg-transparent" />
            </div>
          </label>
          <div class="mt-auto flex flex-col gap-3">
            <SfButton size="large" icon="lucide:wand-sparkles" class="w-full" @click="openAiGenerator">
              {{ $t("resumeAiGenerateAction") }}
            </SfButton>
            <SfButton size="large" class="w-full" @click="confirmCreate">{{ $t("resumeCreateConfirmButton") }}</SfButton>
            <SfButton size="large" plain class="w-full" @click="step = 1">{{ $t("resumeCreateBackToStep1") }}</SfButton>
          </div>
        </div>
      </div>
    </div>
  </SfModal>
  <AiResumeGenerator ref="aiGenerator" @generated="handleAiGenerated" />
</template>
