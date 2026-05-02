<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import ResumeActions from './components/actions.vue'
import AddModule from './components/addModule.vue'
import BoxCollapse from './components/boxCollapse.vue'
import Custom from './components/custom.vue'
import Education from './components/education.vue'
import ItemCollapse from './components/itemCollapse.vue'
import Project from './components/project.vue'
import SocialAccount from './components/socialAccount.vue'
import Work from './components/work.vue'

const resumeStore = useResumeStore()
const { currentData, currentConfig, currentFixedConfig } = storeToRefs(resumeStore)

// 注入到动态表单的自定义组件库
const dynamicComponents = {
  work: Work,
  education: Education,
  project: Project,
  custom: Custom,
  boxCollapse: BoxCollapse,
  itemCollapse: ItemCollapse,
  socialAccount: SocialAccount,
}
</script>

<template>
  <div class="relative flex h-full flex-col overflow-hidden">
    <ResumeActions />

    <SfDynamicForm
      v-model:form="currentFixedConfig"
      v-model:data="currentData"
      :components="dynamicComponents"
    />
    <div class="pt-3"></div>
    <SfDynamicForm
      v-model:form="currentConfig"
      v-model:data="currentData"
      :components="dynamicComponents"
    />
    <AddModule />
  </div>
</template>

<style lang="scss" scoped></style>
