<script setup>
// 显式命名编辑组件，供父级 KeepAlive 按 include 命中缓存
defineOptions({ name: "BuilderEditor" });
import { useResumeStore } from "@/stores";
import SfSkeleton from "@/components/el/skeleton";
import FormLoading from "./components/formLoading.vue";
import { storeToRefs } from "pinia";
import { defineAsyncComponent, nextTick } from "vue";
import { RESUME_OPTIONS } from "@/stores/modules/resume/config/resumeOptions";
import { useRuntimeData } from "../../hooks/useRuntimeData";
import ModuleSidebar from "./moduleSidebar/index.vue";
import HeightWeight from "./components/field/heightWeight.vue";
import Portfolio from "./components/field/portfolio.vue";
import More from "./components/field/more.vue";
import Measurements from "./components/field/measurements.vue";
import PositionPicker from "./components/field/positionPicker.vue";
import SalaryRange from "./components/field/salaryRange.vue";
import ProjectLink from "./components/field/projectLink.vue";
import UrlInput from "./components/field/urlInput.vue";
import PublicationAuthors from "./components/field/publicationAuthors.vue";
import Sizes from "./components/field/sizes.vue";
import SubtitleBox from "./components/field/subtitleBox.vue";
import Tag from "./components/field/tag.vue";
import ResumeContentEditor from "./components/contentEditor/index.vue";
import CollapseModule from "./components/collapse/module.vue";
import CollapseItem from "./components/collapse/item.vue";
import CollapseGroup from "./components/collapse/group.vue";
import AvatarDropdown from "./components/collapse/avatarDropdown.vue";
import RowField from "./components/row/field.vue";
import RowAccount from "./components/row/account.vue";
import RowSkill from "./components/row/skill.vue";
import { localizeResumeOptions } from "@/stores/modules/resume/hooks/useResumeEditorLocale";
import i18n from "@/locales";
import { flushPendingEditorLocation } from "../../hooks/useModuleNav";

const loadDynamicForm = () => import("@/components/business/dynamicForm/index");
// 动态表单加载期间立即显示骨架，避免编辑区只剩增加模块
const AsyncDynamicForm = defineAsyncComponent({
  loader: loadDynamicForm,
  loadingComponent: FormLoading,
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
  loader: () => import("./components/field/imageUpload.vue"),
  loadingComponent: SfSkeleton,
  delay: 0,
});
const AsyncCityPicker = defineAsyncComponent({
  loader: () => import("./components/field/cityPicker.vue"),
  loadingComponent: SfSkeleton,
  delay: 0,
});

const resumeStore = useResumeStore();
const { currentData, runtimeConfig } = storeToRefs(resumeStore);
let keyboardFocusPending = false;
// 触摸与手写笔直接操作表单时不更新预览提示，避免辅助重绘干扰控件激活。
const isDirectPointerInteraction = (event) => {
  if (event.pointerType) return event.pointerType !== "mouse";
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
};
// 捕获鼠标点击与键盘焦点，定位所属模块与子记录，不触发预览滚动。
const markEditingModule = (event, allowDirectPointer = false) => {
  if (!allowDirectPointer && isDirectPointerInteraction(event)) return;
  const target = event.target instanceof Element ? event.target : null;
  const itemIndexValue = target?.closest("[data-item-index]")?.dataset.itemIndex;
  const parsedItemIndex = itemIndexValue == null ? null : Number(itemIndexValue);
  const itemIndex = Number.isInteger(parsedItemIndex) ? parsedItemIndex : null;
  let node = target?.closest("[data-module-key]") ?? null;
  while (node && event.currentTarget.contains(node)) {
    const key = node.dataset.moduleKey;
    if (runtimeConfig.value?.fields?.some((field) => field.key === key)) {
      // 值未变化时直接退出，避免重复触发预览重渲染
      if (
        resumeStore.editingModuleKey === key &&
        resumeStore.editingItemIndex === itemIndex
      ) return;
      // 再延后一轮事件循环，避开点击本身触发的输入框聚焦与光标定位
      window.setTimeout(() => {
        resumeStore.editingModuleKey = key;
        resumeStore.editingItemIndex = itemIndex;
      }, 0);
      return;
    }
    node = node.parentElement?.closest("[data-module-key]");
  }
};
// 只有用户按 Tab 切换焦点时才允许焦点事件激活模块，忽略组件初始化产生的自动聚焦。
const prepareKeyboardModuleFocus = (event) => {
  if (event.key !== "Tab") return;
  keyboardFocusPending = true;
  window.setTimeout(() => {
    keyboardFocusPending = false;
  }, 0);
};
const markKeyboardEditingModule = (event) => {
  if (!keyboardFocusPending) return;
  markEditingModule(event, true);
};
// 删除当前模块后清除提示，隐藏不改变原有显示状态。
watch(
  () => {
    const key = resumeStore.editingModuleKey;
    return key && runtimeConfig.value?.fields?.some((field) => field.key === key);
  },
  (exists) => {
    if (!exists) {
      resumeStore.editingModuleKey = null;
      resumeStore.editingItemIndex = null;
    }
  },
);
const localizedResumeOptions = computed(() => {
  // 读取当前语言建立依赖，选项显示文案随语言切换更新，保存值保持不变
  i18n.global.locale.value;
  return localizeResumeOptions(RESUME_OPTIONS);
});
const { markEditorStart, markEditorEnd } = useRuntimeData();
// 编辑区加载开始：组件初始化即记录，作为编辑区加载耗时起点
markEditorStart();

