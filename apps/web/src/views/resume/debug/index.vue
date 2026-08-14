<template>
  <!-- 悬浮按钮 -->
  <el-button class="debug-float-btn" type="primary" circle @click="drawerVisible = !drawerVisible">
    12323
  </el-button>

  <!-- 抽屉 -->
  <el-drawer v-model="drawerVisible" title="调试数据" direction="rtl" size="50%">
    <SfCollapse v-model="activeNames" v-if="drawerVisible">
      <SfCollapseItem name="preview">
        <template #title>预览数据 (previewData)</template>
        <MdPreview
          :modelValue="previewMd"
          editorId="debug-preview"
          :codeFoldable="false"
          class="debug-md bg-transparent! p-0!"
        />
      </SfCollapseItem>
      <SfCollapseItem name="raw">
        <template #title>原始数据 (currentData)</template>
        <MdPreview
          :modelValue="rawMd"
          editorId="debug-raw"
          :codeFoldable="false"
          class="debug-md bg-transparent! p-0!"
        />
      </SfCollapseItem>
    </SfCollapse>
  </el-drawer>
</template>

<script setup>
import { ref, inject, computed } from "vue";
import { MdPreview } from "md-editor-v3";
import "md-editor-v3/lib/preview.css";
import { useResumeStore, useThemeStore } from "@/stores";
import { storeToRefs } from "pinia";

const drawerVisible = ref(false);
const activeNames = ref(["preview", "raw"]);

// 主题
const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);

// 注入预览数据
const previewData = inject("previewData");

// 获取原始数据
const resumeStore = useResumeStore();
const { currentData } = storeToRefs(resumeStore);

// 把 fieldProxy 转为可序列化的对象 { value, newValue }
const serializePreview = (obj) => {
  if (obj && typeof obj === "object" && obj.__isFieldProxy) {
    return {
      value: obj.value,
      newValue: obj.newValue,
    };
  }
  if (Array.isArray(obj)) {
    return obj.map(serializePreview);
  }
  if (obj && typeof obj === "object") {
    const result = {};
    for (const key of Object.keys(obj)) {
      result[key] = serializePreview(obj[key]);
    }
    return result;
  }
  return obj;
};

// 包装为 markdown json 代码块
const wrapJson = (str) => "```json\n" + str + "\n```";

const previewMd = computed(() => {
  try {
    return wrapJson(JSON.stringify(serializePreview(previewData?.value ?? {}), null, 2));
  } catch (e) {
    return wrapJson(String(e));
  }
});

const rawMd = computed(() => {
  try {
    return wrapJson(JSON.stringify(currentData.value ?? {}, null, 2));
  } catch (e) {
    return wrapJson(String(e));
  }
});
</script>

<style scoped>
.debug-float-btn {
  position: fixed;
  top: 18px;
  right: 18px;
  width: 48px;
  height: 48px;
  z-index: 9999;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.debug-md {
  max-height: 60vh;
  overflow: auto;
}
:deep(.debug-md .md-editor-preview pre) {
  margin: 0;
  border-radius: 4px;
}
:deep(.debug-md .md-editor-preview > pre:last-child) {
  margin-bottom: 0 !important;
}
</style>
