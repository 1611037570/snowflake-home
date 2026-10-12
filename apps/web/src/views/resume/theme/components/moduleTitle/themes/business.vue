<script setup>
defineProps({
  title: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <!-- 商务标题使用浅灰底条与深色标签。 -->
  <div class="flex bg-[#f2f2f2]">
    <h2
      class="max-w-full min-w-0 bg-[#333333] px-[18px] py-[6px] font-bold tracking-wide break-words text-white"
    >
      {{ title }}
    </h2>
  </div>
</template>

<style lang="scss" scoped></style>
