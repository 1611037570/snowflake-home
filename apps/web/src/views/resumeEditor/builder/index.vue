<script setup>
import { markRaw, ref } from "vue";
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
</script>

<template>
  <div class="relative my-3 ml-3 flex w-[380px] flex-col">
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
