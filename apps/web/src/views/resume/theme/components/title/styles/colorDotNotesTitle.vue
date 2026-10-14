<script setup>
import TitleText from "../titleText.vue";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
</script>

<template>
  <!-- 栏位语义决定便签颜色，标题宽度始终贴合真实文字。 -->
  <div class="box-border min-w-0 pb-3">
    <h2 class="color-dot-notes-title inline-flex max-w-full min-w-0 items-center px-3 py-3 text-[20px] leading-none font-bold text-white">
      <TitleText :title="title" />
    </h2>
  </div>
</template>

<style>
.color-dot-notes-title {
  background-color: #78b8f7;
}
[data-resume-column="right"] .color-dot-notes-title {
  background-color: #75cf79;
}
</style>
