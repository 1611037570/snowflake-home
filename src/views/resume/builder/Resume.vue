<script setup>
import { useResumeStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import AddModule from './components/AddModule.vue'
import ResumeActions from './components/ResumeActions.vue'
import Title from './title.vue'
import TitleEditor from '../components/TitleEditor.vue'
import Education from './components/education/education.vue'
import Skill from './components/skill.vue'
import Work from './components/work/work.vue'

const resumeStore = useResumeStore()
const { currentData, currentConfig } = storeToRefs(resumeStore)

const title = ref('小羊-本科-前端开发-3年经验')
const titleEditorRef = ref(null)

// 注入到动态表单的自定义组件库
const dynamicComponents = {
  work: Work,
  education: Education,
  skill: Skill,
}

function handleEditTitle() {
  titleEditorRef.value?.openModal()
}
</script>

<template>
  <div class="relative flex flex-1 flex-col p-4">
    <ResumeActions />

    <TitleEditor v-model="title" ref="titleEditorRef" />
    <div
      class="flex cursor-pointer items-center hover:text-sf-theme-hover"
      @click="handleEditTitle"
    >
      {{ title }}
      <SfIcon name="arrow-right" class="ml-2" size="5" />
    </div>
    <ElScrollbar class="flex-1">
      <template v-for="item in currentConfig" :key="item.key">
        <Title :title="item.key" />
        <SfDynamicForm
          :form="item.form"
          :data="currentData"
          :components="dynamicComponents"
        ></SfDynamicForm>
      </template>
      <AddModule />
    </ElScrollbar>
  </div>
</template>

<style lang="scss" scoped></style>
