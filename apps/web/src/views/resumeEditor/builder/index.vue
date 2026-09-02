<script setup>
import { useResumeStore } from "@/stores";
import { DEFAULT_EDITOR } from "@/stores/modules/resume/defaultConfig";
import { storeToRefs } from "pinia";
import { markRaw, onBeforeUnmount, onMounted, ref, watch } from "vue";
import eventBus from "@/utils/modules/eventBus";
import Custom from "./custom/index.vue";
import Editor from "./editor/index.vue";
import Template from "./template/index.vue";

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
    component: markRaw(Custom),
  },
  {
    name: "模板",
    icon: "lucide:layout-template",
    component: markRaw(Template),
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

// 监听模块导航跳转，切换回编辑标签
const switchTab = (index) => {
  activeIndex.value = index;
};
onMounted(() => eventBus.on("switch-builder-tab", switchTab));
onBeforeUnmount(() => eventBus.off("switch-builder-tab", switchTab));

// 专注写作模式下编辑区宽度
const { focusMode } = storeToRefs(useResumeStore());
// 编辑器区域宽度：读取编辑器配置，专注模式保持固定 420px
const editorWidth = DEFAULT_EDITOR.editorWidth;
</script>

<template>
  <div
    class="relative my-3 flex flex-col"
    :style="{ width: (focusMode ? 420 : editorWidth) + 'px' }"
  >
    <SfTab
      :list="menuList"
      v-model:index="activeIndex"
      boxClass="border border-sf-b bg-sf-primary  hover:border-sf-theme-2 rounded-none  rounded-r-3xl!"
      class="mb-3 rounded-r-3xl!"
    />
    <div
      class="flex min-h-0 w-full flex-1 flex-col rounded-r-3xl border border-sf-b bg-sf-primary py-3 text-sf-base hover:border-sf-theme-2"
    >
      <div class="flex min-h-0 flex-1 flex-col">
        <Transition :name="`tab-slide-${direction}`" mode="out-in">
          <KeepAlive>
            <component :is="menuList[activeIndex].component" class="h-full" />
          </KeepAlive>
        </Transition>
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
