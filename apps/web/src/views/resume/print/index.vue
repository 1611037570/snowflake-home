<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { useResumeStore } from "@/stores";
import ResumePages from "@/views/resume/editor/preview/resumePages/index.vue";

const payload = window.__SNOWFLAKE_RESUME_PRINT_DATA__ || {};
const route = useRoute();
const isBrowserPrint = route.query.browserPrint === "1";
const printToken = String(route.query.token || "");
const resumeStore = useResumeStore();
const { system } = storeToRefs(resumeStore);
const item = ref(payload.item || null);
const isReady = ref(false);

const BROWSER_PRINT_READY = "snowflake-resume-browser-print-ready";
const BROWSER_PRINT_DATA = "snowflake-resume-browser-print-data";
const BROWSER_PRINT_DONE = "snowflake-resume-browser-print-done";

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

// 接收浏览器打印窗口的数据，复用当前打印页的真实 DOM 排版。
const handleBrowserPrintMessage = async (event) => {
  if (
    !isBrowserPrint ||
    event.origin !== window.location.origin ||
    event.source !== window.opener ||
    event.data?.token !== printToken ||
    event.data.type !== BROWSER_PRINT_DATA
  ) {
    return;
  }

  const nextPayload = event.data.payload || {};
  item.value = nextPayload.item || null;
  if (nextPayload.system && typeof nextPayload.system === "object") {
    system.value = nextPayload.system;
  }
  isReady.value = false;
  await waitForRender();
  if (!item.value || !isReady.value) return;

  window.onafterprint = () => {
    window.opener?.postMessage(
      { type: BROWSER_PRINT_DONE, token: printToken },
      window.location.origin,
    );
    window.close();
  };
  window.print();
};

onMounted(() => {
  if (isBrowserPrint) {
    window.addEventListener("message", handleBrowserPrintMessage);
    window.opener?.postMessage(
      { type: BROWSER_PRINT_READY, token: printToken },
      window.location.origin,
    );
  } else if (item.value) {
    waitForRender();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("message", handleBrowserPrintMessage);
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
