<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import Account from "./components/account.vue";
import AddModule from "./components/addModule.vue";
import BoxCollapse from "./components/boxCollapse.vue";
import HiddenModules from "./components/hiddenModules.vue";
import ItemCollapse from "./components/itemCollapse.vue";
import ImageUpload from "./components/imageUpload/index.vue";

const resumeStore = useResumeStore();
const { currentData, currentConfig, currentFixedConfig } = storeToRefs(resumeStore);

// 注入到动态表单的自定义组件库
const dynamicComponents = {
  boxCollapse: BoxCollapse,
  itemCollapse: ItemCollapse,
  account: Account,
  imageUpload: ImageUpload,
};
</script>

<template>
  <SfScrollbar class="h-full">
    <div class="flex w-full flex-col">
      <SfDynamicForm
        v-model:form="currentFixedConfig"
        v-model:data="currentData"
        :components="dynamicComponents"
      />
      <SfDynamicForm
        v-model:form="currentConfig"
        v-model:data="currentData"
        :components="dynamicComponents"
      />
      <HiddenModules />
      <AddModule />
    </div>
  </SfScrollbar>
</template>

<style lang="scss" scoped></style>
