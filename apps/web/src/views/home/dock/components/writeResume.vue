<template>
  <div
    class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 text-[10px]"
    @click="openResume"
  >
    <SfLogo :size="7.5" name="resume" />
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
const router = useRouter();
const openResume = () => {
  router.push({ name: "resume" });
};
</script>

<style scoped></style>
