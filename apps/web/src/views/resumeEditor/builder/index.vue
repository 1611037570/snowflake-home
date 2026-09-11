<script setup>
import { useResumeStore } from "@/stores";
import {
  computed,
  defineAsyncComponent,
  markRaw,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { storeToRefs } from "pinia";
import eventBus from "@/utils/modules/eventBus";
const AsyncEditor = markRaw(defineAsyncComponent(() => import("./editor/index.vue")));
const AsyncCustom = markRaw(defineAsyncComponent(() => import("./custom/index.vue")));
const AsyncTemplate = markRaw(defineAsyncComponent(() => import("./template/index.vue")));
const AsyncAi = markRaw(defineAsyncComponent(() => import("../assistant/chat/index.vue")));
// 当前选中的菜单索引
const activeIndex = ref(0);
// 切换方向：索引增大为 right（新内容从右侧滑入），减小为 left
const direction = ref("right");
watch(activeIndex, (val, old) => {
  direction.value = val > old ? "right" : "left";
});
provide("bg", "bg-sf-bg");

// 监听模块导航跳转，切换回编辑标签
const switchTab = (index) => {
  activeIndex.value = index;
};
onMounted(() => eventBus.on("switch-builder-tab", switchTab));
onBeforeUnmount(() => {
  eventBus.off("switch-builder-tab", switchTab);
});

const resumeStore = useResumeStore();
const { editorWidth, isGenerating } = storeToRefs(resumeStore);

// 菜单配置
const menuList = computed(() => [
  {
    name: "编辑",
    icon: "lucide:file-text",
    component: AsyncEditor,
  },
  {
    name: "AI编辑",
    icon: "lucide:palette",
    component: AsyncAi,
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
]);

// 菜单项减少时修正当前索引，避免主窗口渲染不存在的组件
watch(menuList, (list) => {
  if (list.length && activeIndex.value >= list.length) {
    activeIndex.value = list.length - 1;
  }
});

const activeMenu = computed(() => menuList.value[activeIndex.value] || menuList.value[0]);
</script>

<template>
  <SfResizable
    v-model:size="editorWidth"
    :min="360"
    :max="500"
    position="right"
    class="relative flex h-full flex-col py-3"
  >
    <SfTab
      :list="menuList"
      v-model:index="activeIndex"
      v-model:disabled="isGenerating"
      boxClass=" border-y border-r border-sf-b bg-sf-primary rounded-none  rounded-r-3xl!"
      class="mb-3 rounded-r-3xl!"
    />
    <div
      class="flex min-h-0 w-full flex-1 flex-col rounded-r-3xl border-y border-r border-sf-b bg-sf-primary py-3 text-sf-base"
    >
      <div class="flex min-h-0 flex-1 flex-col">
        <Transition :name="`tab-slide-${direction}`" mode="out-in">
          <!-- 仅缓存编辑与模板组件：编辑器默认加载并缓存，模板首次打开才异步加载，之后缓存 -->
          <KeepAlive>
            <component :is="activeMenu.component" class="h-full" />
          </KeepAlive>
        </Transition>
      </div>
    </div>
  </SfResizable>
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
