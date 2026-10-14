<script setup>
import TitleText from "../titleText.vue";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
</script>

<template>
  <!-- 标题光带收在栏宽内，避免参考图中横向越界。 -->
  <div
    class="min-w-0 border-l-[3px] border-[#EB39DC] bg-[linear-gradient(90deg,rgba(235,57,220,0.19),rgba(235,57,220,0.05))] py-3 pl-3 text-[#F34BE4]"
  >
    <h2 class="flex min-w-0 items-center break-words">
      <span class="mr-3">//</span><TitleText :title="title" />
    </h2>
  </div>
</template>
