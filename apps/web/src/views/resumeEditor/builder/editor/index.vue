<script setup>
import { useResumeStore } from "@/stores";
import { storeToRefs } from "pinia";
import Account from "./components/account.vue";
import AddModule from "./components/addModule.vue";
import BoxCollapse from "./components/boxCollapse.vue";
import Custom from "./components/custom.vue";
import Education from "./components/education.vue";
import ItemCollapse from "./components/itemCollapse.vue";
import Project from "./components/project.vue";
import Work from "./components/work.vue";

const resumeStore = useResumeStore();
const { currentData, currentConfig, currentFixedConfig } = storeToRefs(resumeStore);

// 注入到动态表单的自定义组件库
const dynamicComponents = {
  work: Work,
  education: Education,
  project: Project,
  custom: Custom,
  boxCollapse: BoxCollapse,
  itemCollapse: ItemCollapse,
  account: Account,
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
