<script setup>
// 显式命名模板组件，供父级 KeepAlive 按 include 命中缓存
defineOptions({ name: "BuilderTemplate" });
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import ThumbPreview from "../../preview/thumbPreview.vue";
import { themeTemplateList } from "@/stores/modules/resume/config/uiConfig";
import { loadResumeTemplateData } from "@/views/resume/template/data/resumeData";
import { onMounted, ref } from "vue";
import i18n from "@/locales";
import { translateResumeEditorText } from "@/stores/modules/resume/hooks/useResumeEditorLocale";
const resumeStore = useResumeStore();
const { currentUI } = storeToRefs(resumeStore);
const previewBase = ref(null);

// 进入样式选择时再加载一份范本作为预览内容。
onMounted(async () => {
  try {
    previewBase.value = await loadResumeTemplateData("xiaoZhou.ts");
  } catch {
    ElMessage.error("简历预览暂时无法加载");
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
      ui: t.item.ui,
    },
  }));
});

// 是否为当前选中的风格模板
const isActive = (id) => (currentUI.value?.themeTemplate ?? "default") === id;

// 应用风格：修改当前简历主题，预览层响应式渲染
const applyTemplate = (template) => {
  // 切换模板时清除手动布局，避免旧栏位配置覆盖新模板
  currentUI.value.pageLayout = null;
  Object.assign(currentUI.value, structuredClone(template.item.ui));
};
</script>

<template>
  <SfScrollbar class="h-full">
    <div class="grid w-full grid-cols-2 gap-3">
      <div
        v-for="template in templates"
        :key="template.id"
        class="group cursor-pointer!"
        @click="applyTemplate(template)"
      >
        <!-- 模板简历缩略图：缩略区在卡片内 padding 中，宽高比与 A4 一致，随列宽自适应，页面完整显示填满 -->
        <div
          class="relative mx-auto h-[213px] w-[156px] overflow-hidden rounded-3xl border-3 border-sf-transparent bg-sf-bg"
          :class="{ ' border-sf-theme!': isActive(template.id) }"
        >
          <ThumbPreview
            :item="template.item"
            @select="applyTemplate(template)"
          />
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
