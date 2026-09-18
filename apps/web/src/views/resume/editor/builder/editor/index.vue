<script setup>
// 显式命名编辑组件，供父级 KeepAlive 按 include 命中缓存
defineOptions({ name: "BuilderEditor" });
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { RESUME_OPTIONS } from "@/stores/modules/resume/resumeOptions";
import { useRuntimeData } from "../../hooks/useRuntimeData";
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
import SubtitleBox from "./components/subtitleBox.vue";
import Tag from "./components/tag.vue";
import Video from "./components/video.vue";

const resumeStore = useResumeStore();
const { currentData, runtimeConfig } = storeToRefs(resumeStore);
const { markEditorStart, markEditorEnd } = useRuntimeData();
// 编辑区加载开始：组件初始化即记录，作为编辑区加载耗时起点
markEditorStart();

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
  subtitleBox: SubtitleBox,
  tag: Tag,
  video: Video,
  cityPicker: CityPicker,
};

// 配置同步：进入或切换简历时由本组件触发，完成前由外壳展示加载提示
const { currentItem } = storeToRefs(resumeStore);
// 待完成的同步目标简历：由表单渲染完成事件收口，切换简历时丢弃过期回调
let syncItem = null;
// 同步收口：表单渲染结束后调用，此时引擎的初始默认值写入已完成，才开启历史记录
const finishConfigSync = () => {
  if (!syncItem || currentItem.value !== syncItem) return;
  syncItem = null;
  resumeStore.enableHistory();
  resumeStore.setConfigSyncing(false);
  // 编辑区表单渲染完成：记录加载完成时间
  markEditorEnd();
};
watch(
  () => currentItem.value,
  (item) => {
    // 无选中简历：无需等待渲染，直接结束同步
    if (!item) {
      syncItem = null;
      resumeStore.disableHistory();
      resumeStore.setConfigSyncing(false);
      return;
    }
    resumeStore.setConfigSyncing(true);
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
