<script setup>
import { useResumeStore } from '@/stores'
import Header from '@/views/resume/builder/components/header.vue'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import ResumeActions from './components/actions.vue'
import AddModule from './components/addModule.vue'
import BoxCollapse from './components/boxCollapse.vue'
import Education from './components/education.vue'
import ItemCollapse from './components/itemCollapse.vue'
import Project from './components/project.vue'
import SocialAccount from './components/socialAccount.vue'
import TitleEditor from './components/titleEditor.vue'
import Work from './components/work.vue'

const resumeStore = useResumeStore()
const { currentData, currentConfig, currentFixedConfig } = storeToRefs(resumeStore)

const title = ref('小羊-本科-前端开发-3年经验')
const titleEditorRef = ref(null)

// 注入到动态表单的自定义组件库
const dynamicComponents = {
  work: Work,
  education: Education,
  project: Project,
  boxCollapse: BoxCollapse,
  itemCollapse: ItemCollapse,
  socialAccount: SocialAccount,
}

function handleEditTitle() {
  titleEditorRef.value?.openModal()
}
</script>

<template>
  <div class="relative flex h-full flex-col overflow-hidden">
    <ResumeActions />
    <TitleEditor v-model="title" ref="titleEditorRef" />
    <Header>
      <div
        class="flex cursor-pointer items-center hover:text-sf-theme-hover"
        @click="handleEditTitle"
      >
        {{ title }}
        <SfIcon name="arrow-right" class="ml-2" size="5" />
      </div>
    </Header>
    <ElScrollbar class="w-full flex-1">
      <div class="px-3">
        <SfDynamicForm
          v-model:form="currentFixedConfig"
          v-model:data="currentData"
          :components="dynamicComponents"
          class="mb-3"
        />
        <SfDynamicForm
          v-model:form="currentConfig"
          v-model:data="currentData"
          :components="dynamicComponents"
          class="mb-3"
        />
        <AddModule />
      </div>
    </ElScrollbar>
  </div>
</template>

<style lang="scss" scoped></style>
