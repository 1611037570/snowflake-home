<script setup>
// 显式命名编辑组件，供父级 KeepAlive 按 include 命中缓存
defineOptions({ name: "BuilderEditor" });
import { useResumeStore } from "@/stores";
import SfSkeleton from "@/components/el/skeleton";
import { storeToRefs } from "pinia";
import { defineAsyncComponent } from "vue";
import { RESUME_OPTIONS } from "@/stores/modules/resume/resumeOptions";
import { useRuntimeData } from "../../hooks/useRuntimeData";
import AddModule from "./components/addModule.vue";
import ArchivedModules from "./components/archivedModules.vue";
import HeightWeight from "./components/heightWeight.vue";
import Image from "./components/image.vue";
import More from "./components/more.vue";
import Measurements from "./components/measurements.vue";
import ProjectLink from "./components/projectLink.vue";
import Sizes from "./components/sizes.vue";
import SubtitleBox from "./components/subtitleBox.vue";
import Tag from "./components/tag.vue";
import Video from "./components/video.vue";
import CollapseModule from "./components/collapseModule.vue";
import CollapseItem from "./components/collapseItem.vue";
import RowField from "./components/rowField.vue";
import RowAccount from "./components/rowAccount.vue";
import RowHonor from "./components/rowHonor.vue";

const loadDynamicForm = () => import("@/components/business/dynamicForm/index");
// 动态表单加载期间立即显示骨架，避免编辑区只剩增加模块
const AsyncDynamicForm = defineAsyncComponent({
  loader: loadDynamicForm,
  loadingComponent: SfSkeleton,
  delay: 0,
  suspensible: false,
});
const showDynamicForm = ref(false);
let dynamicFormTimer = null;

// 延后动态表单挂载，让编辑区外壳先完成首帧绘制
onMounted(() => {
  dynamicFormTimer = window.setTimeout(() => {
    // 提前下载动态表单代码，实际渲染仍等待配置数据就绪
    loadDynamicForm();
    showDynamicForm.value = true;
  }, 0);
});

// 图片裁剪与城市级联仅在对应字段出现时加载，避免占用编辑器首屏资源
const AsyncImageUpload = defineAsyncComponent({
  loader: () => import("./components/imageUpload/index.vue"),
  loadingComponent: SfSkeleton,
  delay: 0,
});
const AsyncCityPicker = defineAsyncComponent({
  loader: () => import("./components/cityPicker/index.vue"),
  loadingComponent: SfSkeleton,
  delay: 0,
});

const resumeStore = useResumeStore();
const { currentData, runtimeConfig } = storeToRefs(resumeStore);
const { markEditorStart, markEditorEnd } = useRuntimeData();
// 编辑区加载开始：组件初始化即记录，作为编辑区加载耗时起点
markEditorStart();

// 注入到动态表单的自定义组件库
// 编辑区组件按层级划分，配置里的 component 名对应关系如下：
// 折叠容器 collapseModule：模块标题 + 折叠/归档/隐藏/删除，内容由插槽渲染
// 折叠容器 collapseItem：数组模块中单条记录的标题 + 折叠/隐藏/删除，内容由插槽渲染
// 行控件 rowField / rowAccount / rowHonor：一行内的字段编辑与隐藏/删除操作
const dynamicComponents = {
  collapseModule: CollapseModule,
  collapseItem: CollapseItem,
  rowField: RowField,
  rowAccount: RowAccount,
  rowHonor: RowHonor,
  imageUpload: AsyncImageUpload,
  image: Image,
  heightWeight: HeightWeight,
  measurements: Measurements,
  projectLink: ProjectLink,
  sizes: Sizes,
  more: More,
  subtitleBox: SubtitleBox,
  tag: Tag,
  video: Video,
  cityPicker: AsyncCityPicker,
};

// 配置同步：进入或切换简历时由本组件触发，完成状态由表单渲染事件收口
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
  if (dynamicFormTimer !== null) window.clearTimeout(dynamicFormTimer);
  // 失效待完成的同步，避免卸载后开启历史记录
  syncItem = null;
  resumeStore.disableHistory();
});
</script>

<template>
  <div class="relative h-full">
    <SfScrollbar class="relative h-full">
      <div class="flex w-full flex-col">
        <SfSkeleton v-if="!showDynamicForm || !runtimeConfig" />
        <AsyncDynamicForm
          v-else
          v-model:form="runtimeConfig"
          v-model:data="currentData"
          :components="dynamicComponents"
          :options="RESUME_OPTIONS"
          @vue:mounted="finishConfigSync"
        />
        <ArchivedModules />
        <AddModule />
      </div>
    </SfScrollbar>
  </div>
</template>

<style lang="scss" scoped></style>
