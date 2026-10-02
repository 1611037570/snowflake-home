<script setup>
// 显式命名模板组件，供父级 KeepAlive 按 include 命中缓存
defineOptions({ name: "BuilderTemplate" });
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import ThumbPreview from "../../preview/modes/thumb.vue";
import { getResumeThemeTemplate, themeTemplateList } from "@/views/resume/theme";
import { loadResumeTemplateData } from "@/views/resume/template/data/resumeData";
import { onMounted, ref } from "vue";
import i18n, { $t } from "@/locales";
import { translateResumeEditorText } from "@/stores/modules/resume/hooks/useResumeEditorLocale";
import { resolveLayoutColumns } from "../../preview/resumePages/engine/layout/layoutTemplates";
const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);
const previewBase = ref(null);

// 进入样式选择时再加载一份范本作为预览内容。
onMounted(async () => {
  try {
    previewBase.value = await loadResumeTemplateData("xiaoZhou.ts");
  } catch {
    ElMessage.error($t("previewLoadFailed"));
  }
});

const templates = computed(() => {
  i18n.global.locale.value;
  return themeTemplateList.map((t) => ({
    name: translateResumeEditorText(t.name),
    id: t.id,
    item: {
      data: previewBase.value?.data || {},
      config: previewBase.value?.config || {},
      ui: getResumeThemeTemplate(t.id).item.ui,
    },
  }));
});

// 是否为当前选中的风格模板
const isActive = (id) => (currentUI.value?.theme?.template ?? "default") === id;

// 应用风格：修改当前简历主题，预览层响应式渲染
const applyTemplate = (template) => {
  const nextUi = structuredClone(template.item.ui);
  const moduleKeys = resumeStore.runtimeFields.map((field) => field.key).filter(Boolean);
  // 主题声明的派生展示模块与真实模块一起进入栏位解析。
  if (nextUi.layout.columns?.left?.includes("userFacts")) moduleKeys.push("userFacts");
  // 顶部通栏单栏与普通单栏一样，不保存双栏模块配置。
  nextUi.layout.columns =
    nextUi.layout.type === "twoColumn" || nextUi.layout.type === "topUserTwoColumn"
      ? resolveLayoutColumns(nextUi.layout.type, moduleKeys, nextUi.layout.columns)
      : null;
  Object.assign(currentUI.value, nextUi);
};
</script>

<template>
  <SfScrollbar class="h-full">
    <!-- 模板卡片按可用宽度自动换列，保持缩略图的固定尺寸。 -->
    <div class="grid w-full grid-cols-[repeat(auto-fit,minmax(156px,1fr))] gap-3">
      <div
        v-for="template in templates"
        :key="template.id"
        class="group cursor-pointer!"
        @click="applyTemplate(template)"
      >
        <!-- 模板缩略图外框与简历页面保持相同宽高比，完整显示页面内容。 -->
        <div
          class="relative mx-auto h-[218px] w-[156px] overflow-hidden rounded-3xl border-3 border-sf-transparent bg-sf-bg"
          :class="{ ' border-sf-theme!': isActive(template.id) }"
        >
          <ThumbPreview :item="template.item" @select="applyTemplate(template)" />
          <div class="absolute top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
            <SfIcon
              v-if="isActive(template.id)"
              icon="lucide:check"
              size="18"
              class="text-sf-theme"
            />
          </div>
        </div>
        <div class="flex items-center justify-center pt-1">
          <span class="text-sm font-bold text-sf-text">{{ template.name }}</span>
        </div>
      </div>
    </div>
  </SfScrollbar>
</template>

<style lang="scss" scoped></style>
