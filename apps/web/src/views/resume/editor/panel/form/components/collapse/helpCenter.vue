<script setup>
import { computed, ref } from "vue";
import { CUSTOM_MODULE_ICON, DEFAULT_MODULE_NAMES } from "@/stores/modules/resume/config/defaultConfig";

const props = defineProps({
  // 稳定模块标识，用于选择对应的写作说明与问答。
  moduleKey: { type: String, default: "" },
  // 当前展示标题，保持与用户重命名后的模块一致。
  moduleTitle: { type: String, default: "" },
});
// 弹窗状态与问答展开状态仅保存在当前组件内，不写入简历。
const visible = defineModel({ type: Boolean, default: false });
const expandedQuestions = ref([]);
// 标题图标与写作内容共用当前模块匹配结果，自定义模块使用通用指引。
const helpModule = computed(() =>
  DEFAULT_MODULE_NAMES.find((module) => module.key === props.moduleKey),
);
const helpKey = computed(() => helpModule.value?.key ?? "custom");
</script>

<template>
  <SfModal
    v-model="visible"
    :title="$t('moduleHelpCenter')"
    title-class="justify-start! px-3 pt-3 text-sm! font-normal! text-sf-text-2"
    width="600px"
  >
    <!-- 帮助内容使用统一滚动条，高度上限交由滚动容器控制。 -->
    <SfScrollbar
      max-height="66vh"
      class="h-auto! flex-none!"
      view-class="gap-6 px-3 pt-3 pb-3 text-sf-text"
      flush
    >
      <!-- 模块图标与常规字重标题组成引导区，说明使用独立浅底块承载。 -->
      <section class="flex flex-col gap-3">
        <header class="flex items-center gap-3">
          <span class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sf-bg text-sf-theme">
            <SfIcon :icon="helpModule?.icon ?? CUSTOM_MODULE_ICON" size="6" class="cursor-default!" />
          </span>
          <div class="flex min-w-0 flex-col gap-3">
            <p class="text-xs leading-none text-sf-text-3">{{ $t("resumeExampleGuideTitle") }}</p>
            <h2 class="text-lg leading-6 font-normal break-words">
              {{ $t("moduleHelpTitle", { name: moduleTitle }) }}
            </h2>
          </div>
        </header>
        <p class="rounded-3xl bg-sf-bg p-6 text-sm leading-6 text-sf-text-2">
          {{ $t(`moduleHelp_${helpKey}_description`) }}
        </p>
      </section>
      <section class="flex flex-col gap-3">
        <header class="flex items-center gap-3">
          <h3 class="shrink-0 text-sm font-normal">{{ $t("moduleHelpQuestions") }}</h3>
          <span class="h-px flex-1 bg-sf-b" aria-hidden="true" />
          <span class="text-xs tracking-widest text-sf-text-3" aria-hidden="true">Q&amp;A</span>
        </header>
        <!-- 问答以独立描边行呈现，展开后通过底色和箭头方向区分状态。 -->
        <SfCollapse v-model="expandedQuestions" :border="false" class="flex flex-col gap-3">
          <SfCollapseItem
            v-for="index in 2"
            :key="index"
            :name="index"
            class="help-question overflow-hidden rounded-2xl border border-sf-b transition-colors hover:bg-sf-bg"
            :class="{ 'bg-sf-bg': expandedQuestions.includes(index) }"
          >
            <template #title>
              <span class="flex items-center gap-3 text-left text-sm font-normal text-sf-text">
                <SfIcon icon="mingcute:question-line" size="4" class="shrink-0 text-sf-text-3" />
                <span class="break-words">{{ $t(`moduleHelp_${helpKey}_question${index}`) }}</span>
              </span>
            </template>
            <template #icon="{ isActive }">
              <SfIcon
                icon="mingcute:down-line"
                size="4"
                class="ml-3 shrink-0 text-sf-text-3 transition-transform"
                :class="{ 'rotate-180': isActive }"
              />
            </template>
            <p class="px-3 pb-3 text-sm leading-6 text-sf-text-2">
              {{ $t(`moduleHelp_${helpKey}_answer${index}`) }}
            </p>
          </SfCollapseItem>
        </SfCollapse>
      </section>
    </SfScrollbar>
  </SfModal>
</template>

<style scoped>
@reference "@/styles/tailwind.css";

/* 问题标题支持多行，覆盖通用折叠组件的固定行高与高度。 */
.help-question :deep(.el-collapse-item__header) {
  @apply h-auto! min-h-15! px-3 py-3 leading-6!;
}

/* 答案与标题使用一致的内边距，取消通用组件的额外底部留白。 */
.help-question :deep(.el-collapse-item__content) {
  padding-bottom: 0 !important;
}
</style>
