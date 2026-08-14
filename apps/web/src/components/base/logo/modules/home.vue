<script setup>
import snowIcon from "@/assets/images/snow.svg";

defineProps({
  size: {
    type: Number,
    default: 7.5,
  },
});
</script>

<template>
  <SfImg
    :src="snowIcon"
    class="transition-all duration-600 hover:rotate-90"
    fit="contain"
    :size="size"
  />
</template>

<style lang="scss" scoped></style>
