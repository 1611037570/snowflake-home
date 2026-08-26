<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import Account from "./components/account.vue";
import AddModule from "./components/addModule.vue";
import BoxCollapse from "./components/boxCollapse.vue";
import Education from "./components/education.vue";
import ItemCollapse from "./components/itemCollapse.vue";
import ImageUpload from "./components/imageUpload.vue";

const resumeStore = useResumeStore();
const { currentData, currentConfig, currentFixedConfig } = storeToRefs(resumeStore);

// 注入到动态表单的自定义组件库
const dynamicComponents = {
  education: Education,
  boxCollapse: BoxCollapse,
  itemCollapse: ItemCollapse,
  account: Account,
  imageUpload: ImageUpload,
};
</script>

<template>
  <SfDynamicForm v-model:form="currentFixedConfig" v-model:data="currentData" />
  <SfDynamicForm
    v-model:form="currentConfig"
    v-model:data="currentData"
    :components="dynamicComponents"
  />
  <AddModule />
</template>

<style lang="scss" scoped></style>
