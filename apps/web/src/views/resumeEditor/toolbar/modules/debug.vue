<template>
  <!-- 调试控制台按钮：是否显示由系统设置中的「调试控制台」开关控制 -->
  <Icon
    v-if="system.showDebug"
    icon="mdi:console-line"
    size="5"
    content="调试控制台"
    @click="drawerVisible = !drawerVisible"
  />

  <!-- 抽屉：关闭时销毁内容，避免内容常驻导致关闭后仍持续序列化整份数据 -->
  <el-drawer v-model="drawerVisible" title="控制台" direction="rtl" size="50%" destroy-on-close>
    <div v-if="drawerVisible" class="flex flex-col gap-3 p-3">
      <SfTab :list="tabList" v-model="activeTab">
        <SfTabPane value="data">
          <SfCollapse v-model="activeNames">
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
        </SfTabPane>
        <SfTabPane value="config">
          <SfCollapse>
            <SfCollapseItem name="currentFixedConfig">
              <template #title>原始配置 (currentFixedConfig)</template>
              <div class="max-h-[50vh] overflow-y-auto">
                <MdPreview
                  :modelValue="fixedConfigMd"
                  editorId="debug-config"
                  :codeFoldable="false"
                  class="bg-transparent! p-0!"
                />
              </div>
            </SfCollapseItem>
            <SfCollapseItem name="currentConfig">
              <template #title>当前配置 (currentConfig)</template>
              <div class="max-h-[50vh] overflow-y-auto">
                <MdPreview
                  :modelValue="configMd"
                  editorId="debug-config"
                  :codeFoldable="false"
                  class="bg-transparent! p-0!"
                />
              </div>
            </SfCollapseItem>
          </SfCollapse>
        </SfTabPane>
      </SfTab>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, inject, computed, defineAsyncComponent } from "vue";
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import Icon from "../components/icon.vue";

// 延迟加载 markdown 预览：仅在打开调试抽屉时引入 md-editor-v3 及其样式，避免首屏主包过大
const MdPreview = defineAsyncComponent(() =>
  import("md-editor-v3/lib/preview.css").then(() =>
    import("md-editor-v3").then((m) => m.MdPreview),
  ),
);

const drawerVisible = ref(false);
const activeNames = ref(["preview", "raw"]);

// 顶部 Tab：数据 / 配置
const activeTab = ref("data");
const tabList = [
  { name: "数据", value: "data" },
  { name: "配置", value: "config" },
];

// 注入预览数据
const previewData = inject("previewData");

// 获取原始数据
const resumeStore = useResumeStore();
const { currentData, currentConfig, system, currentFixedConfig } = storeToRefs(resumeStore);

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

const fixedConfigMd = computed(() => {
  try {
    return wrapJson(JSON.stringify(currentFixedConfig.value, null, 2));
  } catch (e) {
    return wrapJson(String(e));
  }
});

const configMd = computed(() => {
  try {
    return wrapJson(JSON.stringify(currentConfig.value, null, 2));
  } catch (e) {
    return wrapJson(String(e));
  }
});
</script>
