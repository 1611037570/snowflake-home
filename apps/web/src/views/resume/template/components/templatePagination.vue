<script setup>
const props = defineProps({
  // 当前页码，从 1 开始
  page: { type: Number, required: true },
  // 总页数，由列表条数与每页数量算出
  pageCount: { type: Number, required: true },
  // 当前筛选命中的条数，与页码一起展示总量信息
  total: { type: Number, required: true },
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
  <!-- 无结果时整行不展示；只有一页时保留条数，隐藏上下页按钮避免出现两端禁用的空控件 -->
  <div v-if="total > 0" class="mt-3 flex flex-wrap items-center justify-center gap-3">
    <SfButton
      v-if="pageCount > 1"
      :plain="true"
      :round="true"
      :disabled="page <= 1"
      @click="goPrevPage"
    >
      {{ $t("resumeTemplatePrevPage") }}
    </SfButton>
    <span class="text-sm text-sf-text-2">
      {{ $t("resumeTemplateTotalCount", { count: total }) }}
      <template v-if="pageCount > 1">
        · {{ $t("resumeTemplatePageInfo", { current: page, total: pageCount }) }}
      </template>
    </span>
    <SfButton
      v-if="pageCount > 1"
      :plain="true"
      :round="true"
      :disabled="page >= pageCount"
      @click="goNextPage"
    >
      {{ $t("resumeTemplateNextPage") }}
    </SfButton>
  </div>
</template>
