<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
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
const previewRef = ref(null); // 当前打印实例公开的测量与分页状态
const renderError = ref(""); // 无效计划与超时的打印说明
let cancelRenderWait = () => {}; // 结束旧打印等待并释放定时器
let renderVersion = 0; // 隔离重复载荷与已卸载的等待任务

const BROWSER_PRINT_READY = "snowflake-resume-browser-print-ready";
const BROWSER_PRINT_DATA = "snowflake-resume-browser-print-data";
const BROWSER_PRINT_DONE = "snowflake-resume-browser-print-done";

if (payload.system && typeof payload.system === "object") {
  system.value = payload.system;
}

// 与编辑器导出共用最新测量及有效分页状态，不用元素存在代替排版完成。
const waitForRender = async () => {
  cancelRenderWait();
  const version = ++renderVersion;
  isReady.value = false;
  renderError.value = "";
  await nextTick();
  if (version !== renderVersion) return;
  await new Promise((resolve) => {
    let stop = () => {};
    const assetsAbort = new AbortController(); // 释放图片等待的事件监听
    let assetsReady = false; // 字体与图片加载完成后才检查最新测量
    let finished = false; // 等待结束后不再由旧回调开放打印
    const finish = () => { finished = true; assetsAbort.abort(); stop(); window.clearTimeout(timer); resolve(); };
    cancelRenderWait = finish;
    const check = () => {
      if (version !== renderVersion) { finish(); return; }
      const preview = previewRef.value;
      const plan = preview?.pagePlan;
      if ((!assetsReady || !preview?.previewMeasured) && plan?.status !== "invalid") return;
      if (plan?.status !== "ready") {
        renderError.value = plan?.status === "overflow" ? "简历内容超出页面可用区域" : "简历页面布局配置有误";
        finish();
        return;
      }
      // 等待本轮页面 DOM 提交后再开放打印。
      void nextTick().then(() => {
        if (!finished && version === renderVersion && preview.previewMeasured && preview.pagePlan?.status === "ready") {
          isReady.value = true;
          finish();
        }
      });
    };
    const timer = window.setTimeout(() => {
      if (version === renderVersion) renderError.value = "简历排版等待超时";
      finish();
    }, 60000);
    stop = watch(() => [renderVersion, previewRef.value?.previewMeasured, previewRef.value?.pagePlan], check, { flush: "post" });
    check();
    // 超时与销毁也覆盖资源等待，资源加载引起的增高仍由公共测量处理。
    void (async () => {
      await document.fonts?.ready;
      if (finished) return;
      await Promise.all(Array.from(document.images).map((image) => {
        if (image.complete) return;
        return new Promise((resolveImage) => {
          const done = () => {
            image.removeEventListener("load", done);
            image.removeEventListener("error", done);
            assetsAbort.signal.removeEventListener("abort", done);
            resolveImage();
          };
          image.addEventListener("load", done, { once: true });
          image.addEventListener("error", done, { once: true });
          assetsAbort.signal.addEventListener("abort", done, { once: true });
          if (assetsAbort.signal.aborted) done();
        });
      }));
      await nextTick();
      if (finished) return;
      assetsReady = true;
      check();
    })().catch(() => {
      if (!finished) { renderError.value = "简历打印资源加载失败"; finish(); }
    });
  });
  return version === renderVersion && isReady.value;
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
  const ready = await waitForRender();
  if (!item.value || !ready) return;

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
  renderVersion += 1; // 使等待中的旧打印任务失效
  cancelRenderWait();
  window.removeEventListener("message", handleBrowserPrintMessage);
});
</script>

<template>
  <main
    class="resume-print-page"
    data-pdf-render-root
    :data-pdf-ready="isReady ? 'true' : 'false'"
  >
    <ResumePages
      v-if="item"
      ref="previewRef"
      :item="item"
      :show-page-number="system.showPageNumber"
      mode="preview"
    />
    <div v-else data-pdf-error>缺少简历数据</div>
    <div v-if="renderError" data-pdf-error>{{ renderError }}</div>
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
