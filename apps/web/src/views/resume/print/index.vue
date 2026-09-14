<script setup>
import { nextTick, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useResumeStore } from "@/stores";
import ResumePages from "@/views/resume/editor/preview/resumePages/index.vue";

const payload = window.__SNOWFLAKE_RESUME_PRINT_DATA__ || {};
const resumeStore = useResumeStore();
const { system } = storeToRefs(resumeStore);
const item = payload.item || null;
const isReady = ref(false);

if (payload.system && typeof payload.system === "object") {
  system.value = payload.system;
}

const waitForImages = async () => {
  const images = Array.from(document.images);
  await Promise.all(
    images.map(async (image) => {
      if (image.complete) return;
      await new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    }),
  );
};

const waitForRender = async () => {
  const deadline = Date.now() + 60000;
  while (!document.querySelector(".resume-page-item") && Date.now() < deadline) {
    await nextTick();
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }

  await document.fonts?.ready;
  await waitForImages();
  await nextTick();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  if (document.querySelector(".resume-page-item")) {
    isReady.value = true;
  }
};

onMounted(() => {
  if (item) waitForRender();
});
</script>

<template>
  <main
    class="resume-print-page"
    data-pdf-render-root
    :data-pdf-ready="isReady ? 'true' : 'false'"
  >
    <ResumePages v-if="item" :item="item" mode="preview" />
    <div v-else data-pdf-error>缺少简历数据</div>
  </main>
</template>

<style>
@page {
  size: A4;
  margin: 0;
}

html,
body,
#app {
  width: 100%;
  min-width: 0;
  min-height: 100%;
  margin: 0;
  padding: 0;
  background: #fff;
}

#vue-inspector-container,
#__vue-devtools-container__ {
  display: none !important;
}

body {
  overflow: visible;
}

.resume-print-page {
  width: 794px;
  height: auto !important;
  min-height: 0 !important;
  background: #fff;
}

.resume-print-page .relative.flex.flex-col.gap-3 {
  gap: 0 !important;
}

.resume-print-page .resume-page-item {
  border-radius: 0 !important;
  box-shadow: none !important;
  break-after: page;
  page-break-after: always;
}

.resume-print-page .resume-page-item:last-child {
  break-after: auto;
  page-break-after: auto;
}
</style>
