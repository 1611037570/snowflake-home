<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import { markRaw, onBeforeUnmount, onMounted, ref } from "vue";
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
provide("bg", "bg-sf-bg");

// 监听模块导航跳转，切换回编辑标签
const switchTab = (index) => {
  activeIndex.value = index;
};
onMounted(() => eventBus.on("switch-builder-tab", switchTab));
onBeforeUnmount(() => eventBus.off("switch-builder-tab", switchTab));

// 专注写作模式下编辑区宽度
const { focusMode } = storeToRefs(useResumeStore());
</script>

<template>
  <div class="relative my-3 ml-3 flex flex-col" :class="focusMode ? 'w-[420px]' : 'w-[380px]'">
    <SfTab
      :list="menuList"
      v-model:index="activeIndex"
      boxClass="border border-sf-b bg-sf-primary rounded-2xl"
      class="mb-3"
    />
    <div
      class="flex min-h-0 w-full flex-1 flex-col rounded-3xl border border-sf-b bg-sf-primary py-3 text-sf-base"
    >
      <SfScrollbar>
        <KeepAlive>
          <component :is="menuList[activeIndex].component" class="h-full" />
        </KeepAlive>
      </SfScrollbar>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sidebar {
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
}
</style>
