<script setup>
import TitleText from "../titleText.vue";

defineProps({ title: { type: String, default: "" } }); // 当前模块标题
</script>

<template>
  <!-- 标题后接蓝色细线，末端用实心方块收尾。 -->
  <div class="flex min-w-0 items-center gap-6 pb-3 text-[#078BCB]">
    <h2 class="shrink-0 text-[18px] font-semibold"><TitleText :title="title" /></h2>
    <span aria-hidden="true" class="h-px min-w-0 flex-1 bg-current" />
    <span aria-hidden="true" class="-ml-6 h-3 w-3 shrink-0 bg-current" />
  </div>
</template>