// 注入到动态表单的自定义组件库
// 编辑区组件按层级划分，配置里的 component 名对应关系如下：
// 折叠容器 collapseModule：模块标题 + 折叠/隐藏/删除，内容由插槽渲染
// 折叠容器 collapseItem：数组模块中单条记录的标题 + 折叠/隐藏/删除，内容由插槽渲染
// 行控件 rowField / rowAccount / rowSkill：一行内的字段编辑与隐藏/删除操作
const dynamicComponents = {
  collapseModule: CollapseModule,
  collapseItem: CollapseItem,
  collapseGroup: CollapseGroup, // 字段折叠分组：只收起字段，不做模块与记录操作
  rowField: RowField,
  rowAccount: RowAccount,
  rowSkill: RowSkill,
  imageUpload: AsyncImageUpload,
  avatarSettings: AvatarDropdown, // 统一表单标题行的头像设置操作。
  portfolio: Portfolio,
  heightWeight: HeightWeight,
  measurements: Measurements,
  positionPicker: PositionPicker,
  resumeContentEditor: ResumeContentEditor,
  salaryRange: SalaryRange,
  projectLink: ProjectLink,
  urlInput: UrlInput, // 链接地址统一提供协议前缀预选。
  publicationAuthors: PublicationAuthors,
  sizes: Sizes,
  more: More,
  subtitleBox: SubtitleBox,
  tag: Tag,
  cityPicker: AsyncCityPicker,
};
provide("sfBorder", "border border-sf-b hover:border-sf-theme");
// 配置同步由初始化事件收口，加载耗时另外等待可见控件就绪。
const { currentItem } = storeToRefs(resumeStore);
// 待完成的同步目标简历：由初始化事件收口，切换简历时丢弃过期回调。
let syncItem = null;
// 初始化后的监听先完成，再建立历史基线，避免补默认值进入用户历史。
const finishConfigSync = async (data) => {
  const item = currentItem.value;
  if (!item || item.data !== data) return;
  await nextTick();
  if (currentItem.value !== item || syncItem !== item) return;
  syncItem = null;
  resumeStore.enableHistory();
  resumeStore.setConfigSyncing(false);
};
watch(
  () => currentItem.value,
  (item) => {
    // 切换简历时丢弃上一份简历的编辑提示。
    resumeStore.editingModuleKey = null;
    resumeStore.editingItemIndex = null;
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
    // 同步完成交由挂载前初始化事件判定，避免默认值写入被记为历史。
    syncItem = item;
  },
  { immediate: true },
);
// 编辑标签重新激活后，等待表单进入页面再执行预览点击的定位。
onActivated(() => {
  nextTick(flushPendingEditorLocation);
});
// 离开编辑标签后不再显示正在编辑提示。
onDeactivated(() => {
  resumeStore.editingModuleKey = null;
  resumeStore.editingItemIndex = null;
});

const handleDynamicFormReady = (data) => {
  if (currentItem.value?.data !== data) return;
  // 当前可见异步字段与富文本均已就绪，才记录编辑区加载完成。
  markEditorEnd();
  nextTick(flushPendingEditorLocation);
};

onBeforeUnmount(() => {
  resumeStore.editingModuleKey = null;
  resumeStore.editingItemIndex = null;
  if (dynamicFormTimer !== null) window.clearTimeout(dynamicFormTimer);
  // 失效待完成的同步，避免卸载后开启历史记录
  syncItem = null;
  resumeStore.disableHistory();
});
</script>

<template>
  <div
    class="relative h-full"
    @click.capture="markEditingModule"
    @keydown.capture="prepareKeyboardModuleFocus"
    @focusin.capture="markKeyboardEditingModule"
  >
    <div class="flex h-full min-h-0 w-full">
      <ModuleSidebar />
      <SfScrollbar class="resume-editor-form relative h-full min-h-0">
        <FormLoading v-if="!showDynamicForm || !runtimeConfig" />
        <!-- 顶层模块列表增加间距 -->
        <AsyncDynamicForm
          v-else
          class="py-3 [&>.el-row]:gap-3"
          v-model:form="runtimeConfig"
          v-model:data="currentData"
          :components="dynamicComponents"
          :options="localizedResumeOptions"
          :use-rules="false"
          @initialized="finishConfigSync"
          @ready="handleDynamicFormReady"
        />
      </SfScrollbar>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.resume-editor-form {
  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper),
  :deep(.el-textarea__inner),
  :deep(.sf-wang-editor) {
    border: 1px solid var(--sf-border);
    border-radius: 24px !important;
  }

  :deep(.el-input__wrapper:hover),
  :deep(.el-select__wrapper:hover),
  :deep(.el-textarea__inner:hover),
  :deep(.sf-wang-editor:hover) {
    border-color: var(--sf-theme);
  }

  // 专业技能与个人优势由模块外框承载，内部编辑器去掉重复边框和圆角。
  :deep(:is([data-module-key="skill"], [data-module-key="advantage"]) .sf-wang-editor) {
    border: none !important;
    border-radius: 0 !important;
    // 编辑区背景跟随模块外框的主要色，不再沿用面板统一的背景色
    background-color: var(--sf-primary) !important;
  }

  // 工具栏与底部操作区同步保持直角，避免内部仍出现圆角卡片。
  :deep(:is([data-module-key="skill"], [data-module-key="advantage"]) .sf-wang-editor .w-e-bar),
  :deep(
    :is([data-module-key="skill"], [data-module-key="advantage"]) .sf-wang-editor .rounded-b-3xl
  ),
  :deep(
    :is([data-module-key="skill"], [data-module-key="advantage"]) .sf-wang-editor .rounded-b-2xl
  ) {
    border-radius: 0 !important;
  }
}
</style>
