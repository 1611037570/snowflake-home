<script setup>
import { useResumeStore } from "@/stores";
import { DEFAULT_EDITOR } from "@/stores/modules/resume/defaultConfig";
import { storeToRefs } from "pinia";
import {
  defineAsyncComponent,
  markRaw,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import eventBus from "@/utils/modules/eventBus";
import Editor from "./editor/index.vue";
const AsyncCustom = markRaw(defineAsyncComponent(() => import("./custom/index.vue")));
const AsyncTemplate = markRaw(
  defineAsyncComponent({
    loader: () => import("./template/index.vue"),
    name: "BuilderTemplate", // 显式设置异步组件的名称
  }),
);
// 菜单配置
const menuList = [
  {
    name: "编辑",
    icon: "lucide:file-text",
    component: markRaw(Editor),
  },
  {
    name: "设计",
    icon: "lucide:palette",
    component: AsyncCustom,
  },
  {
    name: "模板",
    icon: "lucide:layout-template",
    component: AsyncTemplate,
  },
];

// 当前选中的菜单索引
const activeIndex = ref(0);
// 切换方向：索引增大为 right（新内容从右侧滑入），减小为 left
const direction = ref("right");
watch(activeIndex, (val, old) => {
  direction.value = val > old ? "right" : "left";
});
provide("bg", "bg-sf-bg");

// 配置同步：进入或切换简历时由本组件触发，完成前展示加载效果避免白屏
const resumeStore = useResumeStore();
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
    // 同步期间暂停历史记录，避免初始化与同步产生的自动变更写入历史
    resumeStore.disableHistory();
    configSyncing.value = true;
    // 延后到加载效果渲染后再同步，避免同步期间内容区白屏
    const targetItem = item;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      if (currentItem.value !== targetItem) return;
      resumeStore.syncConfigByData();
      configSyncing.value = false;
      // 表单完成渲染后开启历史记录开关
      nextTick(() => {
        nextTick(() => {
          if (!mounted || currentItem.value !== targetItem) return;
          resumeStore.enableHistory();
        });
      });
    }, 0);
  },
  { immediate: true },
);

// 监听模块导航跳转，切换回编辑标签
const switchTab = (index) => {
  activeIndex.value = index;
};
onMounted(() => eventBus.on("switch-builder-tab", switchTab));
onBeforeUnmount(() => {
  mounted = false;
  clearTimeout(syncTimer);
  resumeStore.disableHistory();
  eventBus.off("switch-builder-tab", switchTab);
});

// 编辑器区域宽度：读取编辑器配置，专注模式保持固定 420px
const editorWidth = DEFAULT_EDITOR.editorWidth;
</script>

<template>
  <div class="relative my-3 flex flex-col" :style="{ width: editorWidth + 'px' }">
    <SfTab
      :list="menuList"
      v-model:index="activeIndex"
      boxClass=" border-y border-r border-sf-b bg-sf-primary  hover:border-sf-theme-2 rounded-none  rounded-r-3xl!"
      class="mb-3 rounded-r-3xl!"
    />
    <div
      class="relative flex min-h-0 w-full flex-1 flex-col rounded-r-3xl border-y border-r border-sf-b bg-sf-primary py-3 text-sf-base hover:border-sf-theme-2"
    >
      <div class="flex min-h-0 flex-1 flex-col">
        <Transition :name="`tab-slide-${direction}`" mode="out-in">
          <!-- 仅缓存编辑与模板组件：编辑器默认加载并缓存，模板首次打开才异步加载，之后缓存 -->
          <KeepAlive>
            <component :is="menuList[activeIndex].component" class="h-full" />
          </KeepAlive>
        </Transition>
      </div>
      <!-- 配置同步完成前展示加载效果，避免内容区白屏 -->
      <div
        v-if="configSyncing"
        class="absolute inset-0 z-10 flex items-center justify-center gap-3 rounded-r-3xl bg-sf-page"
      >
        <SfIcon icon="line-md:loading-twotone-loop" size="6" />
        <span class="text-sm text-sf-text-2">正在加载配置</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sidebar {
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
}

/* 内容切换滑动动画：向右切换（right）/ 向左切换（left） */
.tab-slide-right-enter-active,
.tab-slide-right-leave-active,
.tab-slide-left-enter-active,
.tab-slide-left-leave-active {
  transition:
    transform 0.1s ease,
    opacity 0.1s ease;
}

.tab-slide-right-enter-from {
  transform: translateX(24px);
  opacity: 0;
}

.tab-slide-right-leave-to {
  transform: translateX(-24px);
  opacity: 0;
}

.tab-slide-left-enter-from {
  transform: translateX(-24px);
  opacity: 0;
}

.tab-slide-left-leave-to {
  transform: translateX(24px);
  opacity: 0;
}
</style>
