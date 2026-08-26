<script setup>
defineOptions({ name: "ResumeToolbar" });
import Ai from "./ai/index.vue";
import System from "./system/index.vue";

const size = 6;
const boxSize = 8;
</script>

<template>
  <div class="flex items-center py-3 pr-3">
    <div
      class="flex flex-col items-center gap-2 rounded-3xl border border-sf-b bg-sf-primary p-2 text-sf-text-3"
    >
      <System />
      <Ai />
    </div>
  </div>
</template>

<style scoped></style>
