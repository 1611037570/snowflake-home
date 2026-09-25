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
import { $t } from "@/locales";
import BuilderEditorComponent from "./editor/index.vue";
// 编辑标签页外壳同步加载，动态表单在首帧后异步挂载
const BuilderEditor = markRaw(BuilderEditorComponent);
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
    name: $t("edit"),
    icon: "lucide:file-text",
    component: BuilderEditor,
  },
  {
    name: $t("ai"),
    icon: "lucide:sparkles",
    component: AsyncAi,
  },
  {
    name: $t("template"),
    icon: "lucide:layout-template",
    component: AsyncTemplate,
  },
]);

const activeMenu = computed(() => menuList.value[activeIndex.value] || menuList.value[0]);
</script>

<template>
  <SfResizable
    v-model:size="editorWidth"
    :min="360"
    :max="500"
    position="right"
    class="mobile-resume-builder relative flex h-full flex-col py-3"
  >
    <SfTab
      :list="menuList"
      v-model:index="activeIndex"
      v-model:disabled="isGenerating"
      boxClass="border-y border-r border-sf-b bg-sf-primary rounded-none md:rounded-r-3xl!"
      class="mb-3 rounded-none md:rounded-r-3xl!"
    />
    <div
      class="relative flex min-h-0 w-full flex-1 flex-col rounded-none border-y border-r border-sf-b bg-sf-primary py-3 text-sf-base md:rounded-r-3xl"
    >
      <div class="flex min-h-0 w-full flex-1 flex-col">
        <Transition :name="`tab-slide-${direction}`" mode="out-in">
          <!-- 仅缓存编辑与模板组件：编辑器默认加载并缓存，模板首次打开才异步加载，之后缓存 -->
          <KeepAlive>
            <component :is="activeMenu.component" class="h-full w-full" />
          </KeepAlive>
        </Transition>
      </div>
    </div>
  </SfResizable>
</template>

<style lang="scss" scoped>
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

<style scoped>
@media (max-width: 767px) {
  :global(.mobile-resume-builder) {
    width: 100% !important;
  }

  :global(.mobile-resume-builder > div:last-child) {
    display: none;
  }
}
</style>
