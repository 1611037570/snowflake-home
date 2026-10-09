<script setup>
const props = defineProps({
  // 当前页码，从 1 开始
  page: { type: Number, required: true },
  // 总页数，由列表条数与每页数量算出
  pageCount: { type: Number, required: true },
});

const emit = defineEmits(["change"]);
const goPrevPage = () => {
  if (props.page > 1) emit("change", props.page - 1);
};
const goNextPage = () => {
  if (props.page < props.pageCount) emit("change", props.page + 1);
};
</script>

<template>
  <!-- 只有一页时不展示翻页，避免出现上一页与下一页同时禁用的空控件 -->
  <div v-if="pageCount > 1" class="mt-3 flex flex-wrap items-center justify-center gap-3">
    <SfButton :plain="true" :round="true" :disabled="page <= 1" @click="goPrevPage">
      {{ $t("resumeTemplatePrevPage") }}
    </SfButton>
    <span class="text-sm text-sf-text-2">
      {{ $t("resumeTemplatePageInfo", { current: page, total: pageCount }) }}
    </span>
    <SfButton :plain="true" :round="true" :disabled="page >= pageCount" @click="goNextPage">
      {{ $t("resumeTemplateNextPage") }}
    </SfButton>
  </div>
</template>
