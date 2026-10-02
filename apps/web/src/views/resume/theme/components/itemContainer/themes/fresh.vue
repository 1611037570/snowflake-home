<script setup>
import { computed } from "vue";
import { useItemBox } from "../useItemBox";
import { useResumePreviewContext } from "@/views/resume/editor/preview/shared/previewContext";

const props = defineProps({
  // 分片覆盖的块区间：续段不画上圆角、不补上内边距
  blockRange: {
    type: Object,
    default: () => ({ start: 0, end: Number.MAX_SAFE_INTEGER }),
  },
  // 分片覆盖的正文区间
  contentRange: {
    type: Object,
    default: undefined,
  },
  // 分片装饰类型
  decoration: {
    type: String,
    default: "full",
  },
  // 时间轴条目预留固定日期栏：清新风格不使用日期栏，保留入参以对齐外观签名
  timeline: {
    type: Boolean,
    default: false,
  },
});

const {
  theme: { themeColor, themeColorLine },
} = useResumePreviewContext();
// 大圆角浅底条目：圆角与四边内边距交给共享盒模型，分片收边由它统一裁剪
const { fragmentStyle, boxStyle, borderStyle } = useItemBox(props, {
  radius: "16px", // 大圆角条目外轮廓
  padding: "12px", // 浅色底板与内容之间的留白
  paddingLeft: "12px", // 非日期栏的左留白与其余三边一致
  backgroundColor: "transparent", // 底色改由内层表层绘制，便于做出柔和的浅底
  borderColor: themeColorLine.value, // 描边沿用主题派生线条色
});

// 内层浅色底板：贴住分片外壳，让底色与描边一起随分片收边
const surfaceStyle = computed(() => ({
  backgroundColor: `color-mix(in srgb, ${themeColor.value} 8%, transparent)`,
}));
// 主题色变量挂在外壳上，供条目名称的深层样式取用
const accentStyle = computed(() => ({ "--fresh-item-accent": themeColor.value }));
</script>

<template>
  <!-- 清新条目外观：大圆角浅色底板托起条目正文，留白与收边全部来自共享盒模型 -->
  <div
    class="resume-item fresh-item relative box-border"
    :style="[accentStyle, boxStyle, fragmentStyle]"
  >
    <div aria-hidden="true" class="fresh-item__surface" :style="surfaceStyle" />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 box-border border"
      :style="borderStyle"
    />
    <div class="fresh-item__content relative min-w-0">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 表层铺满分片外壳，圆角继承外壳，续段不画上圆角 */
.fresh-item__surface {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
}

/* 条目名称统一使用主题色，与标题胶囊呼应 */
.fresh-item__content :deep(> .flex:first-child > .min-w-0:first-child > .font-bold) {
  color: var(--fresh-item-accent);
  font-weight: 500;
}
</style>
