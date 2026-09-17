<script setup>
// 显式命名编辑组件，供父级 KeepAlive 按 include 命中缓存
defineOptions({ name: "BuilderEditor" });
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { RESUME_OPTIONS } from "@/stores/modules/resume/resumeOptions";
import Account from "./components/account.vue";
import AddModule from "./components/addModule.vue";
import BoxCollapse from "./components/boxCollapse.vue";
import CityPicker from "./components/cityPicker/index.vue";
import ArchivedModules from "./components/archivedModules.vue";
import HeightWeight from "./components/heightWeight.vue";
import Honor from "./components/honor.vue";
import Image from "./components/image.vue";
import FieldItem from "./components/fieldItem.vue";
import ItemCollapse from "./components/itemCollapse.vue";
import ImageUpload from "./components/imageUpload/index.vue";
import More from "./components/more.vue";
import UserCustomField from "./components/userCustomField.vue";
import Video from "./components/video.vue";

const resumeStore = useResumeStore();
const { currentData, runtimeConfig } = storeToRefs(resumeStore);

// 注入到动态表单的自定义组件库
const dynamicComponents = {
  boxCollapse: BoxCollapse,
  itemCollapse: ItemCollapse,
  fieldItem: FieldItem,
  account: Account,
  imageUpload: ImageUpload,
  honor: Honor,
  image: Image,
  heightWeight: HeightWeight,
  more: More,
  userCustomField: UserCustomField,
  video: Video,
  cityPicker: CityPicker,
};

// 配置同步：进入或切换简历时由本组件触发，完成前展示加载效果避免白屏
const { currentItem } = storeToRefs(resumeStore);
// 配置同步中：展示加载效果
const configSyncing = ref(true);
// 待完成的同步目标简历：由表单渲染完成事件收口，切换简历时丢弃过期回调
let syncItem = null;
// 同步收口：表单渲染结束后调用，此时引擎的初始默认值写入已完成，才开启历史记录
const finishConfigSync = () => {
  if (!syncItem || currentItem.value !== syncItem) return;
  syncItem = null;
  resumeStore.enableHistory();
  configSyncing.value = false;
};
watch(
  () => currentItem.value,
  (item) => {
    // 无选中简历：无需等待渲染，直接结束同步
    if (!item) {
      syncItem = null;
      resumeStore.disableHistory();
      configSyncing.value = false;
      return;
    }
    configSyncing.value = true;
    // 同步期间暂停历史记录，避免初始化与同步产生的自动变更写入历史
    resumeStore.disableHistory();
    // 同步完成交由表单渲染事件判定，避免固定时序下初始写入被记为历史
    syncItem = item;
  },
  { immediate: true },
);
// KeepAlive 缓存期间可能不触发渲染，重新激活时补齐收口
onActivated(finishConfigSync);

onBeforeUnmount(() => {
  // 失效待完成的同步，避免卸载后开启历史记录
  syncItem = null;
  resumeStore.disableHistory();
});
</script>

<template>
  <div class="relative h-full">
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
          v-if="runtimeConfig"
          v-model:form="runtimeConfig"
          v-model:data="currentData"
          :components="dynamicComponents"
          :options="RESUME_OPTIONS"
          @vue:mounted="finishConfigSync"
          @vue:updated="finishConfigSync"
        />
        <ArchivedModules />
        <AddModule />
      </div>
    </SfScrollbar>
  </div>
</template>

<style lang="scss" scoped></style>
