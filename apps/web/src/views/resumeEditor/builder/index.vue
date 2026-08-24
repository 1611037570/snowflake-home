<script setup>
import { markRaw, ref } from "vue";
import GeneratingMask from "../components/generatingMask.vue";
import Custom from "./page/custom/index.vue";
import Editor from "./page/editor/index.vue";
import Template from "./page/template/index.vue";

// 菜单配置
const menuList = [
  {
    name: "简历",
    icon: "lucide:file-text",
    component: markRaw(Editor),
  },
  {
    name: "模板",
    icon: "lucide:layout-template",
    component: markRaw(Template),
  },
  {
    name: "自定义",
    icon: "lucide:palette",
    component: markRaw(Custom),
  },
];

// 当前选中的菜单索引
const activeIndex = ref(0);
provide("bg", "bg-sf-bg");
</script>

<template>
  <div class="relative flex h-full w-[380px] flex-col py-3 pl-3">
    <SfTab
      :list="menuList"
      v-model:index="activeIndex"
      boxClass="border border-sf-b bg-sf-primary"
      class="mb-3"
    />
    <div
      class="flex min-h-0 w-full flex-1 flex-col rounded-xl border border-sf-b bg-sf-primary py-3 text-sf-base"
    >
      <SfScrollbar>
        <KeepAlive>
          <component :is="menuList[activeIndex].component" class="h-full" />
        </KeepAlive>
      </SfScrollbar>
    </div>
    <GeneratingMask v-if="true" />
  </div>
</template>

<style lang="scss" scoped>
.sidebar {
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.1);
}
</style>
