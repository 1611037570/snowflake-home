<script setup>
import TitleText from "../titleText.vue";

defineProps({
  title: { type: String, default: "" }, // 当前模块标题
});
</script>

<template>
  <!-- 深色底板让霓虹配色在白色纸张上仍可读，几何尺寸沿用霓虹终端标题。 -->
  <div
    class="min-w-0 border-l-[3px] border-[#EB39DC] bg-[#191C22] py-3 pl-3 text-[#F34BE4]"
    style="background-image: linear-gradient(90deg, rgba(235, 57, 220, 0.34), rgba(107, 248, 245, 0.12))"
  >
    <h2 class="flex min-w-0 items-center break-words">
      <span class="mr-3 text-[#6BF8F5]">//</span><TitleText :title="title" />
    </h2>
  </div>
</template>
