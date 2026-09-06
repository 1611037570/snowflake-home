<script setup>
// 显式命名编辑组件，供父级 KeepAlive 按 include 命中缓存
defineOptions({ name: "BuilderEditor" });
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import Account from "./components/account.vue";
import AddModule from "./components/addModule.vue";
import BoxCollapse from "./components/boxCollapse.vue";
import CityPicker from "./components/cityPicker/index.vue";
import HiddenModules from "./components/hiddenModules.vue";
import Honor from "./components/honor.vue";
import Image from "./components/image.vue";
import ItemCollapse from "./components/itemCollapse.vue";
import ImageUpload from "./components/imageUpload/index.vue";
import More from "./components/more.vue";
import Video from "./components/video.vue";

const resumeStore = useResumeStore();
const { currentData, currentConfig, currentFixedConfig } = storeToRefs(resumeStore);

// 注入到动态表单的自定义组件库
const dynamicComponents = {
  boxCollapse: BoxCollapse,
  itemCollapse: ItemCollapse,
  account: Account,
  imageUpload: ImageUpload,
  honor: Honor,
  image: Image,
  more: More,
  video: Video,
  cityPicker: CityPicker,
};

// 配置同步：进入或切换简历时由本组件触发，完成前展示加载效果避免白屏
const { currentItem } = storeToRefs(resumeStore);
// 配置同步中：展示加载效果
const configSyncing = ref(true);
// 配置同步定时器：离开组件时取消，避免卸载后继续同步或误开历史记录
let syncTimer;
// 组件挂载状态：卸载后不再执行开启历史记录
let mounted = true;
watch(
  () => currentItem.value,
  (item) => {
    if (!item) return;
    configSyncing.value = true;
    // 同步期间暂停历史记录，避免初始化与同步产生的自动变更写入历史
    resumeStore.disableHistory();
    // 延后到加载效果渲染后再同步，避免同步期间内容区白屏
    const targetItem = item;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      if (currentItem.value !== targetItem) return;
      resumeStore.syncConfigByData();

      // 表单完成渲染后开启历史记录开关
      nextTick(() => {
        nextTick(() => {
          if (!mounted || currentItem.value !== targetItem) return;
          resumeStore.enableHistory();
          configSyncing.value = false;
        });
      });
    }, 0);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  mounted = false;
  clearTimeout(syncTimer);
  resumeStore.disableHistory();
});
</script>

<template>
  <SfScrollbar class="relative h-full">
    <!-- 配置同步完成前展示加载效果，避免内容区白屏 -->
    <div
      v-if="configSyncing"
      class="absolute top-1/2 left-1/2 z-20 flex w-full flex-1 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-3"
    >
      <SfIcon icon="line-md:loading-twotone-loop" size="6" />
      <span class="text-sm text-sf-text-2">正在加载配置</span>
    </div>
    <div class="flex w-full flex-col">
      <SfDynamicForm
        v-model:form="currentFixedConfig"
        v-model:data="currentData"
        :components="dynamicComponents"
      />
      <SfDynamicForm
        v-model:form="currentConfig"
        v-model:data="currentData"
        :components="dynamicComponents"
      />
      <HiddenModules />
      <AddModule />
    </div>
  </SfScrollbar>
</template>

<style lang="scss" scoped></style>
