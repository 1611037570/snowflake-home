<script setup>
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";

const Chat = defineAsyncComponent(() => import("./chat/index.vue"));

const resumeStore = useResumeStore();
const { assistantWidth } = storeToRefs(resumeStore);
</script>

<template>
  <SfResizable
    v-model:size="assistantWidth"
    :min="400"
    :max="500"
    position="left"
    class="box-border h-full py-3"
  >
    <div
      class="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-sf-b bg-sf-primary py-3"
    >
      <Chat />
    </div>
  </SfResizable>
</template>

<style lang="scss" scoped></style>
