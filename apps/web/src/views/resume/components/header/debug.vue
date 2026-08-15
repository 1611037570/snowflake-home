<template>
  <!-- 悬浮按钮 -->
  <div
    v-if="debugMode"
    class="flex-c h-10 w-16 cursor-pointer rounded-xl bg-sf-theme text-sf-theme-text"
    type="primary"
    circle
    @click="drawerVisible = !drawerVisible"
  >
    控制台
  </div>

  <!-- 抽屉 -->
  <el-drawer v-model="drawerVisible" title="控制台" direction="rtl" size="50%">
    <SfCollapse v-model="activeNames" v-if="drawerVisible">
      <SfCollapseItem name="preview">
        <template #title>预览数据 (previewData)</template>
        <div class="max-h-[50vh] overflow-y-auto">
          <MdPreview
            :modelValue="previewMd"
            editorId="debug-preview"
            :codeFoldable="false"
            class="bg-transparent! p-0!"
          />
        </div>
      </SfCollapseItem>
      <SfCollapseItem name="raw">
        <template #title>原始数据 (currentData)</template>
        <div class="max-h-[50vh] overflow-y-auto">
          <MdPreview
            :modelValue="rawMd"
            editorId="debug-raw"
            :codeFoldable="false"
            class="bg-transparent! p-0!"
          />
        </div>
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
import { useSystemStore } from "@/stores/modules/system";

const systemStore = useSystemStore();
const { debugMode } = storeToRefs(systemStore);

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
