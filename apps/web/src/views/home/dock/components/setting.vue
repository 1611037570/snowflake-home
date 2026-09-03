<template>
  <div
    class="flex h-10 w-10 items-center justify-center rounded-lg bg-sf-primary text-[10px] backdrop-blur-md transition-all duration-200"
    @click="openSet"
  >
    <SfIcon icon="iconamoon:settings-fill" class="rotate-180 text-sf-text" size="7" />
  </div>
</template>

<script setup>
import { useHomeStore } from "@/stores";
import { storeToRefs } from "pinia";
const homeStore = useHomeStore();
const { systemVisible } = storeToRefs(homeStore);
const openSet = () => {
  systemVisible.value = true;
};
</script>

<style lang="scss" scoped></style>
