<script setup>
import TitleText from "../titleText.vue";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
</script>

<template>
  <!-- 浅金圆点和细底线对应纸张两侧的藤线节点。 -->
  <div class="flex min-w-0 items-center gap-3 border-b border-[#E4E7DE] pb-3">
    <span aria-hidden="true" class="size-[9px] shrink-0 rounded-full bg-[#C7AA7E]" />
    <h2 class="min-w-0 font-serif text-[#3D544A] tracking-[0.12em] break-words"><TitleText :title="title" /></h2>
  </div>
</template>
